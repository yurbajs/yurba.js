import { UserModel } from '@yurbajs/types';
import { Client } from '../client/Client';
import { Base } from './Base';

/**
 * Represents a user on Yurba
 * @extends {Base}
 * @category Structures
 */
export class User extends Base {
  /**
   * The user's ID
   * @type {number}
   * @readonly
   */
  public readonly id: number;
  
  private _data: UserModel;

  /**
   * @param {Client} client - The instantiating client
   * @param {UserData} data - The data for the user
   */
  constructor(client: Client, data: UserModel) {
    super(client);
    this.id = data.ID;
    this._data = data;
    this._patch(data);
  }

  /**
   * Updates the user with new data
   * @param {UserData} data - The new user data
   * @returns {UserData} The updated data
   * @private
   */
  _patch(data: UserModel) {
    this._data = data;
    Object.assign(this, data);
    return data;
  }

  /**
   * Returns the user data as JSON
   * @returns {UserData} The user data
   */
  toJSON(): UserModel {
    return this._data;
  }

  /**
   * Returns a string representation of the user
   * @returns {string} The user's link with @ prefix
   */
  toString(): string {
    return `@"${this._data.Link}"`;
  }

  get [Symbol.for('nodejs.util.inspect.custom')]() {
    return () => this.toJSON();
  }

  /**
   * Whether this user is a bot
   * @type {boolean}
   * @readonly
   */
  get bot(): boolean {
    return this._data.Link?.endsWith('_bot') ?? false;
  }
}