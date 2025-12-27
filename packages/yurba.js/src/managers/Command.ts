import {
  CommandArgsSchema,
  CommandHandler,
  Message,
  ICommandManager,
} from '@yurbajs/types';
import { CommandError } from '@yurbajs/types';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';

const log = CDLog('CommandManager');
/**
 * Command manager for client
 */
export default class CommandManager implements ICommandManager {
  private commands: Map<
    string,
    {
      handler: CommandHandler;
      argsSchema: CommandArgsSchema;
    }
  >;
  protected client;
  private aliases: Map<string, string> = new Map();
  private cooldowns: Map<string, Map<number, number>> = new Map(); // * Cooldowns declared but never used

  /**
   * Creates a new command manager
   * @param api Object with API methods
   * @param getUser Function to get user
   */
  constructor(
    client: Client
  ) {
    this.commands = new Map();
    this.client = client;
  }

  /**
   * Registers a new command
   * @param command Command name
   * @param argsSchema Command arguments schema
   * @param handler Command handler
   */
  registerCommand(
    command: string,
    argsSchema: CommandArgsSchema,
    handler: CommandHandler
  ): void {
    if (!command || typeof command !== 'string' || !command.trim()) {
      throw new Error('Command name is required'); // * Should use custom error class for consistency
    }
    if (this.commands.has(command)) {
      throw new Error(`Command "${command}" is already registered.`); // * Should use custom error class
    }
    this.commands.set(command, { handler, argsSchema });
    log.info(`Registered command: ${command}`);
  }

  /**
   * Adds alias for command
   * @param alias Command alias
   * @param command Original command
   */
  addAlias(alias: string, command: string): void {
    if (!this.commands.has(command)) {
      throw new Error(`Cannot add alias for non-existent command "${command}"`); // * Should use custom error class
    }
    this.aliases.set(alias, command);
    log.info(`Added alias "${alias}" for command "${command}"`);
  }

  /**
   * Main method for handling commands
   * @param message Message object
   * @param enhanceMessage Function to enhance message
   */
  async handleCommand(
    message: Message,
    enhanceMessage: (msg: Message) => void
  ): Promise<void> {
    enhanceMessage(message);

    const { Text, Author } = message;
    if (!Text || !Author) {
      throw new Error('Invalid message: missing Text or Author'); // * Should use custom error class
    }

    const [commandName, ...args] = Text.slice(1).split(' '); // !WARN: Assumes prefix is single character - could break with multi-char prefixes

    // Check original command or alias
    let actualCommand = commandName;
    if (this.aliases.has(commandName)) {
      actualCommand = this.aliases.get(commandName) || commandName; // * Redundant fallback - get() already returns string | undefined
    }

    if (!this.commands.has(actualCommand)) {
      throw new Error(`Command "${commandName}" not found.`); // * Should use custom error class
    }

    const { handler, argsSchema } = this.commands.get(actualCommand)!; // !WARN: Non-null assertion without proper null check

    try {
      const parsedArgs = await this.parseArgs([...args], argsSchema); // * Unnecessary array spread - args is already an array
      if (!parsedArgs) {
        throw new Error('Invalid arguments for the command.'); // * Should use custom error class
      }

      log.debug(
        `Executing command "${actualCommand}" with args:`,
        parsedArgs
      );
      await handler(message, parsedArgs as any); // !WARN: Using 'any' loses type safety
    } catch (error) {
      log.error(`Error executing command "${actualCommand}":`, error);
      throw error; // * Re-throwing without additional context
    }
  }


  /**
   * Parses arguments with support for types string, int, user, repost
   * @param args Array of arguments
   * @param argsSchema Arguments schema
   * @param message Message object
   * @returns Object with parsed arguments
   */
  async parseArgs<T extends Record<string, unknown>>(
    args: string[],
    argsSchema: CommandArgsSchema
  ): Promise<T> {
    const parsedArgs: Record<string, unknown> = {};

    for (const [argName, argConfig] of Object.entries(argsSchema)) {
      let type: string,
        required = true,
        defaultValue: any,
        captureRest = false;

      if (typeof argConfig === 'string') {
        type = argConfig;
        defaultValue = null;
      } else if (Array.isArray(argConfig)) {
        type = argConfig[0];
        if (argConfig.length >= 3 && argConfig[2] === 'rest') {
          captureRest = true;
        }
        if (argConfig.length >= 2) {
          if (argConfig[1] === false) {
            required = false;
            defaultValue = null;
          } else {
            required = false; // If a default value is provided, the argument is optional
            defaultValue = argConfig[1];
          }
        }
      } else {
        type = argConfig.type;
        required = argConfig.required ?? true;
        defaultValue = argConfig.default ?? null;
        captureRest = argConfig.rest === true;
      }

      let argValue: string | undefined;
      if (captureRest) {
        argValue = args.join(' ');
        args = [];
      } else {
        argValue = args.shift();
      }

      if (argValue === undefined) {
        if (required) {
          throw new CommandError(
            `Missing required argument: ${argName}`,
            'parseArgs'
          );
        } else {
          // If argument is optional, use default value
          if (type === 'user' && defaultValue && this.client.users) {
            try {
              const user = await this.client.users.fetch(defaultValue);
              parsedArgs[argName] = user;
            } catch (error) {
              log.error(`Default user "${defaultValue}" not found:`, error);
              throw new CommandError(
                `Default user "${defaultValue}" not found.`,
                'parseArgs'
              );
            }
          } else {
            parsedArgs[argName] = defaultValue;
          }
          continue;
        }
      }

      switch (type) {
        case 'string':
          parsedArgs[argName] = argValue;
          break;
        case 'int': {
          const intValue = parseInt(argValue, 10);
          if (isNaN(intValue)) {
            throw new CommandError(
              `Argument "${argName}" must be an integer.`,
              'parseArgs'
            );
          }
          parsedArgs[argName] = intValue;
          break;
        }
        case 'float': {
          const floatValue = parseFloat(argValue);
          if (isNaN(floatValue)) {
            throw new CommandError(
              `Argument "${argName}" must be a number.`,
              'parseArgs'
            );
          }
          parsedArgs[argName] = floatValue;
          break;
        }
        case 'boolean': {
          const lowerValue = argValue.toLowerCase();
          if (['true', 'yes', '1', 'y'].includes(lowerValue)) {
            parsedArgs[argName] = true;
          } else if (['false', 'no', '0', 'n'].includes(lowerValue)) {
            parsedArgs[argName] = false;
          } else {
            throw new CommandError(
              `Argument "${argName}" must be a boolean (true/false, yes/no, 1/0, y/n).`,
              'parseArgs'
            );
          }
          break;
        }
        case 'user': {
          if (!this.client.users)
            throw new CommandError(
              'getUser function not provided',
              'parseArgs'
            );
          const userTag = argValue.startsWith('@')
            ? argValue.slice(1)
            : argValue;
          try {
            const user = await this.client.users.fetch(userTag);
            if (!user) {
              throw new CommandError(
                `User "${argValue}" not found.`,
                'parseArgs'
              );
            }
            parsedArgs[argName] = user;
          } catch (error) {
            log.error(`Error getting user "${argValue}":`, error);
            throw new CommandError(
              `User "${argValue}" not found.`,
              'parseArgs'
            );
          }
          break;
        }
        case 'repost':
          throw new CommandError(
            'Repost is not supported in the current Message type.',
            'parseArgs'
          ); // * Hardcoded unsupported feature - should be configurable or removed
        default:
          throw new CommandError(`Unknown argument type: ${type}`, 'parseArgs');
      }
    }

    return parsedArgs as T;
  }

  /**
   * Returns list of registered commands
   * @returns Array of command names
   */
  public getCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Returns command information
   * @param command Command name
   * @returns Object with command information or undefined if command not found
   */
  public getCommandInfo(
    command: string
  ): { argsSchema: CommandArgsSchema; description?: string } | undefined {
    const commandInfo = this.commands.get(command);
    if (!commandInfo) return undefined;

    return {
      argsSchema: commandInfo.argsSchema,
    };
  }

  /**
   * Removes command
   * @param command Command name
   * @returns true if command was removed, false otherwise
   */
  public removeCommand(command: string): boolean {
    const result = this.commands.delete(command);

    // Remove all aliases for this command
    for (const [alias, cmd] of this.aliases.entries()) {
      if (cmd === command) {
        this.aliases.delete(alias);
      }
    }

    return result;
  }
}
