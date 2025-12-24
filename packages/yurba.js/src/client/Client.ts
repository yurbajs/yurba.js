import { REST } from '@yurbajs/rest';
import { EventEmitter } from 'events';
import * as pkg from '../../package.json';
import {
  CommandArgsSchema,
  CommandHandler,
  Message,
  WebSocketError,
  ApiRequestError,
  ClientOptions,
  MiddlewareFunction,
  MiddlewareConfig,
  WSEvent,
  SendMessagePayload,
  Dialog,
  User,
  Photo
} from '@yurbajs/types';

import WSM from '../managers/websocket';
import MessageManager from '../managers/Message';
import CommandManager from '../managers/Command';
import MiddlewareManager from '../managers/Middleware';
import UserManager from '../managers/UserManager';
import UserClientManager from '../managers/UserClientManager';

import { YurbajsError, ErrorCodes } from '../errors'

import { CDLog } from '../utils/devlog';
const logging = CDLog('Client');
const log = (...args: unknown[]): void => { logging.debug(...args); };
const erlog = (...args: unknown[]): void => { logging.error(...args); };

/**
 * Main class for working with Yurba API
 *
 * The Client class is the main entry point for interacting with the Yurba.one platform.
 * It provides methods for sending messages, registering commands, handling events,
 * and managing bot functionality.
 *
 * @example Basic usage
 * ```typescript
 * import { Client } from 'yurba.js';
 *
 * const client = new Client();
 *
 * client.registerCommand('hello', { name: 'string' }, (message, args) => {
 *   message.reply(`Hello, ${args.name}!`);
 * });
 *
 * client.on('ready', () => {
 *   console.log('Bot is ready!');
 * });
 *
 * client.init('your-token-here');
 * ```
 *
 * @example With options
 * ```typescript
 * const client = new Client({
 *   prefix: '!',
 *   maxReconnectAttempts: 10
 * });
 * ```
 *
 * @public
 * @extends EventEmitter
 * @category Client
 */
class Client extends EventEmitter {
  // Options
  private token: string | boolean | undefined; // !WARN: token type includes boolean which seems incorrect - should be string | undefined
  public prefix: string = '/';

  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private wsmMessageSubscribed: boolean = false; // * Use Set or Map for better event subscription tracking
  private intents: string[] = []; // * Consider using enum or constants for intent validation

  // REST
  public readonly api: REST;

  // Public Managers
  public readonly users: UserManager;
  public readonly userClient: UserClientManager;

  // System Managers
  private wsm!: WSM; // !WARN: Definite assignment assertion without null checks - potential runtime errors
  private messageManager!: MessageManager; // !WARN: Same issue - should initialize or add null checks
  private commandManager: CommandManager;
  private middlewareManager!: MiddlewareManager; // !WARN: Same issue


  // Other
  private _dialogs?: Dialog[];
  private isReady: boolean = false;


  /**
   * Create a Client
   *
   * @param options - Client configuration options
   * @param options.prefix - Command prefix (default: '/')
   * @param options.maxReconnectAttempts - Maximum reconnection attempts (default: 5)
   * @param options.intents - Array of intents (e.g., ['dialogs'])
   *
   * @example
   * ```typescript
   * const client = new Client({
   *   prefix: '!',
   *   maxReconnectAttempts: 10,
   *   intents: ['dialogs']
   * });
   * ```
   */
  constructor(options: ClientOptions = {}) {
    super();

    this.prefix = options.prefix || '/';
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.intents = options.intents || [];

    this.api = new REST();

    this.middlewareManager = new MiddlewareManager();
    this.messageManager = new MessageManager(this);
    this.users = new UserManager(this, this.api);
    this.userClient = new UserClientManager(this.api);
    
    this.commandManager = new CommandManager(
      {
        sendMessage: this.sendMessage.bind(this),
        deleteMessage: this.deleteMessage.bind(this),
      },
      (userTag: string) => this.users?.fetch(userTag)
    );

    Object.defineProperty(this, 'token', { 
      value: undefined, 
      writable: true, 
      enumerable: false, 
      configurable: true 
    }); // ? Why use Object.defineProperty instead of private field? This adds complexity

    const envToken = process.env.YURBA_TOKEN || process.env.YTOKEN;

    if (!this.token && envToken) {
      /**
       * Authorization token for the logged in bot.
       * @type {?string}
       */
      this.token = envToken;
    } else {
      this.token = undefined; // * Redundant assignment - token is already undefined
    }
  }

  /**
   * Gets bot user data (synchronous)
   * @returns User | null Bot user data or null if loading
   */
  get user(): User | null {
    return this.userClient.get();
  }

  /**
   * Getter for bot user dialogs
   * @returns {Dialog[]} Dialogs 
   */
  get dialogs(): Dialog[] | undefined {
    // зроби якщо dialogs немає то запить api.dialogs.getAll():
    // + кешування на 2 хвилини
    if (!this._dialogs) this.api.dialogs.getAll() // !WARN: Async operation in getter without error handling - can cause unhandled promise rejections
      .then((dialogs: Dialog[]) => {
        this._dialogs = dialogs;
        return this._dialogs; // * Unnecessary return in promise chain
      }); // !WARN: Missing .catch() for error handling
    return this._dialogs; // !WARN: Returns undefined while async operation is pending - confusing behavior
  }


  /**
   * Registers a new command
   * @param command Command name
   * @param argsSchema Command arguments schema
   * @param handler Command handler
   *
   * @example
   * client.registerCommand('hello', { name: 'string' }, (message, args) => {
   *   console.log(`Hello, ${args.name}!`);
   * });
   *
   * @example
   * client.registerCommand('add', { a: 'int', b: 'int' }, (message, args) => {
   *   const sum = args.a + args.b;
   *   message.reply(`The sum is ${sum}`);
   * });
   */
  // TODO: треба буде переробити, типу додати ще інші хуйні типу cooldown і тд, та і переробити цю хуйню
  // !WARN: Inappropriate language in comments - should be professional
  // * Add validation for command name (empty string, duplicates, reserved words)
  registerCommand(
    command: string,
    argsSchema: CommandArgsSchema,
    handler: CommandHandler
  ): void {
    this.commandManager.registerCommand(command, argsSchema, handler);
  }


  /**
   * Returns list of registered commands
   * @returns {string[]} Array of command names
   *
   * @example
   * const commands = client.getCommands();
   * console.log('Registered commands:', commands);
   * // Result: Registered commands: [ 'info', 'help' ]
   */
  public getCommands(): string[] {
    return this.commandManager.getCommands();
  }

  /**
   * Initializes the client
   * @returns Promise that resolves after successful initialization
   */
  async init(token = this.token): Promise<void> {
    this.token = token // * Missing semicolon

    if (!this.token) {
       throw new YurbajsError(ErrorCodes.TokenMissing);
    }
    if (typeof this.token !== 'string' || !this.token.startsWith('y.') || this.token.length < 34) {
      throw new YurbajsError(ErrorCodes.TokenInvalid); // * Magic number 34 should be a constant
    }

    // Встановлюємо токен для існуючого API клієнта
    this.api.setToken(this.token);
    this.wsm = new WSM(this.token);

    // Set up event handlers for reconnection
    this.wsm.on('close', () => {
      this.isReady = false;
      this.handleReconnect();
    });

    this.wsm.on('error', () => {
      this.isReady = false;
      this.handleReconnect();
    });


    try {
      await this.userClient.fetch();

      if (this.intents.includes('dialogs')) {
        const dialogs = await this.api.dialogs.getAll();
        this._dialogs = dialogs;
      }

      this.wsm.once('ready', () => {
        this.isReady = true;
        this.reconnectAttempts = 0;
        this.emit('ready');
      });

      // Захист від подвійної підписки на подію message
      if (!this.wsmMessageSubscribed) {
        this.wsm.on('message', (message: any) => { // !WARN: Using 'any' type loses type safety
          log('YURBA.JS ::', JSON.stringify(message, null, 2)) // * Missing semicolon
          this.handleMessage(message) // * Missing semicolon and no error handling
        }
        );
        this.wsmMessageSubscribed = true; // * Boolean flag is fragile - consider using WeakSet or other tracking
      }

      await this.wsm.connect(this._dialogs || []);
    } catch (error) {
      erlog('Failed to initialize clientі:', error); // !WARN: Typo in error message ('clientі' should be 'client')
      throw new ApiRequestError(
        `Failed to initialize client: ${error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        '/get_me' // ? Why hardcoded '/get_me' endpoint when error might be from other operations?
      );
    }
  }



  /**
   * Handles WebSocket reconnection
   * @private
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      erlog('Maximum reconnect attempts reached');
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectAttempts++;
    log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(async () => {
      try {
        await this.wsm.connect(this._dialogs || []);
      } catch (error) {
        const wsError = new WebSocketError(
          `Reconnect failed: ${error instanceof Error ? error.message : String(error)
          }`
        );
        erlog('Reconnect failed:', wsError);
        this.emit('reconnectError', wsError);
        // !WARN: No recursive call to handleReconnect() - reconnection stops after first failure
      }
    }, 5000 * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    // * Consider adding jitter to prevent thundering herd problem
  }

  /**
   * Handles command messages
   * @param msg Message object
   * @private
   */
  private async handleCommandMessage(msg: Message): Promise<void> {
    try {
      await this.commandManager.handleCommand(
        msg,
        this.messageManager.enhanceMessage.bind(this.messageManager)
      );
    } catch (err) {
      this.emit('commandError', { error: err, message: msg });
      // Тільки викликати unknownCommand якщо це справді невідома команда
      if (err instanceof Error && err.message?.includes('Command "') && err.message?.includes('" not found.')) {
        this.emit('unknownCommand', msg.Text, msg); // !WARN: Fragile string matching for error detection - use error codes instead
      }
    }
  }

  /**
   * Handles incoming messages
   * Delegates message handling to MessageManager and command execution to CommandManager
   * Emits events for other handlers
   * @param message Incoming message object
   * @private
   */
  private async handleMessage(message: WSEvent): Promise<void> {
    try {
      this.emit('raw', message);
      const msg = message;
      if ('Message' in msg) {
        switch (msg.Type) {
          case 'message':
            this.messageManager.enhanceMessage(msg.Message);
            switch (msg.Message.Type) {
              case undefined:
              case null:
              case '': // * Consider using a default case instead of multiple falsy checks
                if (msg.Message.Text.startsWith(this.prefix)) {
                  return await this.handleCommandMessage(msg.Message);
                } else {
                  this.emit('message', msg.Message) // * Missing semicolon
                }
                break // * Missing semicolon
              case 'join':
                this.emit('join', msg.Message) // * Missing semicolon
                break // * Missing semicolon
              case 'leave':
                this.emit('leave', msg.Message) // * Missing semicolon
                break // * Missing semicolon
            }
            break;
          case 'message_delete':
            this.emit('message_delete', msg.Message) // * Missing semicolon
            break;
          case 'read':
            this.emit('read', msg.Message) // * Missing semicolon
            break;
          case 'typing':
            this.emit('typing', msg.Message) // * Missing semicolon
            break;

          case 'notification':
            switch (msg.Message.Type) {
              case 'post_on_wall':
                this.emit('post_on_wall', msg.Message) // * Missing semicolon
                break;
              case 'post_like':
                this.emit('post_like', msg.Message) // * Missing semicolon
                break // * Missing semicolon
              case 'comment_post':
                this.emit('comment_post', msg.Message) // * Missing semicolon
                break // * Missing semicolon
            }
            break
          default:
            break;
        }

      }
    } catch (error) {
      erlog('Error handling message:', error);
      this.emit('error', error);
    }
  }

  /**
   * Waits for a specific event and resolves when the check function returns true
   *
   * @template T Type of arguments passed to the event
   * @param event Event name to listen for
   * @param check Function that receives event arguments and returns boolean,
   *              indicating whether the desired condition is met
   * @param options Additional parameters:
   *   - `timeout`: Maximum time to wait for the event in milliseconds. Default is 60000.
   *   - `multiple`: If true, resolves with all arguments as an array; otherwise resolves with the first argument or full array of arguments if there are multiple.
   *   - `signal`: AbortSignal to cancel the wait operation.
   * @returns Promise that resolves with event arguments when condition is met,
   *          or rejects if timeout is reached or operation is cancelled.
   *
   * @example 1
   * // Wait for a message with text "Hello"
   * await client.waitFor('message', msg => msg.Text === 'Hello', { timeout: 5000 });
   *
   * @example 2
   * // Wait for user event and get all arguments
   * const [arg1, arg2] = await client.waitFor('customEvent', () => true, { multiple: true });
   */
  async waitFor<T extends any[] = any[]>(
    event: string,
    check: (...args: T) => boolean,
    options: {
      timeout?: number;
      multiple?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<any> { // !WARN: Return type 'any' loses type safety - should be more specific
    const { timeout = 60000, multiple = false, signal } = options;

    return new Promise<any>((resolve, reject) => {
      let finished = false;

      const cleanup = () => {
        finished = true;
        clearTimeout(timeoutId);
        this.off(event, listener);
        if (signal) signal.removeEventListener('abort', abortHandler);
      };

      const timeoutId = setTimeout(() => {
        if (!finished) {
          cleanup();
          reject(new Error(`Timeout waiting for event: ${event}`)); // * Consider using custom error class for timeouts
        }
      }, timeout); // !WARN: No validation that timeout is positive number

      const abortHandler = () => {
        if (!finished) {
          cleanup();
          reject(new Error('Operation aborted'));
        }
      };

      if (signal) {
        if (signal.aborted) {
          cleanup();
          return reject(new Error('Operation aborted'));
        }
        signal.addEventListener('abort', abortHandler);
      }

      const listener = (...args: any[]) => {
        try {
          if (check(...(args as T))) {
            cleanup();
            if (multiple) {
              resolve(args);
            } else {
              resolve(args.length === 1 ? args[0] : args);
            }
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      this.on(event, listener);
    });
  }

  /**
   * Send message to dialog
   * @param dialogId - Dialog identifier
   * @param payload - {@link SendMessagePayload} Message data
   * @returns {Promise<Message>} {@link Message} Sent message
   * @example
   * ```javascript
   * // Text message
   * await client.sendMessage(123, { text: "Hello!" });
   *
   * // With photos and reply
   * await client.sendMessage(123, {
   *   text: "Check this",
   *   photos_list: [-1112],
   *   replyTo: 48561
   * });
   *
   * // With attachments
   * await client.sendMessage(123, {
   *   text: "Media",
   *   attachments: [
   *     { Type: "video", Item: 28 },
   *     { Type: "track", Item: 6422 },
   *     { Type: "file", Item: 684 },
   *     { Type: "post", Item: 3201 }
   *   ]
   * });
   *
   * // Edit message
   * await client.sendMessage(123, {
   *   text: "Updated",
   *   edit: 12345
   * });
   * ```
   */
  async sendMessage(
    dialogId: number, // * Add validation for positive integer
    payload: SendMessagePayload
  ): Promise<Message> {
    try {
      log(`Sending message to dialog ${dialogId}: ${payload.text}`);
      const response = await this.api.dialogs.sendMessage(dialogId, payload);
      log(`Message sent to dialog ${dialogId}: ${payload.text}`);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        erlog('Error sending message:', err.message);
      }
      throw err; // * Consider wrapping in custom error with more context
    }
  }

  /**
   * Gets user information by tag
   * @param userTag User tag
   * @returns Promise that resolves with user data
   */
  async getUser(userTag: string): Promise<User | null> {
    return this.users.fetch(userTag); // * Add validation for userTag format and length
  }

  /**
   * Gets a photo from Yurba
   * @param photoId Photo ID to retrieve
   * @returns Promise that resolves with API response
   */
  async getPhoto(photoId: string): Promise<Photo | null> {
    try {
      const response = await this.api.photos.get(photoId); // * Add validation for photoId format
      log(`Fetched photo ${photoId}`, response);
      return response;
    } catch (err) {
      erlog('Error getting photo:', err instanceof Error ? err.message : err);
      return null; // * Returning null on error might hide important failures
    }
  }

  /**
   * Deletes a message by its ID
   * @param ID Message ID to delete
   * @returns Promise that resolves with boolean indicating success
   */
  async deleteMessage(ID: number): Promise<boolean> { // * Parameter name 'ID' should be camelCase 'id'
    try {
      await this.api.dialogs.deleteMessage(ID); // * Add validation for positive integer ID
      return true;
    } catch (err) {
      erlog(
        'Error deleting message:',
        err instanceof Error ? err.message : err
      );
      return false; // * Boolean return doesn't provide error details to caller
    }
  }

  /**
   * Adds a listener for the specified event
   * @param event Event name or symbol
   * @param listener Callback function
   * @returns Client instance
   * @example
   * client.on('message', (msg) => {
   *   console.log('Received message:', msg);
   * });
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this { // * Using 'any[]' loses type safety
    return super.on(event, listener);
  }

  /**
   * Adds a one-time listener for the specified event
   * The listener is invoked only the next time the event is triggered, then removed
   * @param event Event name or symbol
   * @param listener Callback function
   * @returns Client instance
   * @example
   * client.once('ready', () => {
   *   console.log('Bot is ready!');
   * });
   */
  once(event: string | symbol, listener: (...args: any[]) => void): this { // * Using 'any[]' loses type safety
    return super.once(event, listener);
  }

  /**
   * Removes a listener for the specified event
   * @param event Event name or symbol
   * @param listener Callback function to remove
   * @returns Client instance
   * @example
   * const handler = (msg) => {};
   * client.on('message', handler);
   * client.off('message', handler);
   */
  off(event: string | symbol, listener: (...args: any[]) => void): this { // * Using 'any[]' loses type safety
    return super.off(event, listener);
  }

  /**
   * Emits the specified event with given arguments
   * @internal
   * @param event Event name or symbol
   * @param args Arguments to pass to event listeners
   * @returns True if the event had listeners, false otherwise
   * @example
   ```
    client.emit('customEvent', { foo: 'bar' });
   ```
   */
  emit(event: string | symbol, ...args: any[]): boolean { // * Using 'any[]' loses type safety
    return super.emit(event, ...args);
  }

  /**
   * Removes a specific listener from an event
   * Alias for off()
   * @param event Event name or symbol
   * @param listener Callback function to remove
   * @returns Client instance
   */
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void // * Using 'any[]' loses type safety
  ): this {
    return super.removeListener(event, listener);
  }

  /**
   * Removes all listeners or those specified for an event
   * @param event Event name or symbol (optional)
   * @returns Client instance
   * @example
   * client.removeAllListeners('message');
   */
  removeAllListeners(event?: string | symbol): this {
    return super.removeAllListeners(event);
  }

  /**
   * Adds a middleware function to execute for each incoming message
   * @param middleware Middleware function
   * @param config Middleware configuration
   */
  use(middleware: MiddlewareFunction, config?: MiddlewareConfig): void {
    this.middlewareManager.use(middleware, config); // !WARN: No validation that middlewareManager is initialized
  }

  /**
   * Removes middleware by name
   * @param name Middleware name
   * @returns Boolean indicating whether the middleware was removed
   */
  removeMiddleware(name: string): boolean {
    return this.middlewareManager.remove(name); // !WARN: No validation that middlewareManager is initialized
  }

  /**
   * Gets a list of all middleware
   * @returns Array of middleware configurations
   */
  getMiddlewares(): MiddlewareConfig[] {
    return this.middlewareManager.list(); // !WARN: No validation that middlewareManager is initialized
  }

  /**
   * Shows typing indicator in dialog
   * @param dialogId Dialog ID
   */
  typing(dialogId: number): void {
    this.wsm.send(JSON.stringify({ // !WARN: No error handling if wsm is not initialized or connection is closed
      command: 'typing',
      thing_id: dialogId // * Consider validating dialogId is positive integer
    }));
  }

}

const Version = pkg.version; // * Consider using named imports instead of namespace import
const Author = pkg.author; // * Consider using named imports instead of namespace import

export { Client, Version, Author };
