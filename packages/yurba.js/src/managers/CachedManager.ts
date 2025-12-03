import DataManager from './DataManager';
import { Client } from '../client/Client';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 */
class LRUCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 500, ttl = 600000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: K, value: V): this {
    const entry = { value, timestamp: Date.now() };

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, entry);
    return this;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
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
    if (Math.random() < 0.1) {
      this._cache.cleanup();
    }
    return this._cache as any;
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