import BaseManager from './BaseManager';
import { Client } from '../client/Client';

/**
 * Manages the API methods of a data model along with a collection of instances.
 */
export default abstract class DataManager<K, V> extends BaseManager {
  public readonly holds!: new (...args: any[]) => V;

  constructor(client: Client, holds: new (...args: any[]) => V) {
    super(client);
    Object.defineProperty(this, 'holds', { value: holds });
  }

  /**
   * The cache of items for this manager.
   */
  abstract get cache(): Map<K, V>;

  /**
   * Resolves a data entry to a data Object.
   */
  resolve(idOrInstance: K | V): V | null {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string' || typeof idOrInstance === 'number') {
      return this.cache.get(idOrInstance as K) ?? null;
    }
    return null;
  }

  /**
   * Resolves a data entry to an instance id.
   */
  resolveId(idOrInstance: K | V): K | null {
    if (idOrInstance instanceof this.holds) return (idOrInstance as any).id;
    if (typeof idOrInstance === 'string' || typeof idOrInstance === 'number') {
      return idOrInstance as K;
    }
    return null;
  }

  valueOf() {
    return this.cache;
  }
}
