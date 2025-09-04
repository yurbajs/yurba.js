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

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

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

  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

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
      auth_failed: 'Authorization failed: invalid token',
      access_denied: 'Access denied or resource does not exist',
      not_found: 'Resource not found',
      invalid_type: 'Invalid type provided',
      upload_error: 'Failed to save to database',
      rate_limit_exceeded: 'Too many requests, please try again later',
      validation_error: 'Invalid request parameters',
      server_error: 'Internal server error occurred'
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