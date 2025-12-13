import { REST } from '@yurbajs/rest';
import { User } from '@yurbajs/types';

export default class UserClientManager {
  private api: REST;
  private _user?: User;
  private _lastFetch: number = 0;
  private _cacheTTL: number = 120000; // 2 minutes
  private _fetchPromise?: Promise<User>;

  constructor(api: REST) {
    this.api = api;
  }

  async fetch(force = false): Promise<User> {
    const now = Date.now();
    

    if (!force && this._user && (now - this._lastFetch) < this._cacheTTL) {
      return this._user;
    }

    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = this.api.users.me().then(user => {
      this._user = user;
      this._lastFetch = Date.now();
      this._fetchPromise = undefined;
      return user;
    });
    
    return this._fetchPromise;
  }

  get(): User | null {
    if (!this._user) {
      this.fetch().catch(() => {});
      return null;
    }
    return this._user;
  }

  invalidate(): void {
    this._user = undefined;
    this._lastFetch = 0;
  }
}