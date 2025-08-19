import { default as ReconnectingWebSocket } from '@yurbajs/ws';
import { EventEmitter } from 'events';
import Logger, { LogLevel } from '../utils/Logger';
import { IWebSocketManager } from '@yurbajs/types';

// Локальні типи для WebSocket subscribe/unsubscribe
interface WebSocketSubscribeData {
  command: string;
  category: string;
  thing_id: number;
}
interface WebSocketUnsubscribeData {
  command: string;
  category: string;
  thing_id: number;
}

let logging = new Logger('WSM', { enabled: false });

if (process.env.MODULES === 'WSM') {
  try {
    require('dotenv').config();

    if (process.env.Debug) {
      logging = new Logger('WSM', {
        enabled: true,
        level: process.env.Level as unknown as LogLevel,
      });
    }
  } catch {
    // no-op
  }
}

/**
 * WebSocket connection manager
 * @extends EventEmitter
 */
export default class WSM extends EventEmitter implements IWebSocketManager {
  private ws: ReconnectingWebSocket | null = null;
  private token: string;
  private subscriptions: Map<string, number[]> = new Map();
  private connectionTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Creates a new WebSocket manager
   * @param token Authorization token
   */
  constructor(token: string) {
    super();
    this.token = token;
  }

  /**
   * Connects to WebSocket server
   * @param botData Bot data
   * @returns Promise that resolves after successful connection
   */
  async connect(botData: any): Promise<void> {
    this.ws = new ReconnectingWebSocket(
      `wss://api.yurba.one/ws?token=${this.token}`,
      {
        maxReconnectAttempts: 10,
        retryDelay: 5000,
        debug: true,
      }
    );

    this.ws.on('open', () => {
      logging.info('WebSocket connection opened.');

      // Restore subscriptions
      this.restoreSubscriptions();

      // Subscribe to bot dialog
      this.subscribeToEvents('dialog', botData.ID);

      this.emit('ready'); // Emit "ready" event for Client
    });

    this.ws.on('message', (data: string) => {
      logging.debug('WebSocket received a message:', data);
      try {
        const raw = JSON.parse(data.toString());
        // Якщо є вкладене поле Message, використовуємо тільки його, але додаємо Type з raw
        let message;
        if (raw.Message) {
          message = { ...raw.Message, Type: raw.Type || raw.Message.Type };
        } else {
          message = raw;
        }
        this.emit('message', message);
      } catch (err) {
        logging.error('Failed to parse WebSocket message:', err);
        this.emit(
          'error',
          new Error(`Failed to parse WebSocket message: ${err}`)
        );
      }
    });

    this.ws.on('close', (code) => {
      logging.warn(`WebSocket connection closed with code ${code}.`);
      this.emit('close', code); // Emit "close" event for Client
    });

    this.ws.on('error', (err: Error) => {
      logging.error('WebSocket error:', err);
      this.emit('error', err); // Emit "error" event for Client
    });

    await this.waitForWebSocketOpen();
  }

  /**
   * Subscribes to events of a specific category
   * @param category Event category
   * @param thing_id Object ID
   */
  public subscribeToEvents(category: string, thing_id: number): void {
    const subscribeData: WebSocketSubscribeData = {
      command: 'subscribe',
      category,
      thing_id,
    };

    logging.info(
      `Subscribing to events for category: ${category}, thing_id: ${thing_id}`
    );

    // Store subscription for possible restoration
    if (!this.subscriptions.has(category)) {
      this.subscriptions.set(category, []);
    }
    if (!this.subscriptions.get(category)?.includes(thing_id)) {
      this.subscriptions.get(category)?.push(thing_id);
    }

    this.ws?.send(JSON.stringify(subscribeData));
  }

  /**
   * Unsubscribes from events of a specific category
   * @param category Event category
   * @param thing_id Object ID
   */
  public unsubscribeFromEvents(category: string, thing_id: number): void {
    const unsubscribeData: WebSocketUnsubscribeData = {
      command: 'unsubscribe',
      category,
      thing_id,
    };

    logging.info(
      `Unsubscribing from events for category: ${category}, thing_id: ${thing_id}`
    );

    // Remove subscription from stored ones
    if (this.subscriptions.has(category)) {
      const ids = this.subscriptions.get(category);
      if (ids) {
        const index = ids.indexOf(thing_id);
        if (index !== -1) {
          ids.splice(index, 1);
        }
        if (ids.length === 0) {
          this.subscriptions.delete(category);
        }
      }
    }

    this.ws?.send(JSON.stringify(unsubscribeData));
  }

  /**
   * Restores all stored subscriptions
   * @private
   */
  private restoreSubscriptions(): void {
    logging.info('Restoring subscriptions...');
    this.subscriptions.forEach((ids, category) => {
      ids.forEach((id) => {
        const subscribeData: WebSocketSubscribeData = {
          command: 'subscribe',
          category,
          thing_id: id,
        };
        this.ws?.send(JSON.stringify(subscribeData));
        logging.info(`Restored subscription: ${category}, thing_id: ${id}`);
      });
    });
  }

  /**
   * Waits for WebSocket connection to open
   * @returns Promise that resolves after connection opens
   * @private
   */
  private waitForWebSocketOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.isOpen()) {
        logging.info('WebSocket already open.');
        resolve();
        return;
      }

      logging.info('Waiting for WebSocket to open...');

      const onOpen = () => {
        if (this.connectionTimeoutId) {
          clearTimeout(this.connectionTimeoutId);
          this.connectionTimeoutId = null;
        }
        this.ws?.removeListener('error', onError);
        resolve();
      };

      const onError = (err: Error) => {
        if (this.connectionTimeoutId) {
          clearTimeout(this.connectionTimeoutId);
          this.connectionTimeoutId = null;
        }
        this.ws?.removeListener('open', onOpen);
        reject(err);
      };

      this.ws?.once('open', onOpen);
      this.ws?.once('error', onError);

      // Set connection timeout
      this.connectionTimeoutId = setTimeout(() => {
        this.ws?.removeListener('open', onOpen);
        this.ws?.removeListener('error', onError);
        reject(new Error('WebSocket connection timeout'));
      }, 10000);
    });
  }

  /**
   * Closes WebSocket connection
   */
  close(): void {
    logging.info('Closing WebSocket connection...');
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Checks if WebSocket is connected
   * @returns true if connected
   */
  isConnected(): boolean {
    return this.ws?.isOpen() || false;
  }
}
