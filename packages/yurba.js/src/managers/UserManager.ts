import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';
import { User } from '../structures/User';

const log = CDLog('UserManager');

/**
 * Manages API methods for users and stores their cache
 * @extends {CachedManager}
 * @category Managers
 */
export default class UserManager extends CachedManager<number, User> {
  /**
   * Cache for mapping user links to IDs
   * @type {Map<string, number>}
   * @private
   */
  private linkCache = new Map<string, number>(); // link -> ID mapping

  /**
   * @param {Client} client - The client that instantiated this manager
   * @param {Iterable<User>} [iterable] - An iterable of users to cache
   */
  constructor(client: Client, iterable?: Iterable<User>) {
    super(client, User, iterable);
  }

  /**
   * The cache of users
   * @type {Map<number, User>}
   * @name UserManager#cache
   * @readonly
   */

  /**
   * Obtains a user from Yurba, or the user cache if it's already available
   * @param {number|string} user - The user ID or link to fetch
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.cache=true] - Whether to cache the fetched user
   * @param {boolean} [options.force=false] - Whether to skip the cache check and request the API
   * @returns {Promise<?User>} The user, or null if not found
   * @example
   * // Fetch a user by ID
   * const user = await client.users.fetch(123456);
   * 
   * // Fetch a user by link
   * const user = await client.users.fetch('username');
   * 
   * // Force fetch from API
   * const user = await client.users.fetch(123456, { force: true });
   */
  async fetch(user: number | string, { cache = true, force = false } = {}): Promise<User | null> {
    const id = this.resolveId(user);
    
    // If it's a string and not a number, check link cache first
    if (!id && typeof user === 'string') {
      const cachedId = this.linkCache.get(user);
      if (cachedId && !force) {
        const existing = this.cache.get(cachedId);
        if (existing) return existing;
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
        return userInstance;
      } catch (error) {
        log.error(`Error fetching user by link ${user}:`, error);
        return null;
      }
    }
    
    if (!id) return null;
    
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    try {
      const data = await this.client.api.users.get(id);
      const userInstance = new User(this.client, data);
      if (cache) {
        this.cache.set(id, userInstance);
        if (data.Link) this.linkCache.set(data.Link, data.ID);
      }
      return userInstance;
    } catch (error) {
      log.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  /**
   * Resolves a user resolvable to a User object
   * @param {User} user - The user resolvable to resolve
   * @returns {?User} The resolved user
   */
  resolve(user: User): User | null {
    return super.resolve(user);
  }

  /**
   * Resolves a user resolvable to a user ID
   * @param {string|number|User} user - The user resolvable to resolve
   * @returns {?number} The resolved user ID
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