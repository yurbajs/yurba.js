import Logger, { LogLevel } from './Logger';

interface DevConfig {
  debug: boolean;
  level?: LogLevel;
}

export function CDLog(serviceName: string): Logger {
  let Dev: DevConfig = { debug: false, level: LogLevel.DEBUG };

  if (process.env.MODULES === 'yurbajs') {
    try {
      require('dotenv').config();
      Dev = {
        debug: Boolean(process.env.DEBUG),
        level: process.env.LEVEL as unknown as LogLevel,
      };
    } catch { /* no-op */ }
  }

  return new Logger(serviceName, { enabled: Dev.debug, level: Dev.level });
}
