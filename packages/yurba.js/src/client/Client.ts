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
  private token: string | boolean | undefined;
  public prefix: string = '/';

  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private wsmMessageSubscribed: boolean = false;
  private intents: string[] = [];

  // REST
  public readonly api: REST;

  // Public Managers
  public readonly users: UserManager;
  public readonly userClient: UserClientManager;

  // System Managers
  private wsm!: WSM;
  private messageManager!: MessageManager;
  private commandManager: CommandManager;
  private middlewareManager!: MiddlewareManager;


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
    });

    const envToken = process.env.YURBA_TOKEN || process.env.YTOKEN;

    if (!this.token && envToken) {
      /**
       * Authorization token for the logged in bot.
       * @type {?string}
       */
      this.token = envToken;
    } else {
      this.token = undefined;
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
    if (!this._dialogs) this.api.dialogs.getAll()
      .then((dialogs: Dialog[]) => {
        this._dialogs = dialogs;
        return this._dialogs;
      });
    return this._dialogs;
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
    this.token = token

    if (!this.token) {
       throw new YurbajsError(ErrorCodes.TokenMissing);
    }
    if (typeof this.token !== 'string' || !this.token.startsWith('y.') || this.token.length < 34) {
      throw new YurbajsError(ErrorCodes.TokenInvalid);
    }

    // Встановлюємо токен для існуючого API клієнта
    this.api.setToken(token);
    this.wsm = new WSM(token);

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
        this.wsm.on('message', (message: any) => {
          log('YURBA.JS ::', JSON.stringify(message, null, 2))
          this.handleMessage(message)
        }
        );
        this.wsmMessageSubscribed = true;
      }

      await this.wsm.connect(this._dialogs || []);
    } catch (error) {
      erlog('Failed to initialize clientі:', error);
      throw new ApiRequestError(
        `Failed to initialize client: ${error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        '/get_me'
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
      }
    }, 5000 * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
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
        this.emit('unknownCommand', msg.Text, msg);
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
              case '':
                if (msg.Message.Text.startsWith(this.prefix)) {
                  return await this.handleCommandMessage(msg.Message);
                } else {
                  this.emit('message', msg.Message)
                }
                break
              case 'join':
                this.emit('join', msg.Message)
                break
              case 'leave':
                this.emit('leave', msg.Message)
                break
            }
            break;
          case 'message_delete':
            this.emit('message_delete', msg.Message)
            break;
          case 'read':
            this.emit('read', msg.Message)
            break;
          case 'typing':
            this.emit('typing', msg.Message)
            break;

          case 'notification':
            switch (msg.Message.Type) {
              case 'post_on_wall':
                this.emit('post_on_wall', msg.Message)
                break;
              case 'post_like':
                this.emit('post_like', msg.Message)
                break
              case 'comment_post':
                this.emit('comment_post', msg.Message)
                break
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
  ): Promise<any> {
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
          reject(new Error(`Timeout waiting for event: ${event}`));
        }
      }, timeout);

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
    dialogId: number,
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
      throw err;
    }
  }

  /**
   * Gets user information by tag
   * @param userTag User tag
   * @returns Promise that resolves with user data
   */
  async getUser(userTag: string): Promise<User | null> {
    return this.users.fetch(userTag);
  }

  /**
   * Gets a photo from Yurba
   * @param photoId Photo ID to retrieve
   * @returns Promise that resolves with API response
   */
  async getPhoto(photoId: string): Promise<Photo | null> {
    try {
      const response = await this.api.photos.get(photoId);
      log(`Fetched photo ${photoId}`, response);
      return response;
    } catch (err) {
      erlog('Error getting photo:', err instanceof Error ? err.message : err);
      return null;
    }
  }

  /**
   * Deletes a message by its ID
   * @param ID Message ID to delete
   * @returns Promise that resolves with boolean indicating success
   */
  async deleteMessage(ID: number): Promise<boolean> {
    try {
      await this.api.dialogs.deleteMessage(ID);
      return true;
    } catch (err) {
      erlog(
        'Error deleting message:',
        err instanceof Error ? err.message : err
      );
      return false;
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
  on(event: string | symbol, listener: (...args: any[]) => void): this {
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
  once(event: string | symbol, listener: (...args: any[]) => void): this {
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
  off(event: string | symbol, listener: (...args: any[]) => void): this {
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
  emit(event: string | symbol, ...args: any[]): boolean {
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
    listener: (...args: any[]) => void
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
    this.middlewareManager.use(middleware, config);
  }

  /**
   * Removes middleware by name
   * @param name Middleware name
   * @returns Boolean indicating whether the middleware was removed
   */
  removeMiddleware(name: string): boolean {
    return this.middlewareManager.remove(name);
  }

  /**
   * Gets a list of all middleware
   * @returns Array of middleware configurations
   */
  getMiddlewares(): MiddlewareConfig[] {
    return this.middlewareManager.list();
  }

  /**
   * Shows typing indicator in dialog
   * @param dialogId Dialog ID
   */
  typing(dialogId: number): void {
    this.wsm.send(JSON.stringify({
      command: 'typing',
      thing_id: dialogId
    }));
  }

}

const Version = pkg.version;
const Author = pkg.author;

export { Client, Version, Author };
