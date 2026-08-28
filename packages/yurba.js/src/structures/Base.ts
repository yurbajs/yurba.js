
import { Client } from '../client/Client';

export abstract class Base {
  /** @ignore */
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: any) {
    return data;
  }

  valueOf() {
    return (this as any).id;
  }
}
