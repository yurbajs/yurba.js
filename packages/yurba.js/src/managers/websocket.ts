import { default as ReconnectingWebSocket } from '@yurbajs/ws';
import { EventEmitter } from 'events';
import { DialogModel, IWebSocketManager } from '@yurbajs/types';
import { CDLog } from '../utils/devlog';

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

const log = CDLog('WSM');
/**
 * WebSocket connection manager
 * @extends EventEmitter
 * @category Core
 */
export default class WSM extends EventEmitter implements IWebSocketManager {
  private ws: ReconnectingWebSocket | null = null;
  private token: string;
  private subscriptions: Map<string, number[]> = new Map();
  private connectionTimeoutId: NodeJS.Timeout | null = null;
  private uptimeTimeoutId: NodeJS.Timeout | null = null;
  private messageQueue: string[] = [];

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
   * @param dialogs Dialogs
   * @returns Promise that resolves after successful connection
   */
  async connect(dialogs: DialogModel[]): Promise<void> {
    this.ws = new ReconnectingWebSocket(
      `wss://api.yurba.one/ws?token=${this.token}`,
      {
        maxReconnectAttempts: 10,
        retryDelay: 5000,
        debug: true, // * Hardcoded debug mode - should be configurable
      },
    );

    this.ws.on('open', () => {
      log.info('WebSocket connection opened.');

      // Clear connection timeout
      if (this.connectionTimeoutId) {
        clearTimeout(this.connectionTimeoutId);
        this.connectionTimeoutId = null;
      }

      // Set uptime timeout (wait 3 seconds before considering connection stable)
      this.uptimeTimeoutId = setTimeout(() => {
        log.info('WebSocket connection is now stable');
      }, 3000);

      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.ws?.send(message);
          log.debug('Sent queued message:', message);
        }
      }

      // Restore subscriptions (async - don't wait for server confirmation)
      this.restoreSubscriptions();
      if (dialogs && dialogs.length > 0) {
        for (const dialog of dialogs) {
          this.subscribeToEvents('dialog', dialog.ID);
          log.info('Subscribed to dialog:', dialog.ID);
        }
      } else {
        log.info('No dialogs to subscribe to');
      }

      const ready_emit = this.emit('ready'); // Emit "ready" event for Client
      log.info('Ready emit:',ready_emit); // * Missing semicolon and logging emit result is not useful
    });

    this.ws.on('message', (data: string) => {
      log.debug('WebSocket received a message:', data);
      try {
        const raw = JSON.parse(data.toString()); // * Unnecessary toString() call - data is already string

        // Handle connection confirmation message
        if (raw.ok === 1 && raw.version) {
          log.info(`✅ WebSocket server confirmed, version: ${raw.version}`);
          return; // Don't emit this as a regular message
        }

        this.emit('message', raw);
      } catch (err) {
        log.error('Failed to parse WebSocket message:', err);
        this.emit(
          'error',
          new Error(`Failed to parse WebSocket message: ${err}`), // * String concatenation instead of proper error handling
        );
      }
    });

    this.ws.on('close', (code) => {
      log.warn(`WebSocket connection closed with code ${code}.`);
      this.emit('close', code); // Emit "close" event for Client
    });

    this.ws.on('error', (err: Error) => {
      log.error('WebSocket error:', err);
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

    log.info(
      `Subscribing to events for category: ${category}, thing_id: ${thing_id}`,
    );

    // Store subscription for possible restoration
    if (!this.subscriptions.has(category)) {
      this.subscriptions.set(category, []);
    }
    if (!this.subscriptions.get(category)?.includes(thing_id)) { // * Optional chaining with array method - could be undefined
      this.subscriptions.get(category)?.push(thing_id); // * Optional chaining with mutation - could fail silently
    }

    try {
      this.ws?.send(JSON.stringify(subscribeData));
    } catch (err) {
      log.error('Failed to send subscribe message:', err);
    }
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

    log.info(
      `Unsubscribing from events for category: ${category}, thing_id: ${thing_id}`,
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
    log.info('Restoring subscriptions...');
    this.subscriptions.forEach((ids, category) => {
      ids.forEach((id) => {
        const subscribeData: WebSocketSubscribeData = {
          command: 'subscribe',
          category,
          thing_id: id,
        };
        this.ws?.send(JSON.stringify(subscribeData));
        log.info(`Restored subscription: ${category}, thing_id: ${id}`);
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
        log.info('WebSocket already open.');
        resolve();
        return;
      }

      log.info('Waiting for WebSocket to open...');

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
    log.info('Closing WebSocket connection...');
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
    if (this.uptimeTimeoutId) {
      clearTimeout(this.uptimeTimeoutId);
      this.uptimeTimeoutId = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Checks if WebSocket is connected
   * @returns true if connected
   */
  isConnected(): boolean {
    return this.ws?.isOpen() ?? false;
  }

  /**
   * Sends raw data through WebSocket
   * @param data Data to send
   */
  send(data: string): void {
    if (this.isConnected() && this.ws) {
      this.ws.send(data);
      log.debug('Sent message:', data);
    } else {
      // Queue message if not connected
      this.messageQueue.push(data);
      log.debug('Queued message (not connected):', data);
    }
  }
}
