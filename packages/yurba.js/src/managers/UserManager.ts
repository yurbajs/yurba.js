import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';
import { User as UserData } from '@yurbajs/types';
import { User } from '../structures/User';

const log = CDLog('UserManager');

/**
 * Manages API methods for users and stores their cache.
 */
export default class UserManager extends CachedManager<number, User> {
  private linkCache = new Map<string, number>(); // link -> ID mapping

  constructor(client: Client, iterable?: Iterable<User>) {
    super(client, User, iterable);
  }

  /**
   * The cache of this manager
   * @type {Map<number, User>}
   */

  /**
   * Obtains a user from Yurba, or the user cache if it's already available.
   */
  async fetch(user: number | string, { cache = true, force = false } = {}): Promise<UserData | null> {
    const id = this.resolveId(user);
    
    // If it's a string and not a number, check link cache first
    if (!id && typeof user === 'string') {
      const cachedId = this.linkCache.get(user);
      if (cachedId && !force) {
        const existing = this.cache.get(cachedId);
        if (existing) return existing.toJSON();
      }
      
      // Fetch by link/tag
      try {
        const data = await this.client.api.users.get(user);
        const userInstance = new User(this.client, data);
        if (cache) {
          this.cache.set(data.ID, userInstance);
          this.linkCache.set(user, data.ID);
          if (data.Link) this.linkCache.set(data.Link, data.ID);
        }
        return data;
      } catch (error) {
        log.error(`Error fetching user by link ${user}:`, error);
        return null;
      }
    }
    
    if (!id) return null;
    
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing.toJSON();
    }

    try {
      const data = await this.client.api.users.get(id);
      const userInstance = new User(this.client, data);
      if (cache) {
        this.cache.set(id, userInstance);
        if (data.Link) this.linkCache.set(data.Link, data.ID);
      }
      return data;
    } catch (error) {
      log.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  /**
   * Resolves a user resolvable to a User object.
   */
  resolve(user: User): User | null {
    return super.resolve(user);
  }

  /**
   * Resolves a user resolvable to a user id.
   */
  resolveId(user: string | number | User): number | null {
    if (typeof user === 'number') return user;
    if (typeof user === 'string') {
      const parsed = parseInt(user, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return super.resolveId(user);
  }
}