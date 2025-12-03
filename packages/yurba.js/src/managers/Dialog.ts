import { REST } from '@yurbajs/rest';
import { Dialog } from '@yurbajs/types';
import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';

const log = CDLog('DialogManager');

/**
 * Manages API methods for dialogs and stores their cache.
 */
export default class DialogManager extends CachedManager<number, Dialog> {
  private api: REST;

  constructor(client: Client, api: REST, iterable?: Iterable<Dialog>) {
    super(client, Object as any, iterable);
    this.api = api;
  }

  /**
   * The cache of this manager
   * @type {Map<number, Dialog>}
   */

  /**
   * Obtains a dialog from Yurba, or the dialog cache if it's already available.
   */
  async fetch(dialogId: number, { cache = true, force = false } = {}): Promise<Dialog | null> {
    if (!force) {
      const existing = this.cache.get(dialogId);
      if (existing) return existing;
    }

    try {
      const data = await this.api.dialogs.get(dialogId);
      return this._add(data, cache, { id: dialogId });
    } catch (error) {
      log.error(`Error fetching dialog ${dialogId}:`, error);
      return null;
    }
  }

  /**
   * Resolves a dialog resolvable to a Dialog object.
   */
  resolve(dialog: any): Dialog | null {
    return super.resolve(dialog);
  }

  /**
   * Resolves a dialog resolvable to a dialog id.
   */
  resolveId(dialog: any): number | null {
    if (typeof dialog === 'number') return dialog;
    return super.resolveId(dialog);
  }

  /**
   * Get dialog name (from cache or fetch)
   */
  async getName(dialogId: number): Promise<string | null> {
    const dialog = await this.fetch(dialogId);
    return dialog?.Name || null;
  }

  /**
   * Check if user is member of dialog
   */
  async isMember(dialogId: number, userId: number): Promise<boolean> {
    try {
      const member = await this.api.dialogs.getMember(dialogId, userId);
      return member !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get dialog name from cache only
   */
  getCachedName(dialogId: number): string | null {
    const dialog = this.cache.get(dialogId);
    return dialog?.Name || null;
  }
}