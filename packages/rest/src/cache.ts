export interface CachedUser {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly link: string;
  readonly avatar: number;
  readonly timestamp: number;
}

class UserCache {
  private readonly cache = new Map<string, CachedUser>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanupTimer();
  }

  set(token: string, user: Omit<CachedUser, 'timestamp'>): void {
    this.cache.set(token, { ...user, timestamp: Date.now() });
  }

  get(token: string): CachedUser | null {
    const cached = this.cache.get(token);
    if (!cached) return null;
    
    if (this.isExpired(cached)) {
      this.cache.delete(token);
      return null;
    }
    
    return cached;
  }

  has(token: string): boolean {
    return this.get(token) !== null;
  }

  delete(token: string): boolean {
    return this.cache.delete(token);
  }

  clear(): void {
    this.cache.clear();
  }

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

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

export const userCache = new UserCache();