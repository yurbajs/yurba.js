import { MessageModel } from '../api';

/**
 * Represents a single argument schema entry for a command.
 *
 * @example
 * // A required string argument
 * { type: 'string', required: true }
 *
 * @example
 * // An optional integer argument with a default value
 * { type: 'int', default: 0 }
 *
 * @example
 * // A rest argument that captures all remaining input
 * { type: 'string', rest: true }
 */
export type CommandArgsSchemaEntry = {
    type: 'string' | 'int' | 'float' | 'boolean' | 'user' | 'repost';  // Type of the argument
    required?: boolean;     // Whether the argument is required
    default?: any;          // Default value if not provided.
    rest?: boolean;         // If true, captures the rest of the arguments.
};

/**
 * Defines the schema for command arguments.
 * Can be an object with CommandArgsSchemaEntry, a string, or a tuple.
 *
 * @example
 * // Using CommandArgsSchemaEntry objects
 * {
 *   name: { type: 'string', required: true },
 *   age: { type: 'int', default: 18 }
 * }
 *
 * @example
 * // Using string shorthand
 * {
 *   name: 'string',
 *   age: 'int'
 * }
 *
 * @example
 * // Using tuple notation
 * {
 *   name: ['string', 'defaultName'],
 *   args: ['string', undefined, 'rest']
 * }
 */
export type CommandArgsSchema = Record<string, CommandArgsSchemaEntry | string | [string, any?, 'rest'?]>;

/**
 * The handler function type for a command.
 * @param message The message object.
 * @param args The parsed arguments according to the schema.
 *
 * @example
 * const handler: CommandHandler = async (message, args) => {
 *   // args.name, args.age, etc.
 *   console.log(args);
 * };
 */
export type CommandHandler = (message: MessageModel, args: CommandArgsSchema) => Promise<void>;

/**
 * Supported option types for commands.
 *
 * @example
 * type: "string"
 * type: "boolean"
 * type: "int"
 * type: "user"
 * type: "repost"
 */
export type OptionType = 'string' | 'boolean' | 'int' | 'user' | 'repost';

/**
 * Represents a single option for a command.
 *
 * @example
 * {
 *   name: "verbose",
 *   type: "boolean",
 *   required: false,
 *   description: "Enable verbose output",
 *   default: false
 * }
 */
export interface CommandOption {
  name: string;         // Name of the option.
  type: OptionType;     // Type of the option.
  required: boolean;    // Whether the option is required.
  description: string;  // Description of the option.
  default?: any;        // Default value if not provided.
  rest?: boolean;       // If true, captures the rest of the arguments.
}

/**
 * Represents the definition of a command.
 *
 * @example
 * {
 *   name: "greet",
 *   description: "Send a greeting",
 *   options: [
 *     { name: "user", type: "user", required: true, description: "User to greet" }
 *   ],
 *   handler: async (message, args) => {
 *     // Implementation here
 *   }
 * }
 */
export interface CommandDefinition {
    name: string;       // Name of the command.
    options: CommandOption[]; // List of options for the command.
    handler: (message: MessageModel, args: any) => Promise<void>; // Command handler function.
}
