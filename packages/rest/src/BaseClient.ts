import { EventEmitter } from 'events';

/**
 * Configuration options for REST client
 * @public
 */
export interface BaseClientOptions {
  /** Base API URL */
  baseURL?: string;
  /** Default request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Custom headers to include with every request */
  headers?: Record<string, string>;
  /** Enable request/response logging */
  debug?: boolean;
}

/**
 * Request configuration for individual requests
 * @public
 */
export interface RequestConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers for this request */
  headers?: Record<string, string>;
  /** Retry configuration */
  retry?: {
    attempts?: number;
    delay?: number;
  };
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Rate limiting configuration
 * @public
 */
export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Custom error class for API errors
 * @public
 */
export class ApiError extends Error {
  /** HTTP status code */
  public readonly statusCode: number;
  /** Raw response body */
  public readonly responseBody?: string;
  /** Request endpoint */
  public readonly endpoint?: string;
  /** Request method */
  public readonly method?: string;

  constructor(
    message: string,
    statusCode: number,
    responseBody?: string,
    endpoint?: string,
    method?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.endpoint = endpoint;
    this.method = method;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Check if error is a specific HTTP status
   */
  public isStatus(status: number): boolean {
    return this.statusCode === status;
  }

  /**
   * Check if error is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

/**
 * Rate limiter implementation
 * @internal
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(private config: RateLimitConfig) { }

  public canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.config.windowMs);
    return this.requests.length < this.config.maxRequests;
  }

  public recordRequest(): void {
    this.requests.push(Date.now());
  }

  public getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return this.requests[0] + this.config.windowMs;
  }
}

/**
 * Enhanced REST client for Yurba.one API with advanced features
 *
 * @example Basic usage
 * ```typescript
 * const client = new REST('your-token');
 * const user = await client.get<User>('/get_me');
 * ```
 *
 * @example With custom configuration
 * ```typescript
 * const client = new REST('your-token', {
 *   baseURL: 'https://api.yurba.one',
 *   timeout: 10000,
 *   maxRetries: 3,
 *   debug: true
 * });
 * ```
 *
 * @public
 */
export class REST extends EventEmitter {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly options: Required<BaseClientOptions>;
  private rateLimiter?: RateLimiter;

  /**
   * Creates a new REST client instance
   *
   * @param token - Authorization token for API requests
   * @param options - Configuration options
   */
  constructor(token: string, options: BaseClientOptions = {}) {
    super();

    this.token = token;
    this.options = {
      baseURL: 'https://api.yurba.one',
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      headers: {},
      debug: false,
      ...options
    };

    this.baseURL = this.options.baseURL;
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': `@yurbajs/REST`,
      'token': this.token,
      ...this.options.headers
    };
  }

  /**
   * Configure rate limiting
   *
   * @param config - Rate limit configuration
   *
   * @example
   * ```typescript
   * client.setRateLimit({ maxRequests: 100, windowMs: 60000 }); // 100 requests per minute
   * ```
   */
  public setRateLimit(config: RateLimitConfig): void {
    this.rateLimiter = new RateLimiter(config);
  }

  /**
   * Execute GET request
   *
   * @param endpoint - API endpoint
   * @param queryParams - Query parameters
   * @param config - Request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * const user = await client.get<User>('/get_me');
   * const posts = await client.get<Post[]>('/user/rastgame/posts', { page: 1 });
   * ```
   */
  public async get<T = any>(
    endpoint: string,
    queryParams: Record<string, any> = {},
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint, queryParams);
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Execute POST request
   *
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise resolving to response data
   */
  public async post<T = any>(
    endpoint: string,
    data: any = {},
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Execute PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data: any = {},
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Execute PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data: any = {},
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Execute DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Upload file with multipart/form-data
   *
   * @param endpoint - API endpoint
   * @param formData - Form data containing file
   * @param config - Request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * const formData = new FormData();
   * formData.append('file', file);
   * const result = await client.uploadFile('/upload', formData);
   * ```
   */
  public async uploadFile<T = any>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...config?.headers };
    delete headers['Content-Type']; // Let browser set boundary

    return this.request<T>('POST', url, formData, { ...config, headers });
  }

  /**
   * Cancel request by endpoint
   *
   * @param endpoint - API endpoint to cancel
   *
   * @example
   * ```typescript
   * client.cancelRequest('/long-running-endpoint');
   * ```
   */
  public cancelRequest(endpoint: string): void {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    for (const [, controller] of this.abortControllers) { 
      controller.abort();
    }
    this.abortControllers.clear();
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus(): { canMakeRequest: boolean; resetTime: number } | null {
    if (!this.rateLimiter) return null;

    return {
      canMakeRequest: this.rateLimiter.canMakeRequest(),
      resetTime: this.rateLimiter.getResetTime()
    };
  }

  /**
   * Core request method with retry logic and error handling
   * @internal
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const endpoint = new URL(url).pathname;
    const maxRetries = config?.retry?.attempts ?? this.options.maxRetries;
    const retryDelay = config?.retry?.delay ?? this.options.retryDelay;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(method, url, data, config, endpoint);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors or if it's the last attempt
        if (error instanceof ApiError && error.isClientError() || attempt === maxRetries) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute single request
   * @internal
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig,
    endpoint?: string
  ): Promise<T> {
    // Rate limiting check
    if (this.rateLimiter && !this.rateLimiter.canMakeRequest()) {
      const resetTime = this.rateLimiter.getResetTime();
      throw new ApiError(
        `Rate limit exceeded. Reset at ${new Date(resetTime).toISOString()}`,
        429,
        undefined,
        endpoint,
        method
      );
    }

    // Setup abort controller
    const controller = new AbortController();
    const signal = config?.signal ?
      this.combineSignals([controller.signal, config.signal]) :
      controller.signal;

    if (endpoint) {
      this.abortControllers.set(endpoint, controller);
    }

    // Setup timeout
    const timeout = config?.timeout ?? this.options.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Prepare request options
    const headers = { ...this.defaultHeaders, ...config?.headers };
    const options: RequestInit = {
      method,
      headers,
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      signal
    };

    try {
      if (this.options.debug) {
        this.emit('request', { method, url, data, headers });
      }

      const response = await fetch(url, options);

      // Record request for rate limiting
      if (this.rateLimiter) {
        this.rateLimiter.recordRequest();
      }

      if (this.options.debug) {
        this.emit('response', {
          method,
          url,
          status: response.status,
          statusText: response.statusText
        });
      }

      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint, method);
      }

      const result = await response.json() as T;
      return result;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request aborted', 0, undefined, endpoint, method);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Network error: ${(error as Error).message}`,
        0,
        undefined,
        endpoint,
        method
      );
    } finally {
      clearTimeout(timeoutId);
      if (endpoint) {
        this.abortControllers.delete(endpoint);
      }
    }
  }

  /**
   * Handle error responses
   * @internal
   */
  private async handleErrorResponse(
    response: Response,
    endpoint?: string,
    method?: string
  ): Promise<never> {
    let errorBody: string;
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorBody = JSON.stringify(errorData);
      if (errorData.detail) {
        errorMessage = `API Error: ${errorData.detail}`;
      }
    } catch {
      errorBody = await response.text();
    }

    throw new ApiError(errorMessage, response.status, errorBody, endpoint, method);
  }

  /**
   * Build URL with query parameters
   * @internal
   */
  private buildUrl(endpoint: string, queryParams: Record<string, any> = {}): string {
    const url = new URL(`${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    return url.toString();
  }

  /**
   * Combine multiple AbortSignals
   * @internal
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
  }
}
