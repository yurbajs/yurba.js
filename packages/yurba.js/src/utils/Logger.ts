
/**
 * Logging levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger options
 */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  useColors?: boolean;
  timestamp?: boolean;
  logToFile?: boolean;
  logFilePath?: string;
  enabled?: boolean; // Added new parameter for enabling/disabling the logger
}

/**
 * Class for logging messages
 * @category Utilities
 */
export default class Logger {
  private level: LogLevel;
  private prefix: string;
  private useColors: boolean;
  private timestamp: boolean;
  private logToFile: boolean;
  private logFilePath: string;
  private enabled: boolean; // Added new field

  /**
   * Creates a new logger
   * @param prefix Prefix for messages
   * @param options Logger options
   */
  constructor(prefix: string = '', options: LoggerOptions = {}) {
    this.prefix = prefix;
    this.level = options.level ?? LogLevel.INFO;
    this.useColors = options.useColors ?? true;
    this.timestamp = options.timestamp ?? true;
    this.logToFile = options.logToFile ?? false;
    this.logFilePath = options.logFilePath ?? './logs/app.log';
    this.enabled = options.enabled ?? true; // Initialization of the new field
  }

  /**
   * Sets the logging level
   * @param level Logging level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enables or disables the logger
   * @param enabled true - to enable, false - to disable
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Checks if the logger is enabled
   * @returns true if logger is enabled, false otherwise
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Logs messages at DEBUG level
   * @param args Arguments to log
   */
  debug(...args: any[]): void {
    if (!this.enabled) return;
    this.log(LogLevel.DEBUG, 'DEBUG', '\x1b[36m', ...args);
  }

  /**
   * Logs messages at INFO level
   * @param args Arguments to log
   */
  info(...args: any[]): void {
    if (!this.enabled) return;
    this.log(LogLevel.INFO, 'INFO', '\x1b[32m', ...args);
  }

  /**
   * Logs messages at WARN level
   * @param args Arguments to log
   */
  warn(...args: any[]): void {
    if (!this.enabled) return;
    this.log(LogLevel.WARN, 'WARN', '\x1b[33m', ...args);
  }

  /**
   * Logs messages at ERROR level
   * @param args Arguments to log
   */
  error(...args: any[]): void {
    if (!this.enabled) return;
    this.log(LogLevel.ERROR, 'ERROR', '\x1b[31m', ...args);
  }

  /**
   * Internal method for logging
   * @param level Logging level
   * @param levelName Level name
   * @param color Console color
   * @param args Arguments to log
   * @private
   */
  private log(level: LogLevel, levelName: string, color: string, ...args: any[]): void {
    if (level < this.level) return;

    const now = new Date();
    const timeStr = this.timestamp ? `[${now.toISOString()}] ` : '';
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    const levelStr = `[${levelName}] `;

    if (this.useColors) {

      console.log(`${timeStr}${color}${prefixStr}${levelStr}\x1b[0m`, ...args);
    } else {

      console.log(`${timeStr}${prefixStr}${levelStr}`, ...args);
    }

    if (this.logToFile) {
      this.writeToFile(`${now.toISOString()} ${levelName} ${this.prefix} ${args.join(' ')}\n`);
    }
  }

  /**
   * Writes log to file
   * @param message Message to write
   * @private
   */
  private writeToFile(message: string): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(this.logFilePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.appendFileSync(this.logFilePath, message);
    } catch (error) {

      console.error('Failed to write log to file:', error);
    }
  }
}
