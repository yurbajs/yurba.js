import { UserModel } from '@yurbajs/types';
import { User } from '../structures/User';
import { Client } from '../client/Client';

/**
 * User client manager for handling current user data
 * @category Managers
 */
export default class UserClientManager {
  /** @ignore */
  private client: Client;
  private _user?: User;
  private _lastFetch: number = 0;
  private _cacheTTL: number = 120000; // 2 minutes
  private _fetchPromise?: Promise<User>;

  constructor(client: Client) {
    this.client = client;
  }

  async fetch(force = false): Promise<User> {
    const now = Date.now();


    if (!force && this._user && (now - this._lastFetch) < this._cacheTTL) {
      return this._user;
    }

    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = this.client.api.users.me().then(userData => {
      const user = new User(this.client, userData);
      this._user = user;
      this._lastFetch = Date.now();
      this._fetchPromise = undefined;
      return user;
    });

    return this._fetchPromise;
  }

  get(): UserModel | null {
    if (!this._user) {
      this.fetch().catch(() => {});
      return null;
    }
    return this._user.toJSON();
  }

  invalidate(): void {
    this._user = undefined;
    this._lastFetch = 0;
  }
}
