import { REST, RequestConfig } from '../index';
import { User, Photo } from '@yurbajs/types';

export class UserResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  async getMe(config?: RequestConfig): Promise<User> {
    return this.client.get<User>('/get_me', {}, config);
  }

  async getByTag(tag: string, config?: RequestConfig): Promise<User> {
    if (!tag || tag.length > 50) throw new Error('Invalid tag');
    return this.client.get<User>(`/user/${tag}`, {}, config);
  }

  async getPhotos(tag: string, options: { page?: number; mode?: 0 | 1 | 2 } = {}, config?: RequestConfig): Promise<Photo[]> {
    const { page = 0, mode = 0 } = options;
    if (!tag || page < 0 || ![0, 1, 2].includes(mode)) throw new Error('Invalid parameters');
    return this.client.get<Photo[]>(`/user/${tag}/photos`, { page, mode }, config);
  }

  async getFriends(tag: string, page: number): Promise<User[]> {
    return this.client.get<User[]>(`/user/${tag}/friends`, { page });
  }

  async getIncomingRequests(page: number): Promise<User[]> {
    return this.client.get<User[]>('/incoming_requests', { page });
  }

  async getOutgoingRequests(page: number): Promise<User[]> {
    return this.client.get<User[]>('/outcoming_requests', { page });
  }

  async ignoreIncomingRequest(userId: number): Promise<any> {
    return this.client.delete<any>(`/incoming_requests/${userId}`);
  }

  async getRelationships(tag: string): Promise<any> {
    return this.client.get<any>(`/user/${tag}/relationships`);
  }

  async subscribeFriends(tag: string): Promise<any> {
    return this.client.patch<any>(`/user/${tag}/subscribe`, {});
  }
}