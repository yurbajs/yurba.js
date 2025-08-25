import { REST } from '../index';
import { CreatePostPayload, Post, DeletePostResponse, Language } from '@yurbajs/types';

export class PostResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Get posts from user
   * @group Posts Core
   * @param tag - User tag
   * @param lastId - Last post ID for pagination
   * @param lang - Language filter
   * @param feed - Feed mode
   * @since 1.0.0
   * @returns {Promise<Post[]>} Array of posts
   */
  async get(tag: string, lastId: number = 0, lang: Language = 0, feed: boolean = false): Promise<Post[]> {
    const params: any = { last_id: lastId, feed };
    if (lang) params.lang = lang;
    return this.client.get<Post[]>(`/user/${tag}/posts`, params);
  }

  /**
   * Create a new post
   * @group Posts Core
   * @param tag - User tag
   * @param data - Post data
   * @since 1.0.0
   * @returns {Promise<Post>} Created post
   */
  async create(tag: string, data: CreatePostPayload): Promise<Post> {
    return this.client.post<Post>(`/user/${tag}/post`, data);
  }

  /**
   * Delete a post
   * @group Posts Core
   * @param postId - Post identifier
   * @since 1.0.0
   * @returns {Promise<DeletePostResponse>} Delete response
   */
  async delete(postId: number): Promise<DeletePostResponse> {
    return this.client.delete<DeletePostResponse>(`/posts/${postId}`);
  }

  /**
   * Edit a post
   * @group Posts Core
   * @param postId - Post identifier
   * @param data - Updated post data
   * @since 1.0.0
   * @returns {Promise<Post>} Updated post
   */
  async edit(postId: number, data: CreatePostPayload): Promise<Post> {
    return this.client.patch<Post>(`/posts/${postId}`, data);
  }

  comments = {
    get: async (postId: number, lastId: number = 0) => 
      this.client.get(`/posts/${postId}/comments`, { last_id: lastId }),

    add: async (postId: number, content: string, photos: number[] = []) => 
      this.client.post(`/posts/${postId}/comment`, { content, photos_list: photos }),

    delete: async (commentId: number) => 
      this.client.delete(`/comments/${commentId}`)
  };
}