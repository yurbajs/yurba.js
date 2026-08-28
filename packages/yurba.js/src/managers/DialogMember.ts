import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';
import { DialogMember } from '../structures/DialogMember';

const log = CDLog('DialogMemberManager');

/**
 * Manages API methods for dialog members and stores their cache
 * @extends {CachedManager}
 * @category Managers
 */
export default class DialogMemberManager extends CachedManager<string, DialogMember> {
  private dialogId: number;

  /**
   * @param {Client} client - The client that instantiated this manager
   * @param {number} dialogId - The dialog ID this manager belongs to
   * @param {Iterable<DialogMember>} [iterable] - An iterable of dialog members to cache
   */
  constructor(client: Client, dialogId: number, iterable?: Iterable<DialogMember>) {
    super(client, DialogMember, iterable);
    this.dialogId = dialogId;
  }

  /**
   * The cache of dialog members
   * @type {Map<string, DialogMember>}
   * @name DialogMemberManager#cache
   * @readonly
   */

  /**
   * Generate cache key for dialog member
   * @param {number} userId - The user ID
   * @returns {string} The cache key
   * @private
   */
  private getCacheKey(userId: number): string {
    return `${this.dialogId}-${userId}`;
  }

  /**
   * Fetch all members and populate cache
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.cache=true] - Whether to cache the fetched members
   * @param {boolean} [options.force=false] - Whether to skip the cache check and request the API
   * @returns {Promise<DialogMember[]>} Array of dialog members
   */
  async fetchAll({ cache = true } = {}): Promise<DialogMember[]> {
    try {
      const members: DialogMember[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const data = await this.client.api.dialogs.getMembers(this.dialogId, page);

        if (data.length === 0) {
          hasMore = false;
          break;
        }

        for (const memberData of data) {
          const cacheKey = this.getCacheKey(memberData.Member.ID);
          const member = this._add(memberData, cache, { id: cacheKey });
          members.push(member);
        }

        hasMore = data.length === 10;
        page++;
      }

      return members;
    } catch (error) {
      log.error(`Error fetching members from dialog ${this.dialogId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific member (checks cache first, then fetches all if needed)
   * @param {number} userId - The user ID to get
   * @returns {Promise<?DialogMember>} The dialog member, or null if not found
   */
  async fetch(userId: number): Promise<DialogMember | null> {
    const cacheKey = this.getCacheKey(userId);
    const existing = this.cache.get(cacheKey);
    if (existing) return existing;

    await this.fetchAll();
    return this.cache.get(cacheKey) ?? null;
  }

  /**
   * Add member to dialog
   * @param {number} userId - The user ID to add
   * @returns {Promise<?DialogMember>} The added dialog member, or null if failed
   */
  async add(userId: number): Promise<DialogMember | null> {
    try {
      const data = await this.client.api.dialogs.addMember(this.dialogId, userId);
      const cacheKey = this.getCacheKey(userId);
      return this._add(data, true, { id: cacheKey });
    } catch (error) {
      log.error(`Error adding member ${userId} to dialog ${this.dialogId}:`, error);
      return null;
    }
  }

  /**
   * Remove member from dialog
   * @param {number} userId - The user ID to remove
   * @returns {Promise<boolean>} Whether the removal was successful
   */
  async remove(userId: number): Promise<boolean> {
    try {
      await this.client.api.dialogs.removeMember(this.dialogId, userId);
      const cacheKey = this.getCacheKey(userId);
      this.cache.delete(cacheKey);
      return true;
    } catch (error) {
      log.error(`Error removing member ${userId} from dialog ${this.dialogId}:`, error);
      return false;
    }
  }

  /**
   * Check if user is member of dialog
   * @param {number} userId - The user ID to check
   * @returns {Promise<boolean>} Whether the user is a member
   */
  async isMember(userId: number): Promise<boolean> {
    const member = await this.fetch(userId);
    return member !== null;
  }

  /**
   * Resolves a member resolvable to a DialogMember object
   * @param {DialogMember} member - The member resolvable to resolve
   * @returns {?DialogMember} The resolved member
   */
  resolve(member: DialogMember): DialogMember | null {
    return super.resolve(member);
  }

  /**
   * Resolves a member resolvable to a cache key
   * @param {string|number|DialogMember} member - The member resolvable to resolve
   * @returns {?string} The resolved cache key
   */
  resolveId(member: string | number | DialogMember): string | null {
    if (typeof member === 'number') return this.getCacheKey(member);
    if (typeof member === 'string') return member;
    return super.resolveId(member);
  }
}
