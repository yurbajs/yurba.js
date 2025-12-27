import { User as UserData } from '@yurbajs/types';
import { Client } from '../client/Client';
import { Base } from './Base';

export class User extends Base {
  public readonly id: number;

  constructor(client: Client, data: UserData) {
    super(client);
    this.id = data.ID;
    this._patch(data);
  }

  _patch(data: UserData) {
    Object.assign(this, data);
    return data;
  }
}