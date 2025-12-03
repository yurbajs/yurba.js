import DataManager from './DataManager';
import { Client } from '../client/Client';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 */
interface CacheEntry<V> {
  value: V;
  timestamp: number;
}

class LRUCache<K, V> extends Map<K, CacheEntry<V>> {
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 500, ttl = 600000) { // 10 minutes default
    super();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: K, value: V): this {
    const entry: CacheEntry<V> = {
      value,
      timestamp: Date.now()
    };

    if (this.has(key)) {
      this.delete(key);
    } else if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      this.delete(firstKey);
    }
    return super.set(key, entry);
  }

  get(key: K): V | undefined {
    const entry = super.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.delete(key);
    super.set(key, entry);
    return entry.value;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.delete(key);
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
    // Cleanup expired entries periodically
    if (Math.random() < 0.1) { // 10% chance on each access
      this._cache.cleanup();
    }
    
    return new Proxy(this._cache, {
      get: (target, prop) => {
        if (prop === 'get') {
          return (key: K) => target.get(key);
        }
        if (prop === 'set') {
          return (key: K, value: V) => target.set(key, value);
        }
        if (prop === 'has') {
          return (key: K) => target.get(key) !== undefined;
        }
        if (prop === 'delete') {
          return (key: K) => target.delete(key);
        }
        return (target as any)[prop];
      }
    }) as any;
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