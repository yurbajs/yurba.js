export class YurbaError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string = 'YURBA_ERROR') {
    super(message);
    this.name = 'YurbaError';
    this.code = code;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, YurbaError.prototype);
  }
}

export class TokenValidationError extends YurbaError {
  constructor(message: string = 'Invalid token format') {
    super(message, 'TOKEN_VALIDATION_ERROR');
    this.name = 'TokenValidationError';
  }
}

export class CommandError extends YurbaError {
  public readonly commandName: string;

  constructor(message: string, commandName: string) {
    super(message, 'COMMAND_ERROR');
    this.name = 'CommandError';
    this.commandName = commandName;
  }
}

export class WebSocketError extends YurbaError {
  constructor(message: string) {
    super(message, 'WEBSOCKET_ERROR');
    this.name = 'WebSocketError';
  }
}

export class ApiRequestError extends YurbaError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string) {
    super(message, 'API_REQUEST_ERROR');
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}
