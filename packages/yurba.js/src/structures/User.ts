import { User as UserData } from '@yurbajs/types';
import { Client } from '../client/Client';
import { Base } from './Base';

export class User extends Base {
  public readonly id: number;
  private _data: UserData;

  constructor(client: Client, data: UserData) {
    super(client);
    this.id = data.ID;
    this._data = data;
    this._patch(data);
  }

  _patch(data: UserData) {
    this._data = data;
    Object.assign(this, data);
    return data;
  }

  toJSON(): UserData {
    return this._data;
  }
}