import { REST } from '../index';
import { Dialog, FindDialogPayload } from '@yurbajs/types';

export class SearchResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Find dialogs
   * @group Search
   * @param query - Search mask
   * @param payload - Search data
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<Dialog[]>} Dialog list
   * @example
   * ```javascript
   * // Basic search
   * const results = await rest.search.dialogs('programming', {
   *   sort: 0,    // by relevance
   *   type: 0,    // all types
   *   country: 0, // all countries
   *   topic: 0    // all topics
   * });
   * 
   * // Search groups by popularity
   * const groups = await rest.search.dialogs('tech', {
   *   sort: 1,    // by popularity
   *   type: 1,    // groups only
   *   country: 0,
   *   topic: 5    // tech & science
   * });
   * 
   * // Search channels alphabetically
   * const channels = await rest.search.dialogs('news', {
   *   sort: 2,    // alphabetically
   *   type: 2,    // channels only
   *   country: 231, // USA
   *   topic: 0
   * }, 1); // page 1
   * 
   * // Using enum types
   * import { Country, FDTopic } from '@yurbajs/types';
   * const education = await rest.search.dialogs('learn', {
   *   sort: 0,
   *   type: 1,
   *   country: Country.Ukraine,
   *   topic: FDTopic.Education
   * });
   * ```
   */
  async dialogs(query: string, payload: FindDialogPayload, page: number = 0): Promise<Dialog[]> {
    return this.client.post<Dialog[]>(`/dialogs/find/${query}?page=${page}`, payload);
  }
}