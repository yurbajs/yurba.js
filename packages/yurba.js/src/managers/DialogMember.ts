import { REST } from '@yurbajs/rest';
import { DialogMember } from '@yurbajs/types';
import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';

const log = CDLog('DialogMemberManager');

/**
 * Manages API methods for dialog members and stores their cache.
 */
export default class DialogMemberManager extends CachedManager<string, DialogMember> {
  private api: REST;
  private dialogId: number;

  constructor(client: Client, api: REST, dialogId: number, iterable?: Iterable<DialogMember>) {
    super(client, Object as any, iterable);
    this.api = api;
    this.dialogId = dialogId;
  }

  /**
   * The cache of this manager
   * @type {Map<string, DialogMember>}
   */

  /**
   * Generate cache key for dialog member
   */
  private getCacheKey(userId: number): string {
    return `${this.dialogId}-${userId}`;
  }

  // /**
  //  * Obtains a dialog member from Yurba, or the member cache if it's already available.
  //  */
  // async fetch(userId: number, { cache = true, force = false } = {}): Promise<DialogMember | null> {
  //   const cacheKey = this.getCacheKey(userId);
    
  //   if (!force) {
  //     const existing = this.cache.get(cacheKey);
  //     if (existing) return existing;
  //   }

  //   try {
  //     const data = await this.api.dialogs.getMember(this.dialogId, userId);
  //     return this._add(data, cache, { id: cacheKey });
  //   } catch (error) {
  //     log.error(`Error fetching member ${userId} from dialog ${this.dialogId}:`, error);
  //     return null;
  //   }
  // }

  /**
   * Add member to dialog
   */
  async add(userId: number): Promise<DialogMember | null> {
    try {
      const data = await this.api.dialogs.addMember(this.dialogId, userId);
      const cacheKey = this.getCacheKey(userId);
      return this._add(data, true, { id: cacheKey });
    } catch (error) {
      log.error(`Error adding member ${userId} to dialog ${this.dialogId}:`, error);
      return null;
    }
  }

  /**
   * Remove member from dialog
   */
  async remove(userId: number): Promise<boolean> {
    try {
      await this.api.dialogs.removeMember(this.dialogId, userId);
      const cacheKey = this.getCacheKey(userId);
      this.cache.delete(cacheKey);
      return true;
    } catch (error) {
      log.error(`Error removing member ${userId} from dialog ${this.dialogId}:`, error);
      return false;
    }
  }

  // /**
  //  * Check if user is member of dialog
  //  */
  // async isMember(userId: number): Promise<boolean> {
  //   const member = await this.fetch(userId);
  //   return member !== null;
  // }

  /**
   * Resolves a member resolvable to a DialogMember object.
   */
  resolve(member: any): DialogMember | null {
    return super.resolve(member);
  }

  /**
   * Resolves a member resolvable to a cache key.
   */
  resolveId(member: any): string | null {
    if (typeof member === 'number') return this.getCacheKey(member);
    if (typeof member === 'string') return member;
    return super.resolveId(member);
  }
}