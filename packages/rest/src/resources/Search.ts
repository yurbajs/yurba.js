import { REST } from '../index';
import { DialogModel, FindDialogPayload, UserModel, FindUserPayload, Track } from '@yurbajs/types';

/**
 * @category Resources
 */
export class SearchResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Search
   * @namespace
   */

  /**
   * Finds dialogs
   * @rest POST /dialogs/find/{mask}
   * @group Search
   * @param query - Search mask
   * @param payload - {@link FindDialogPayload} Search data
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<DialogModel[]>} Array of {@link DialogModel} objects
   * @throws {Error} If parameters are invalid
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
  async dialogs(query: string, payload: FindDialogPayload, page: number = 0): Promise<DialogModel[]> {
    if (!query || page < 0) throw new Error('Invalid parameters');
    if (!payload) throw new Error('Invalid search payload');
    return this.client.post<DialogModel[]>(`/dialogs/find/${query}?page=${page}`, payload);
  }

  /**
   * Finds users
   * @rest POST /users/find
   * @group Search
   * @param payload - {@link FindUserPayload} Search filters
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} Array of {@link UserModel} objects
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * // Basic search
   * const users = await rest.search.users({
   *   sort: 0,
   *   country: 0,
   *   region: 0,
   *   city: 0,
   *   worksAt: "",
   *   relationships: 0,
   *   online: 0,
   *   avatar: 0
   * });
   * 
   * // Search married users from Ukraine
   * const marriedUsers = await rest.search.users({
   *   sort: 0,
   *   country: 228, // Ukraine
   *   region: 0,
   *   city: 0,
   *   worksAt: "",
   *   relationships: RelationshipStatus.Married,
   *   online: 1,
   *   avatar: 0
   * });
   * ```
   */
  async users(payload: FindUserPayload, page: number = 0): Promise<UserModel[]> {
    if (!payload || page < 0) throw new Error('Invalid parameters');
    return this.client.post<UserModel[]>(`/users/find?page=${page}`, payload);
  }

  /**
   * Finds tracks
   * @rest GET /musebase/find/{mask} *
   * @group Search
   * @param query - Song name or artist
   * @param page - Page number (optional)
   * @since 1.0.0
   * @returns {Promise<Track[]>} Array of {@link Track} objects
   * @throws {Error} If query is invalid or page is negative
   * @example
   * ```javascript
   * // Search by song name
   * const tracks = await rest.search.tracks('Bohemian Rhapsody');
   * 
   * // Search by artist
   * const artistTracks = await rest.search.tracks('Queen');
   * 
   * // With pagination
   * const moreTracks = await rest.search.tracks('rock', 1);
   * ```
   */
  async tracks(query: string, page?: number): Promise<Track[]> {
    if (!query) throw new Error('Invalid query');
    if (page !== undefined && page < 0) throw new Error('Invalid page number');
    const url = page !== undefined ? `/musebase/find/${query}?page=${page}` : `/musebase/find/${query}`;
    return this.client.get<Track[]>(url);
  }
}