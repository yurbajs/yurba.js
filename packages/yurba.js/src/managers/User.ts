import { REST } from '@yurbajs/rest';
import { User } from '@yurbajs/types';
import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';

const log = CDLog('UserManager');

/**
 * Manages API methods for users and stores their cache.
 */
export default class UserManager extends CachedManager<number, User> {
  private api: REST;

  constructor(client: Client, api: REST, iterable?: Iterable<User>) {
    super(client, Object as any, iterable);
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



  /**
   * Get user display name
   */
  getDisplayName(user: User): string {
    const name = user.Name?.trim() || '';
    const surname = user.Surname?.trim() || '';
    
    if (name && surname) {
      return `${name} ${surname}`;
    }
    
    return name || surname || user.Link || `User ${user.ID}`;
  }

  /**
   * Check if user is online
   */
  isOnline(user: User): boolean {
    return (user.Online as any)?.State === 1;
  }

  /**
   * Check if user is verified
   */
  isVerified(user: User): boolean {
    return (user.Verify as any)?.State === 1;
  }

  /**
   * Check if user is banned
   */
  isBanned(user: User): boolean {
    return user.Ban === true;
  }

  /**
   * Check if user is deleted
   */
  isDeleted(user: User): boolean {
    return user.Deleted === true;
  }

  /**
   * Check if user is creative
   */
  isCreative(user: User): boolean {
    return user.Creative === true;
  }

  /**
   * Get user avatar URL
   */
  getAvatarUrl(user: User): string | null {
    if (user.CosmeticAvatar && user.CosmeticAvatar > 0) {
      return `https://cdn.yurba.one/avatars/${user.CosmeticAvatar}.jpg`;
    }
    
    if (user.Avatar && user.Avatar > 0) {
      return `https://cdn.yurba.one/avatars/${user.Avatar}.jpg`;
    }
    
    return null;
  }

  /**
   * Get user banner URL
   */
  getBannerUrl(user: User): string | null {
    if (user.Banner && user.Banner > 0) {
      return `https://cdn.yurba.one/banners/${user.Banner}.jpg`;
    }
    return null;
  }

  /**
   * Get user profile URL
   */
  getProfileUrl(user: User): string {
    return `https://me.yurba.one/${user.Link || user.ID}`;
  }

  /**
   * Get user age from birthday
   */
  getAge(user: User): number | null {
    if (!user.Birthday) return null;
    
    const birthDate = new Date(user.Birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }


}