import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';
import { Dialog } from '../structures/Dialog';

const log = CDLog('DialogManager');

/**
 * Manages API methods for dialogs and stores their cache
 * @extends {CachedManager}
 * @category Managers
 */
export default class DialogManager extends CachedManager<number, Dialog> {
  /**
   * @param {Client} client - The client that instantiated this manager
   * @param {Iterable<Dialog>} [iterable] - An iterable of dialogs to cache
   */
  constructor(client: Client, iterable?: Iterable<Dialog>) {
    super(client, Dialog, iterable);
  }

  /**
   * The cache of dialogs
   * @type {Map<number, Dialog>}
   * @name DialogManager#cache
   * @readonly
   */

  /**
   * Obtains a dialog from Yurba, or the dialog cache if it's already available
   * @param {number|string} dialog - The dialog ID or link to fetch
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.cache=true] - Whether to cache the fetched dialog
   * @param {boolean} [options.force=false] - Whether to skip the cache check and request the API
   * @returns {Promise<?Dialog>} The dialog, or null if not found
   */
  async fetch(dialog: number | string, { cache = true, force = false } = {}): Promise<Dialog | null> {
    const id = this.resolveId(dialog);

    if (!force && id) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    try {
      const data = await this.client.api.dialogs.get(typeof dialog === 'string' ? parseInt(dialog, 10) : dialog);
      return this._add(data, cache, { id: data.ID });
    } catch (error) {
      log.error(`Error fetching dialog ${dialog}:`, error);
      return null;
    }
  }

  /**
   * Resolves a dialog resolvable to a Dialog object
   * @param {Dialog} dialog - The dialog resolvable to resolve
   * @returns {?Dialog} The resolved dialog
   */
  resolve(dialog: Dialog): Dialog | null {
    return super.resolve(dialog);
  }

  /**
   * Resolves a dialog resolvable to a dialog ID
   * @param {string|number|Dialog} dialog - The dialog resolvable to resolve
   * @returns {?number} The resolved dialog ID
   */
  resolveId(dialog: string | number | Dialog): number | null {
    if (typeof dialog === 'number') return dialog;
    if (typeof dialog === 'string') {
      const parsed = parseInt(dialog, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return super.resolveId(dialog);
  }
}
