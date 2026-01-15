import { Client, Version, Author } from './client/Client';
import Logger, { LogLevel, LoggerOptions } from './utils/Logger';
import UserManager from './managers/UserManager';
import CachedManager from './managers/CachedManager';
import CommandManager from './managers/Command';
import UserClientManager from './managers/UserClientManager';
import MessageManager from './managers/Message';
import MiddlewareManager from './managers/Middleware';

export {
  Client,
  Logger,
  LogLevel,
  LoggerOptions,
  Version,
  Author,
  UserManager,
  CachedManager,
  CommandManager,
  UserClientManager,
  MessageManager,
  MiddlewareManager,
};

export * from './structures';
export * from './errors';

export default Client;
