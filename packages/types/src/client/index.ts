import { MessageModel, DialogModel } from '../api';
import { CommandArgsSchema, CommandHandler } from '../core';

export interface ClientOptions {
  prefix?: string;
  maxReconnectAttempts?: number;
  intents?: string[];
}

export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  priority?: number;
}

export interface MiddlewareFunction {
  (message: MessageModel, next?: () => Promise<void>): Promise<void>;
}

export interface ICommandManager {
  regusre(command: string, argsSchema: CommandArgsSchema, handler: CommandHandler): void;
  getCommands(): string[];
  handleCommand(message: MessageModel, enhanceMessage: (msg: MessageModel) => void): Promise<void>;
}

export interface IMessageManager {
  enhanceMessage(message: MessageModel): void;
}

export interface IMiddlewareManager {
  use(middleware: MiddlewareFunction, config?: Partial<MiddlewareConfig>): void;
  execute(message: MessageModel): Promise<void>;
  remove(name: string): boolean;
  list(): MiddlewareConfig[];
}

export interface IWebSocketManager {
  connect(dialogs: DialogModel[]): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  send(data: string): void;
}

/**
 * WebSocket connection established event
 */
export interface WSConnected {
  ok: number;
  version: string;
}

/**
 * WebSocket message event
 */
export interface WSMessage {
  Type: string;
  Message: MessageModel ;
}

export type WSEvent = WSConnected | WSMessage ;