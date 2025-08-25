import { REST } from '../index';
import { Shop, Item } from '@yurbajs/types';

export class ShopResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Get shop categories and items
   * @group Shop
   * @since 1.0.0
   * @returns {Promise<Shop[]>} Shop categories with items
   * @example
   * ```javascript
   * const shop = await rest.shop.get();
   * ```
   */
  async get(): Promise<Shop[]> {
    return this.client.get<Shop[]>('/shop');
  }

  /**
   * Get user inventory
   * @group Shop
   * @since 1.0.0
   * @returns {Promise<Item[]>} User's inventory items
   * @example
   * ```javascript
   * const inventory = await rest.shop.inventory();
   * ```
   */
  async inventory(): Promise<Item[]> {
    return this.client.get<Item[]>('/shop/inventory');
  }
}