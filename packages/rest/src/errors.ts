/**
 * API Error class with enhanced error handling
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body?: string;
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    status: number,
    body?: string,
    endpoint?: string,
    method?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
    this.method = method;
  }

  /**
   * Check if error is a client error (4xx)
   * @returns True if status code is between 400-499
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   * @returns True if status code is 500 or higher
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is a network error
   * @returns True if status code is 0 (network failure)
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Rate limiter for API requests
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: { maxRequests: number; windowMs: number }) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * Check if a request can be made within rate limits
   * @returns True if request is allowed
   */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a new request timestamp
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Get timestamp when rate limit resets
   * @returns Reset timestamp
   */
  getResetTime(): number {
    if (this.requests.length === 0) return Date.now();
    return this.requests[0] + this.windowMs;
  }

  private cleanup(): void {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
  }
}

/**
 * Error handler utility functions
 */
export const ErrorHandler = {
  /**
   * Map API error details to user-friendly messages
   */
  mapApiError(detail: string): string {
    const errorMap: Record<string, string> = {
      // Authentication & Authorization
      auth_failed: 'Authorization failed',
      invalid_user: 'Your user is missing from the database or cannot be read',
      access_denied: 'You don\'t have access to this resource',
      token_not_found: 'Token does not exist',
      app_not_found: 'Incorrect app secret key',
      
      // Rate Limiting
      too_many_attempts: 'Too many attempts, please try again later',
      
      // User Registration/Login
      incorrect_password: 'Incorrect user password',
      name_is_too_short: 'Name must be at least 3 characters',
      password_is_too_short: 'Password must be at least 6 characters',
      invalid_password: 'Password encryption error',
      user_not_found: 'User with the specified email was not found',
      
      // Email Service
      email_service_error: 'Error when sending email',
      
      // Content Validation
      too_many_characters: 'You have reached the content length limit',
      too_many_photos: 'You have reached the photos count limit',
      invalid_photos: 'The photo list cannot be read or contains invalid photos',
      invalid_attachments: 'Failed to read attachments',
      invalid_tracks: 'Failed to read tracks json',
      
      // File Upload
      upload_error: 'Error transferring file to database/storage',
      invalid_file: 'Your file is unreadable or in wrong format',
      invalid_content: 'Your file is unreadable or corrupted',
      delete_error: 'Error deleting from storage',
      
      // Dialog/Chat
      invalid_type: 'Invalid dialog type',
      dialog_not_found: 'Incorrect dialog ID',
      
      // Generic
      not_found: 'Resource not found',
      rate_limit_exceeded: 'Too many requests, please try again later',
      validation_error: 'Invalid request parameters',
      server_error: 'Internal server error occurred',
      unprocessable_entity: 'Request data validation failed',
      invalid_request: 'Invalid request format or parameters'
    };

    return errorMap[detail] || `API Error: ${detail}`;
  },

  /**
   * Handle response errors consistently
   */
  async handleResponse(response: Response, endpoint?: string, method?: string): Promise<never> {
    let errorBody: string | undefined;
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const errorData: unknown = await response.json();
      errorBody = JSON.stringify(errorData);
      if (
        errorData &&
        typeof errorData === 'object' &&
        errorData !== null &&
        'detail' in errorData
      ) {
        const detailObj = errorData as { detail?: unknown };
        if (typeof detailObj.detail === 'string') {
          errorMessage = this.mapApiError(detailObj.detail);
        }
      }
    } catch {
      errorBody = await response.text();
    }

    throw new ApiError(errorMessage, response.status, errorBody, endpoint, method);
  },

  /**
   * Handle response errors with pre-read text
   */
  async handleResponseText(responseText: string, status: number, endpoint?: string, method?: string): Promise<never> {
    let errorMessage = `API request failed: ${status}`;

    try {
      const errorData: unknown = JSON.parse(responseText);
      if (
        errorData &&
        typeof errorData === 'object' &&
        errorData !== null &&
        'detail' in errorData
      ) {
        const detailObj = errorData as { detail?: unknown };
        if (typeof detailObj.detail === 'string') {
          errorMessage = this.mapApiError(detailObj.detail);
        }
      }
    } catch {
      // responseText is not JSON, use as is
    }

    throw new ApiError(errorMessage, status, responseText, endpoint, method);
  }
};