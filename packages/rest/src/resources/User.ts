import { REST } from '../index';
import { User, SubscribeResponse, FindUserPayload } from '@yurbajs/types';

export class UserResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Get me
   * @group Users Core
   * @since 1.0.0
   * @returns {Promise<User>} Current user
   */
  async me(): Promise<User> {
    return this.client.get<User>('/get_me');
  }

  /**
   * Get user 
   * @group Users Core
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<User>} User information
   */
  async get(user: string | number): Promise<User> {
    if (!user || (typeof user === 'string' && user.length > 255)) throw new Error('Invalid user');
    return this.client.get<User>(`/user/${user}`);
  }

  /**
   * Get current user's friends
   * @group User Friends
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<User[]>} Current user's friends
   */
  async friends(page: number = 0): Promise<User[]> {
    const user = await this.client.getCachedUser();
    if (!user) throw new Error('User not found in cache');
    return this.client.get<User[]>(`/user/${user.id}/friends`, { page });
  }

  /**
   * Get user friends
   * @group Users Core
   * @param user - User ({tag}/{id}/u{id})
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<User[]>} User friends
   */
  async getFriends(user: string | number, page: number): Promise<User[]> {
    return this.client.get<User[]>(`/user/${user}/friends`, { page });
  }


  /**
   * Subscribe to user
   * @group User Friends
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<SubscribeResponse>} Subscribe result
   */
  async subscribe(user: string | number ): Promise<SubscribeResponse> {
    return this.client.patch<SubscribeResponse>(`/user/${user}/subscribe`);
  }

  /**
   * Get user relationships
   * @group User Friends
   * @param user - User ({tag}/{id}/u{id})
   * @since 1.0.0
   * @returns {Promise<any>} Relationships data
   */
  async getRelationships(user: string | number): Promise<any> {
    return this.client.get<any>(`/user/${user}/relationships`);
  }



  /**
   * Get incoming friend requests
   * @group User Friends
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<User[]>} Incoming requests
   */
  async incomingRequests(page: number = 0): Promise<User[]> {
    return this.client.get<User[]>('/incoming_requests', { page });
  }

  /**
   * Get outgoing friend requests
   * @group User Friends
   * @param page - Page number
   * @since 1.0.0
   * @returns {Promise<User[]>} Outgoing requests
   */
  async outgoingRequests(page: number = 0): Promise<User[]> {
    return this.client.get<User[]>('/outcoming_requests', { page });
  }

  /**
   * Ignore incoming friend request
   * @group User Friends
   * @param userId - User identifier
   * @since 1.0.0
   * @returns {Promise<any>} Operation result
   */
  async ignoreIncomingRequest(userId: number): Promise<any> {
    return this.client.delete<any>(`/incoming_requests/${userId}`);
  }

  /**
   * Find users
   * @group User Core
   * @param payload - Search filters
   * @param page - Page number (default 0)
   * @since 1.0.0
   * @returns {Promise<User[]>} User list
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
  async find(payload: FindUserPayload, page: number = 0): Promise<User[]> {
    return this.client.search.users(payload, page);
  }
}