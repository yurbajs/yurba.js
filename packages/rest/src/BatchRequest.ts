/**
 * Batch request handler for parallel API calls
 * @category Utilities
 */
export class BatchRequest {
  private requests = new Map<string, Promise<any>>();

  /**
   * Add a request to the batch
   * @param key - Unique identifier for the request
   * @param promise - Promise to execute
   * @returns BatchRequest instance for chaining
   */
  add<T>(key: string, promise: Promise<T>): BatchRequest {
    if (this.requests.has(key)) {
      throw new Error(`Request with key "${key}" already exists`);
    }
    this.requests.set(key, promise);
    return this;
  }

  /**
   * Execute all requests in parallel
   * @returns Object with results keyed by request names
   * @throws Error if any request fails
   */
  async execute<T extends Record<string, any>>(): Promise<T> {
    if (this.requests.size === 0) {
      return {} as T;
    }

    const keys = Array.from(this.requests.keys());
    const promises = Array.from(this.requests.values());

    try {
      const results = await Promise.all(promises);
      
      return keys.reduce((acc, key, index) => {
        acc[key] = results[index];
        return acc;
      }, {} as any) as T;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute all requests and return results even if some fail
   * @returns Object with results or errors keyed by request names
   */
  async executeSettled<T extends Record<string, any>>(): Promise<T> {
    if (this.requests.size === 0) {
      return {} as T;
    }

    const keys = Array.from(this.requests.keys());
    const promises = Array.from(this.requests.values());

    const results = await Promise.allSettled(promises);
    
    return keys.reduce((acc, key, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        acc[key] = result.value;
      } else {
        acc[key] = { error: result.reason };
      }
      return acc;
    }, {} as any) as T;
  }

  /**
   * Get the number of requests in the batch
   * @returns Number of requests
   */
  size(): number {
    return this.requests.size;
  }

  /**
   * Clear all requests from the batch
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Check if batch has any requests
   * @returns True if batch is empty
   */
  isEmpty(): boolean {
    return this.requests.size === 0;
  }

  /**
   * Get all request keys
   * @returns Array of request keys
   */
  getKeys(): string[] {
    return Array.from(this.requests.keys());
  }
}