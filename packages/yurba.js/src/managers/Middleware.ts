import {
  MessageModel,
  IMiddlewareManager,
  MiddlewareFunction,
  MiddlewareConfig,
} from '@yurbajs/types';
import { CDLog } from '../utils/devlog';

const log = CDLog('MiddlewareManager');

export default class MiddlewareManager implements IMiddlewareManager {
  private middlewares: Map<
    string,
    { fn: MiddlewareFunction; config: MiddlewareConfig }
  > = new Map();

  use(
    middleware: MiddlewareFunction,
    config: Partial<MiddlewareConfig> = {},
  ): void {
    const fullConfig: MiddlewareConfig = {
      name: config.name ?? `middleware_${Date.now()}`,
      enabled: config.enabled ?? true,
    };
    if (this.middlewares.has(fullConfig.name)) {
      throw new Error(
        `Middleware with name "${fullConfig.name}" already exists`,
      );
    }

    this.middlewares.set(fullConfig.name, {
      fn: middleware,
      config: { priority: 0, enabled: true, ...config, name: fullConfig.name },
    });

    log.info(`Registered middleware: ${config.name}`);
  }

  remove(name: string): boolean {
    const result = this.middlewares.delete(name);
    if (result) {
      log.info(`Removed middleware: ${name}`);
    }
    return result;
  }

  async execute(message: MessageModel): Promise<void> {
    const sortedMiddlewares = Array.from(this.middlewares.values())
      .filter(({ config }) => config.enabled)
      .sort((a, b) => (b.config.priority ?? 0) - (a.config.priority ?? 0));

    for (const { fn, config } of sortedMiddlewares) {
      try {
        await fn(message);
      } catch (error) {
        log.error(`Middleware "${config.name}" error:`, error);
      }
    }
  }

  list(): MiddlewareConfig[] {
    return Array.from(this.middlewares.values()).map(({ config }) => config);
  }
}
