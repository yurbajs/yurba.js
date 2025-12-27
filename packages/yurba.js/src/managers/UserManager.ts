import { REST } from '@yurbajs/rest';
import { User as UserData } from '@yurbajs/types';
import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';
import { User } from '../structures/User';

const log = CDLog('UserManager');

/**
 * Manages API methods for users and stores their cache.
 */
export default class UserManager extends CachedManager<number, User> {
  private api: REST;

  constructor(client: Client, api: REST, iterable?: Iterable<User>) {
    super(client, User, iterable);
    this.api = api;
  }

  /**
   * The cache of this manager
   * @type {Map<number, User>}
   */

  /**
   * Obtains a user from Yurba, or the user cache if it's already available.
   */
  async fetch(user: number | string, { cache = true, force = false } = {}): Promise<User | null> {
    const id = this.resolveId(user as any);
    if (!id) return null;
    
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    try {
      const data = await this.api.users.get(id);
      return this._add(data, cache, { id });
    } catch (error) {
      log.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  /**
   * Resolves a user resolvable to a User object.
   */
  resolve(user: any): User | null {
    return super.resolve(user);
  }

  /**
   * Resolves a user resolvable to a user id.
   */
  resolveId(user: any): number | null {
    if (typeof user === 'number') return user;
    if (typeof user === 'string') {
      const parsed = parseInt(user, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return super.resolveId(user);
  }






}