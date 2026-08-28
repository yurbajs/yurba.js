import { REST } from '../index';
import { Shop, Item } from '@yurbajs/types';

/**
 * @category Resources
 */
export class ShopResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Shop
   * @namespace
   */

  /**
   * Gets shop categories and items
   * @rest GET /shop
   * @group Shop
   * @since 1.0.0
   * @returns {Promise<Shop[]>} Array of {@link Shop} objects
   * @example
   * ```javascript
   * const shop = await rest.shop.get();
   * ```
   */
  async get(): Promise<Shop[]> {
    return this.client.get<Shop[]>('/shop');
  }

  /**
   * Gets user inventory
   * @rest GET /shop/inventory
   * @group Shop
   * @since 1.0.0
   * @returns {Promise<Item[]>} Array of {@link Item} objects
   * @example
   * ```javascript
   * const inventory = await rest.shop.inventory();
   * ```
   */
  async inventory(): Promise<Item[]> {
    return this.client.get<Item[]>('/shop/inventory');
  }
}
