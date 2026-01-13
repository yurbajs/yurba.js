/**
 * User cache interface
 * @category Cache
 */
export interface CachedUser {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly link: string;
  readonly avatar: number;
  readonly timestamp: number;
}

/**
 * User cache implementation with TTL support
 * @category Cache
 */
class UserCache {
  private readonly cache = new Map<string, CachedUser>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Set user data in cache
   * @param token - Authentication token
   * @param user - User data to cache
   */
  set(token: string, user: Omit<CachedUser, 'timestamp'>): void {
    this.cache.set(token, { ...user, timestamp: Date.now() });
  }

  /**
   * Get user data from cache
   * @param token - Authentication token
   * @returns Cached user data or null if not found/expired
   */
  get(token: string): CachedUser | null {
    const cached = this.cache.get(token);
    if (!cached) return null;
    
    if (this.isExpired(cached)) {
      this.cache.delete(token);
      return null;
    }
    
    return cached;
  }

  /**
   * Check if user exists in cache
   * @param token - Authentication token
   * @returns True if user exists and not expired
   */
  has(token: string): boolean {
    return this.get(token) !== null;
  }

  /**
   * Delete user from cache
   * @param token - Authentication token
   * @returns True if user was deleted
   */
  delete(token: string): boolean {
    return this.cache.delete(token);
  }

  /**
   * Clear all cached users
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns Number of cached users
   */
  size(): number {
    return this.cache.size;
  }

  private isExpired(user: CachedUser): boolean {
    return Date.now() - user.timestamp > this.TTL;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      for (const [token, user] of this.cache.entries()) {
        if (this.isExpired(user)) {
          this.cache.delete(token);
        }
      }
    }, this.TTL);

    // Don't keep the process alive
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Destroy cache and cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Singleton user cache instance
 */
export const userCache = new UserCache();