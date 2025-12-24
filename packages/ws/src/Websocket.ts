import WebSocket from 'ws';
import { EventEmitter } from 'events';

/**
 * @internal
 */
interface _ReconnectingWebSocketOptions {
  maxReconnectAttempts?: number;
  retryDelay?: number;
  debug?: boolean;
  pingInterval?: number;
  pongTimeout?: number;
}

/**
 * WebSocket client with automatic reconnection
 * @extends EventEmitter
 */
class ReconnectingWebSocket extends EventEmitter {
  private url: string;
  private options: Required<_ReconnectingWebSocketOptions>;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private isConnected: boolean = false;
  private messageQueue: string[] = []; // * No size limit - could cause memory leaks
  private pingIntervalId?: NodeJS.Timeout;
  private pongTimeoutId?: NodeJS.Timeout;
  private forceClosed: boolean = false;

  /**
   * Creates a new WebSocket client with automatic reconnection
   * @param url URL to connect to
   * @param options WebSocket options
   */
  constructor(url: string, options: _ReconnectingWebSocketOptions = {}) {
    super();
    this.url = url; // * No URL validation
    this.options = {
      maxReconnectAttempts: 5,
      retryDelay: 5000,
      debug: false,
      pingInterval: 30000,
      pongTimeout: 5000,
      ...options,
    };
    this.connect(); // !WARN: Calling async operation in constructor - no error handling
  }

  /**
   * Connects to WebSocket server
   * @private
   */
  private connect(): void {
    if (this.forceClosed) {
      return;
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('error', new Error('Maximum reconnection attempts reached. Giving up.'));
      return;
    }

    if (this.options.debug) {
      this.emit('debug', `Attempting to connect WebSocket... [Attempt ${this.reconnectAttempts + 1}]`);
    }
    
    try {
      this.ws = new WebSocket(this.url);
      this.reconnectAttempts++; // * Increment happens before connection success - could be misleading

      this.ws.on('open', () => this.handleOpen());
      this.ws.on('close', (code: number) => this.handleClose(code));
      this.ws.on('error', (err: Error) => this.handleError(err));
      this.ws.on('message', (data: WebSocket.Data) => this.handleMessage(data));
      this.ws.on('pong', () => this.handlePong());
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Handles connection open event
   * @private
   */
  private handleOpen(): void {
    if (this.options.debug) {
      this.emit('debug', 'WebSocket connected');
    }
    this.reconnectAttempts = 0;
    this.isConnected = true;
    this.emit('open');
    
    // Send queued messages
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg && this.ws?.readyState === WebSocket.OPEN) { // * Redundant readyState check after isConnected
        this.ws.send(msg);
      }
    }

    // Start ping to maintain connection
    this.startPingInterval();
  }

  /**
   * Handles connection close event
   * @param code Close code
   * @private
   */
  private handleClose(code: number): void {
    if (this.options.debug) {
      this.emit('debug', `WebSocket closed with code ${code}`);
    }
    this.isConnected = false;
    this.stopPingInterval();
    
    if (!this.forceClosed && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      if (this.options.debug) {
        this.emit('debug', `Reconnecting in ${this.options.retryDelay / 1000} seconds...`);
      }
      setTimeout(() => this.connect(), this.options.retryDelay);
    } else if (this.forceClosed) {
      if (this.options.debug) {
        this.emit('debug', 'WebSocket closed by user');
      }
      this.emit('close', code);
    } else {
      this.emit('error', new Error('WebSocket closed permanently after max attempts.'));
      this.emit('close', code);
    }
  }

  /**
   * Handles WebSocket errors
   * @param err Error object
   * @private
   */
  private handleError(err: Error): void {
    this.emit('error', new Error(`WebSocket error: ${err.message}`)); // * Creating new error loses original stack trace
    if (this.ws) {
      try {
        this.ws.close();
      } catch (closeErr) {
          console.log(`Dev: ${closeErr}`) // * Direct console.log instead of proper logging
      }
    }
  }

  /**
   * Handles incoming messages
   * @param data Message data
   * @private
   */
  private handleMessage(data: WebSocket.Data): void {
    if (this.options.debug) {
      this.emit('debug', `Message received: ${data}`);
    }
    this.emit('message', data.toString());
  }

  /**
   * Starts ping message interval
   * @private
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    if (this.options.pingInterval > 0) {
      this.pingIntervalId = setInterval(() => {
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
          if (this.options.debug) {
            this.emit('debug', 'Sending ping');
          }
          
          try {
            this.ws.ping();
            
            // Set timeout for pong
            this.pongTimeoutId = setTimeout(() => {
              if (this.options.debug) {
                this.emit('debug', 'Pong timeout - reconnecting');
              }
              if (this.ws) {
                try {
                  this.ws.terminate(); // !WARN: Forceful termination without graceful close
                } catch (err) {
                  console.log(`Dev: ${err}`) // * Direct console.log instead of proper logging
                }
              }
            }, this.options.pongTimeout);
          } catch (err) {
            this.handleError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      }, this.options.pingInterval);
    }
  }

  /**
   * Stops ping message interval
   * @private
   */
  private stopPingInterval(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = undefined;
    }
    
    if (this.pongTimeoutId) {
      clearTimeout(this.pongTimeoutId);
      this.pongTimeoutId = undefined;
    }
  }

  /**
   * Handles pong response from server
   * @private
   */
  private handlePong(): void {
    if (this.options.debug) {
      this.emit('debug', 'Received pong');
    }
    if (this.pongTimeoutId) {
      clearTimeout(this.pongTimeoutId);
      this.pongTimeoutId = undefined;
    }
  }

  /**
   * Sends data through WebSocket
   * @param data Data to send
   */
  public send(data: string): void {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      if (this.options.debug) {
        this.emit('debug', `Sending data via WebSocket: ${data}`);
      }
      try {
        this.ws.send(data);
      } catch (err) {
        this.handleError(err instanceof Error ? err : new Error(String(err)));
      }
    } else {
      if (this.options.debug) {
        this.emit('debug', `WebSocket not connected. Queuing message: ${data}`);
      }
      this.messageQueue.push(data); // !WARN: No queue size limit - potential memory leak
    }
  }

  /**
   * Closes WebSocket connection
   * @param code Close code
   * @param reason Close reason
   */
  public close(code: number = 1000, reason: string = ''): void {
    if (this.options.debug) {
      this.emit('debug', `Closing WebSocket with code ${code} and reason "${reason}"`);
    }
    this.forceClosed = true;
    this.stopPingInterval();
    
    if (this.ws) {
      try {
        this.ws.close(code, reason);
      } catch (err) {
        console.log(`Dev: ${err}`) // * Direct console.log instead of proper logging
        // Ignore errors when closing
      }
    }
  }

  /**
   * Checks if WebSocket is connected
   * @returns true if connected
   */
  public isOpen(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Clears message queue
   */
  public clearQueue(): void {
    this.messageQueue = [];
  }
}

export default ReconnectingWebSocket;