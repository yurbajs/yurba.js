import { EventEmitter } from 'events';
import { ApiError, RateLimiter, ErrorHandler } from './errors';
import { userCache, type CachedUser } from './cache';

export interface BaseClientOptions {
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}

export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retry?: { attempts?: number; delay?: number };
  signal?: AbortSignal;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Optimized REST client for Yurba.one API
 */
export class BaseClient extends EventEmitter {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly options: Required<BaseClientOptions>;
  private rateLimiter?: RateLimiter;

  constructor(token: string, options: BaseClientOptions = {}) {
    super();

    if (!token?.trim()) {
      throw new ApiError('Token is required', 400);
    }
    
    if (!token.startsWith('y') || token.length < 10) {
      throw new ApiError('Invalid token format', 401);
    }




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
      'User-Agent': `@yurbajs/rest@${process.env.npm_package_version || '0.1.9'}`,
      'token': token,
      ...this.options.headers
    };

    // Validate token asynchronously on first request
    this.validateAndCacheUser(token).catch(() => {});
  }

  public setRateLimit(config: RateLimitConfig): void {
    this.rateLimiter = new RateLimiter(config);
  }

  public async get<T = any>(endpoint: string, queryParams: Record<string, any> = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', this.buildUrl(endpoint, queryParams), undefined, config);
  }

  public async post<T = any>(endpoint: string, data: any = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', this.buildUrl(endpoint), data, config);
  }

  public async put<T = any>(endpoint: string, data: any = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', this.buildUrl(endpoint), data, config);
  }

  public async patch<T = any>(endpoint: string, data: any = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', this.buildUrl(endpoint), data, config);
  }

  public async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', this.buildUrl(endpoint), undefined, config);
  }

  public async uploadFile<T = any>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const headers = { ...this.defaultHeaders, ...config?.headers };
    delete headers['Content-Type'];
    return this.request<T>('POST', this.buildUrl(endpoint), formData, { ...config, headers });
  }

  public cancelRequest(endpoint: string): void {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  public cancelAllRequests(): void {
    for (const [, controller] of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  public getRateLimitStatus(): { canMakeRequest: boolean; resetTime: number } | null {
    return this.rateLimiter ? {
      canMakeRequest: this.rateLimiter.canMakeRequest(),
      resetTime: this.rateLimiter.getResetTime()
    } : null;
  }

  private async validateAndCacheUser(token: string): Promise<void> {
    const cached = userCache.get(token);
    if (cached) return;

    try {
      const user = await this.get('/me');
      userCache.set(token, {
        id: user.ID,
        name: user.Name,
        surname: user.Surname,
        link: user.Link,
        avatar: user.Avatar
      });
    } catch (error) {
      throw new ApiError('Token validation failed', 401, undefined, '/me', 'GET');
    }
  }

  public getCachedUser(token: string): CachedUser | null {
    return userCache.get(token);
  }

  public clearCache(): void {
    userCache.clear();
  }

  private async request<T>(method: string, url: string, data?: any, config?: RequestConfig): Promise<T> {
    const endpoint = new URL(url).pathname;
    const maxRetries = config?.retry?.attempts ?? this.options.maxRetries;
    const retryDelay = config?.retry?.delay ?? this.options.retryDelay;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(method, url, data, config, endpoint);
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiError && error.isClientError() || attempt === maxRetries) {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError!;
  }

  private async executeRequest<T>(method: string, url: string, data?: any, config?: RequestConfig, endpoint?: string): Promise<T> {
    if (this.rateLimiter && !this.rateLimiter.canMakeRequest()) {
      throw new ApiError(
        `Rate limit exceeded. Reset at ${new Date(this.rateLimiter.getResetTime()).toISOString()}`,
        429,
        undefined,
        endpoint,
        method
      );
    }

    const controller = new AbortController();
    const signal = config?.signal ? this.combineSignals([controller.signal, config.signal]) : controller.signal;

    if (endpoint) this.abortControllers.set(endpoint, controller);

    const timeout = config?.timeout ?? this.options.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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

      if (this.rateLimiter) this.rateLimiter.recordRequest();

      if (this.options.debug) {
        this.emit('response', { method, url, status: response.status, statusText: response.statusText });
      }

      if (!response.ok) {
        await ErrorHandler.handleResponse(response, endpoint, method);
      }

      return await response.json() as T;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request aborted', 0, undefined, endpoint, method);
      }

      if (error instanceof ApiError) throw error;

      throw new ApiError(`Network error: ${(error as Error).message}`, 0, undefined, endpoint, method);
    } finally {
      clearTimeout(timeoutId);
      if (endpoint) this.abortControllers.delete(endpoint);
    }
  }

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

export { ApiError };