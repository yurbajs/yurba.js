import { REST } from '@yurbajs/rest';
import { DialogModel } from '@yurbajs/types';
import CachedManager from './CachedManager';
import { Client } from '../client/Client';
import { CDLog } from '../utils/devlog';

const log = CDLog('DialogManager');

/**
 * Manages API methods for dialogs and stores their cache.
 */
export default class DialogManager extends CachedManager<number, DialogModel> {
  private api: REST;

  constructor(client: Client, api: REST, iterable?: Iterable<DialogModel>) {
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
  async fetch(dialogId: number, { cache = true, force = false } = {}): Promise<DialogModel | null> {
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
  resolve(dialog: any): DialogModel | null {
    return super.resolve(dialog);
  }

  /**
   * Resolves a dialog resolvable to a dialog id.
   */
  resolveId(dialog: any): number | null {
    if (typeof dialog === 'number') return dialog;
    return super.resolveId(dialog);
  }


}