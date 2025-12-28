/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '../client/Client';

export abstract class Base {
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