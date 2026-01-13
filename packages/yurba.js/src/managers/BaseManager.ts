import { Client } from '../client/Client';

/**
 * Manages the API methods of a data model.
 */
export default abstract class BaseManager {
  /** @ignore */
  protected client!: Client;


  constructor(client: Client) {
    Object.defineProperty(this, 'client', {
        value: client,
        enumerable: false, 
        writable: true,
        configurable: true
      });
  }
}