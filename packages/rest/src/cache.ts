export interface CachedUser {
  id: number;
  name: string;
  surname: string;
  link: string;
  avatar: number;
  timestamp: number;
}

class UserCache {
  private cache = new Map<string, CachedUser>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(token: string, user: CachedUser): void {
    this.cache.set(token, { ...user, timestamp: Date.now() });
  }

  get(token: string): CachedUser | null {
    const cached = this.cache.get(token);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(token);
      return null;
    }
    
    return cached;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const userCache = new UserCache();