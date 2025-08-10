import { REST, RequestConfig } from '../BaseClient';
import { BaseResource } from './Base';
import { User, Photo } from '@yurbajs/types';

/**
 * User resource for managing user-related API operations
 *
 * @example Basic usage
 * ```typescript
 * const user = await client.users.getMe();
 * const userByTag = await client.users.getByTag('rastgame');
 * ```
 *
 * @public
 */
export class UserResource extends BaseResource {
  /**
   * Creates a new user resource instance
   * @param client - REST client instance
   */
  constructor(client: REST) {
    super(client);
  }

  /**
   * Get current authenticated user information
   *
   * @returns Promise resolving to current user data
   *
   * @example
   * ```typescript
   * const user = await client.users.getMe();
   * console.log(`Logged in as: ${user.name}`);
   * ```
   *
   * @throws {ApiError} When authentication fails or user not found
   */
  public async getMe(config?: RequestConfig): Promise<User> {
    return this.request<User>('GET', '/get_me', undefined, config);
  }

  /**
   * Get user information by tag
   *
   * @param tag - User tag (without @ symbol)
   * @param config - Request configuration
   * @returns Promise resolving to user data
   *
   * @example
   * ```typescript
   * const user = await client.users.getByTag('rastgame');
   * console.log(`User: ${user.name} (@${user.tag})`);
   * ```
   *
   * @throws {ApiError} When user not found or access denied
   */
  public async getByTag(tag: string, config?: RequestConfig): Promise<User> {
    this.validateRequired({ tag }, ['tag']);
    this.validateConstraints(tag, { minLength: 1, maxLength: 50 }, 'tag');

    return this.request<User>('GET', `/user/${tag}`, undefined, config);
  }

  /**
   * Get user photos with pagination and filtering
   *
   * @param tag - User tag
   * @param options - Photo retrieval options
   * @param options.page - Page number (default: 0)
   * @param options.mode - Photo visibility mode (0: all, 1: public, 2: private)
   * @param config - Request configuration
   * @returns Promise resolving to array of photos
   *
   * @example
   * ```typescript
   * // Get first page of all photos
   * const photos = await client.users.getPhotos('rastgame');
   *
   * // Get public photos from page 2
   * const publicPhotos = await client.users.getPhotos('rastgame', {
   *   page: 2,
   *   mode: 1
   * });
   * ```
   */
  public async getPhotos(
    tag: string,
    options: { page?: number; mode?: 0 | 1 | 2 } = {},
    config?: RequestConfig
  ): Promise<Photo[]> {
    const { page = 0, mode = 0 } = options;

    this.validateRequired({ tag }, ['tag']);
    this.validateConstraints(page, { min: 0 }, 'page');
    this.validateConstraints(mode, { enum: [0, 1, 2] }, 'mode');

    return this.request<Photo[]>('GET', `/user/${tag}/photos`, { page, mode }, config);
  }

  /**
   * Отримати друзів користувача
   * @param tag Тег користувача
   * @param page Номер сторінки
   * @returns Список друзів
   */
  async getFriends(tag: string, page: number): Promise<User[]> {
    return this.client.get<User[]>(`/user/${tag}/friends?page=${page}`);
  }

  /**
   * Отримати вхідні запити на дружбу
   * @param page Номер сторінки
   * @returns Список запитів
   */
  async getIncomingRequests(page: number): Promise<User[]> {
    return this.client.get<User[]>(`/incoming_requests?page=${page}`);
  }

  /**
   * Отримати вихідні запити на дружбу
   * @param page Номер сторінки
   * @returns Список запитів
   */
  async getOutgoingRequests(page: number): Promise<User[]> {
    return this.client.get<User[]>(`/outcoming_requests?page=${page}`);
  }

  /**
   * Ігнорувати вхідний запит на дружбу
   * @param userId ID користувача
   * @returns Результат операції
   */
  async ignoreIncomingRequest(userId: number): Promise<any> {
    return this.client.delete<any>(`/incoming_requests/${userId}`);
  }

  /**
   * Отримати відносини з користувачем
   * @param tag Тег користувача
   * @returns Дані про відносини
   */
  async getRelationships(tag: string): Promise<any> {
    return this.client.get<any>(`/user/${tag}/relationships`);
  }

  /**
   * Підписатися на друзів користувача
   * @param tag Тег користувача
   * @returns Результат підписки
   */
  async subscribeFriends(tag: string): Promise<any> {
    return this.client.patch<any>(`/user/${tag}/subscribe`, {});
  }
}
