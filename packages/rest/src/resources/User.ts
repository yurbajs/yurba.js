import { REST } from '../index';
import { UserModel, RelationshipsResult, FindUserPayload, Gift, BaseOkay } from '@yurbajs/types';

export class UserResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Users Core
   * @namespace
   */

  /**
   * Gets current user information
   * @group Users Core
   * @since 1.0.0
   * @returns {Promise<User>} {@link User} Current user
   * @example
   * ```javascript
   * const me = await rest.users.me();
   * ```
   */
  async me(): Promise<UserModel> {
    return this.client.get<UserModel>('/get_me');
  }

  /**
   * Gets user by identifier
   * @group Users Core
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<UserModel>} {@link UserModel} User information
   * @throws {Error} If user identifier is invalid
   * @example
   * ```javascript
   * const user = await rest.users.get('username');
   * const userById = await rest.users.get(12345);
   * const userByUid = await rest.users.get('u12345');
   * ```
   */
  async get(user: string | number): Promise<UserModel> {
    if (!user || (typeof user === 'string' && user.length > 255)) throw new Error('Invalid user');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.get<UserModel>(`/user/${resolvedUser}`);
  }

  /**
   * User Friends
   * @namespace
   */

  /**
   * Gets current user's friends
   * @group User Friends
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} Array of {@link UserModel} objects
   * @throws {Error} If user not found in cache
   * @example
   * ```javascript
   * const friends = await rest.users.friends();
   * const nextPage = await rest.users.friends(1);
   * ```
   */
  async friends(page: number = 0): Promise<UserModel[]> {
    if (page < 0) throw new Error('Invalid page number');
    const user = await this.client.getCachedUser();
    if (!user) throw new Error('User not found in cache');
    return this.client.get<UserModel[]>(`/user/${user.id}/friends`, { page });
  }

  /**
   * Gets user friends
   * @group User Friends
   * @param user - User ({tag}/{id}/u{id})
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} Array of {@link UserModel} objects
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const friends = await rest.users.getFriends('username', 0);
   * const friendsById = await rest.users.getFriends(12345, 1);
   * ```
   */
  async getFriends(user: string | number, page: number): Promise<UserModel[]> {
    if (!user || page < 0) throw new Error('Invalid parameters');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.get<UserModel[]>(`/user/${resolvedUser}/friends`, { page });
  }

  /**
   * User Gifts
   * @namespace
   */

  /**
   * Gets current user's gifts
   * @group User Gifts
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<Gift[]>} Array of {@link Gift} objects
   * @throws {Error} If user not found in cache or page is invalid
   * @example
   * ```javascript
   * const gifts = await rest.users.gifts();
   * const nextPage = await rest.users.gifts(1);
   * ```
   */
  async gifts(page: number = 0): Promise<Gift[]> {
    if (page < 0) throw new Error('Invalid page number');
    const user = await this.client.getCachedUser();
    if (!user) throw new Error('User not found in cache');
    return this.client.get<Gift[]>(`/user/${user.id}/gifts`, { page });
  }

  /**
   * Gets user gifts
   * @group User Gifts
   * @param user - User ({tag}/{id}/u{id})
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<Gift[]>} Array of {@link Gift} objects
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const gifts = await rest.users.getGifts('username');
   * const giftsById = await rest.users.getGifts(12345, 1);
   * ```
   */
  async getGifts(user: string | number, page: number = 0): Promise<Gift[]> {
    if (!user || page < 0) throw new Error('Invalid parameters');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.get<Gift[]>(`/user/${resolvedUser}/gifts`, { page });
  }


  /**
   * Subscribe to user
   * @group User Friends
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<RelationshipsResult>} {@link RelationshipsResult} Subscribe result
   * @throws {Error} If user identifier is invalid
   * @example
   * ```javascript
   * const result = await rest.users.subscribe('username');
   * const resultById = await rest.users.subscribe(12345);
   * ```
   */
  async subscribe(user: string | number ): Promise<RelationshipsResult> {
    if (!user) throw new Error('Invalid user identifier');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.patch<RelationshipsResult>(`/user/${resolvedUser}/subscribe`);
  }

  /**
   * Gets user relationships
   * @group User Friends
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<RelationshipsResult>} Relationships data
   * @throws {Error} If user identifier is invalid
   * @example
   * ```javascript
   * const relationships = await rest.users.getRelationships('username');
   * ```
   */
  async getRelationships(user: string | number): Promise<RelationshipsResult> {
    if (!user) throw new Error('Invalid user identifier');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.get<RelationshipsResult>(`/user/${resolvedUser}/relationships`);
  }



  /**
   * Gets incoming friend requests
   * @group User Friends
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} Array of {@link UserModel} objects
   * @throws {Error} If page number is invalid
   * @example
   * ```javascript
   * const requests = await rest.users.incomingRequests();
   * const nextPage = await rest.users.incomingRequests(1);
   * ```
   */
  async incomingRequests(page: number = 0): Promise<UserModel[]> {
    if (page < 0) throw new Error('Invalid page number');
    return this.client.get<UserModel[]>('/incoming_requests', { page });
  }

  /**
   * Gets outgoing friend requests
   * @group User Friends
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} Array of {@link UserModel} objects
   * @throws {Error} If page number is invalid
   * @example
   * ```javascript
   * const requests = await rest.users.outgoingRequests();
   * const nextPage = await rest.users.outgoingRequests(1);
   * ```
   */
  async outgoingRequests(page: number = 0): Promise<UserModel[]> {
    if (page < 0) throw new Error('Invalid page number');
    return this.client.get<UserModel[]>('/outcoming_requests', { page });
  }

  /**
   * Ignores incoming friend request
   * @group User Friends
   * @param userId - User identifier
   * @since 1.0.0
   * @returns {Promise<any>} Operation result
   * @throws {Error} If user ID is invalid
   * @example
   * ```javascript
   * await rest.users.ignoreIncomingRequest(12345);
   * ```
   */
  async ignoreIncomingRequest(userId: number): Promise<BaseOkay> {
    if (userId < 1) throw new Error('Invalid user ID');
    return this.client.delete<BaseOkay>(`/incoming_requests/${userId}`);
  }

  /**
   * Find users
   * @group Users Core
   * @param payload - Search filters
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<UserModel[]>} User list
   * @deprecated Use rest.search.users() instead
   * @example
   * ```javascript
   * // Use rest.search.users() instead
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
   * ```
   */
  async find(payload: FindUserPayload, page: number = 0): Promise<UserModel[]> {
    return this.client.search.users(payload, page);
  }
}