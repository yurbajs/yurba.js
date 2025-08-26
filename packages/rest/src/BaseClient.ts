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

  public async get<T = unknown>(endpoint: string, queryParams: Record<string, unknown> = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', this.buildUrl(endpoint, queryParams), undefined, config);
  }

  public async post<T = unknown>(endpoint: string, data: unknown = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', this.buildUrl(endpoint), data, config);
  }

  public async put<T = unknown>(endpoint: string, data: unknown = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', this.buildUrl(endpoint), data, config);
  }

  public async patch<T = unknown>(endpoint: string, data: unknown = {}, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', this.buildUrl(endpoint), data, config);
  }

  public async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', this.buildUrl(endpoint), undefined, config);
  }

  public async uploadFile<T = unknown>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const headers = { ...this.defaultHeaders, ...config?.headers };
    delete headers['Content-Type']; // Let browser set multipart boundary
    
    const uploadConfig = {
      ...config,
      headers: {
        'Accept': 'application/json',
        'token': headers['token']
      }
    };
    
    return this.request<T>('POST', this.buildUrl(endpoint), formData, uploadConfig);
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
      const userData: unknown = await this.get('/me');
      if (userData && typeof userData === 'object' && userData !== null) {
        const data = userData as {
          ID?: unknown;
          Name?: unknown;
          Surname?: unknown;
          Link?: unknown;
          Avatar?: unknown;
        };
        userCache.set(token, {
          id: typeof data.ID === 'number' ? data.ID : 0,
          name: typeof data.Name === 'string' ? data.Name : '',
          surname: typeof data.Surname === 'string' ? data.Surname : '',
          link: typeof data.Link === 'string' ? data.Link : '',
          avatar: typeof data.Avatar === 'number' ? data.Avatar : 0
        });
      }
    } catch {
      throw new ApiError('Token validation failed', 401, undefined, '/me', 'GET');
    }
  }

  public async getCachedUser(): Promise<CachedUser | null> {
    const token = this.defaultHeaders['token'];
    let cached = userCache.get(token);
    if (!cached) {
      try {
        const userData: unknown = await this.get('/get_me');
        if (userData && typeof userData === 'object' && userData !== null) {
          const data = userData as {
            ID?: unknown;
            Name?: unknown;
            Surname?: unknown;
            Link?: unknown;
            Avatar?: unknown;
          };
          cached = {
            id: typeof data.ID === 'number' ? data.ID : 0,
            name: typeof data.Name === 'string' ? data.Name : '',
            surname: typeof data.Surname === 'string' ? data.Surname : '',
            link: typeof data.Link === 'string' ? data.Link : '',
            avatar: typeof data.Avatar === 'number' ? data.Avatar : 0,
            timestamp: Date.now()
          };
          userCache.set(token, {
            id: cached.id,
            name: cached.name,
            surname: cached.surname,
            link: cached.link,
            avatar: cached.avatar
          });
        }
      } catch {
        return null;
      }
    }
    return cached;
  }

  public setCachedUser(user: Omit<CachedUser, 'timestamp'>): void {
    const token = this.defaultHeaders['token'];
    userCache.set(token, user);
  }

  public clearCache(): void {
    userCache.clear();
  }

  public async resolveUser(user: string | number): Promise<string | number> {
    if (user === '@me') {
      const cachedUser = await this.getCachedUser();
      if (!cachedUser) throw new Error('User not found in cache');
      return cachedUser.id;
    }
    return user;
  }

  private async request<T>(method: string, url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const endpoint = new URL(url).pathname;
    const maxRetries = config?.retry?.attempts ?? this.options.maxRetries;
    const retryDelay = config?.retry?.delay ?? this.options.retryDelay;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(method, url, data, config, endpoint);
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof ApiError && error.isClientError() || attempt === maxRetries) {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    if (lastError) {
      throw lastError;
    }
    
    // This should never happen, but TypeScript needs it for safety
    throw new Error('Unknown error occurred');
  }

  private async executeRequest<T>(method: string, url: string, data?: unknown, config?: RequestConfig, endpoint?: string): Promise<T> {
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

    let headers = { ...this.defaultHeaders, ...config?.headers };
    let body: BodyInit | undefined;
    
    if (data instanceof FormData) {
      // For FormData, only keep essential headers
      headers = {
        'Accept': 'application/json',
        'token': headers['token']
      };
      body = data;
    } else {
      body = data ? JSON.stringify(data) : undefined;
    }
    
    const options: RequestInit = {
      method,
      headers,
      body,
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

      const data: T = await response.json();
      return data;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request aborted', 0, undefined, endpoint, method);
      }

      if (error instanceof ApiError) throw error;

      throw new ApiError(`Network error: ${error instanceof Error ? error.message : String(error)}`, 0, undefined, endpoint, method);
    } finally {
      clearTimeout(timeoutId);
      if (endpoint) this.abortControllers.delete(endpoint);
    }
  }

  private buildUrl(endpoint: string, queryParams: Record<string, unknown> = {}): string {
    const url = new URL(`${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v: unknown) => url.searchParams.append(key, String(v)));
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