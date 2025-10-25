import { Message, User, Author, Photo } from '../api';
import { CommandArgsSchema, CommandHandler } from '../core';

// Типи для зворотної сумісності
export type UserModel = User;
export type PhotoModel = Photo;
export type ShortUserModel = Author;

export interface ClientOptions {
  prefix?: string;
  maxReconnectAttempts?: number;
}

export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  priority?: number;
}

export interface MiddlewareFunction {
  (message: Message, next?: () => Promise<void>): Promise<void>;
}

export interface ICommandManager {
  registerCommand(command: string, argsSchema: CommandArgsSchema, handler: CommandHandler): void;
  getCommands(): string[];
  handleCommand(message: Message, enhanceMessage: (msg: Message) => void): Promise<void>;
}

export interface IMessageManager {
  enhanceMessage(message: Message): void;
}

export interface IMiddlewareManager {
  use(middleware: MiddlewareFunction, config?: Partial<MiddlewareConfig>): void;
  execute(message: Message): Promise<void>;
  remove(name: string): boolean;
  list(): MiddlewareConfig[];
}

export interface IWebSocketManager {
  connect(user: UserModel): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  send(data: string): void;
}

interface WSConnected {
  ok: number;
  version: string;
}

interface WSMessage {
  Type: string;
  Message: Message ;
}

export type WSEvent = WSConnected | WSMessage ;