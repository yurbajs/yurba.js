import DataManager from './DataManager';
import { Client } from '../client/Client';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 */
class LRUCache<K, V> extends Map<K, V> {
  private maxSize: number;

  constructor(maxSize = 1000) {
    super();
    this.maxSize = maxSize;
  }

  set(key: K, value: V): this {
    if (this.has(key)) {
      this.delete(key);
    } else if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      this.delete(firstKey);
    }
    return super.set(key, value);
  }

  get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      this.delete(key);
      super.set(key, value);
    }
    return value;
  }
}

export default class CachedManager<K, V> extends DataManager<K, V> {
  private _cache: LRUCache<K, V>;

  constructor(client: Client, holds: new (...args: any[]) => V, iterable?: Iterable<V>) {
    super(client, holds);
    
    this._cache = new LRUCache<K, V>(500); // Default 500 items

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }

  /**
   * The cache of items for this manager.
   */
  get cache(): Map<K, V> {
    return this._cache;
  }

  _add(data: any, cache = true, { id, extras = [] }: { id?: K; extras?: any[] } = {}): V {
    const existing = this.cache.get(id ?? data.id);
    if (existing) {
      if (cache) {
        if (typeof (existing as any)._patch === 'function') {
          (existing as any)._patch(data);
        }
        return existing;
      }

      if (typeof (existing as any)._clone === 'function') {
        const clone = (existing as any)._clone();
        if (typeof clone._patch === 'function') {
          clone._patch(data);
        }
        return clone;
      }
    }

    const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
    if (cache) this.cache.set(id ?? (entry as any).id, entry);
    return entry;
  }
}