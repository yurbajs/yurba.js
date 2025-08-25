import { REST } from '../index';
import { CreatePostPayload, Post, DeletePostResponse, Language } from '@yurbajs/types';

export class PostResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Posts Core }
  */

  /**
   * Gets posts from user
   * @group Posts Core
   * @param tag - User tag
   * @param lastId - Last post ID for pagination
   * @param lang - Language filter
   * @param feed - Feed mode
   * @since 1.0.0
   * @returns {Promise<Post[]>} Array of {@link Post} objects
   * @throws {Error} If tag is invalid
   * @example
   * ```javascript
   * const posts = await rest.posts.get('username');
   * const olderPosts = await rest.posts.get('username', 123);
   * const feedPosts = await rest.posts.get('username', 0, 0, true);
   * ```
   */
  async get(tag: string, lastId: number = 0, lang: Language = 0, feed: boolean = false): Promise<Post[]> {
    if (!tag || tag.length > 255) throw new Error('Invalid tag');
    const params: any = { last_id: lastId, feed };
    if (lang) params.lang = lang;
    return this.client.get<Post[]>(`/user/${tag}/posts`, params);
  }

  /**
   * Creates a new post
   * @group Posts Core
   * @param tag - User tag
   * @param data - {@link CreatePostPayload} Post data
   * @since 1.0.0
   * @returns {Promise<Post>} {@link Post} Created post
   * @throws {Error} If tag or data is invalid
   * @example
   * ```javascript
   * const post = await rest.posts.create('username', {
   *   text: "Hello world!",
   *   photos_list: [123, 456]
   * });
   * ```
   */
  async create(tag: string, data: CreatePostPayload): Promise<Post> {
    if (!tag || tag.length > 255) throw new Error('Invalid tag');
    if (!data || (!data.content)) throw new Error('Invalid post data');
    return this.client.post<Post>(`/user/${tag}/post`, data);
  }

  /**
   * Deletes a post
   * @group Posts Core
   * @param postId - Post identifier
   * @since 1.0.0
   * @returns {Promise<DeletePostResponse>} {@link DeletePostResponse} Delete response
   * @throws {Error} If post ID is invalid
   * @example
   * ```javascript
   * await rest.posts.delete(12345);
   * ```
   */
  async delete(postId: number): Promise<DeletePostResponse> {
    if (postId < 1) throw new Error('Invalid post ID');
    return this.client.delete<DeletePostResponse>(`/posts/${postId}`);
  }

  /**
   * Edits a post
   * @group Posts Core
   * @param postId - Post identifier
   * @param data - {@link CreatePostPayload} Updated post data
   * @since 1.0.0
   * @returns {Promise<Post>} {@link Post} Updated post
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const updatedPost = await rest.posts.edit(12345, {
   *   text: "Updated content"
   * });
   * ```
   */
  async edit(postId: number, data: CreatePostPayload): Promise<Post> {
    if (postId < 1) throw new Error('Invalid post ID');
    if (!data || (!data.content && !data.photos_list?.length)) throw new Error('Invalid post data');
    return this.client.patch<Post>(`/posts/${postId}`, data);
  }

  /* 
  //               { Post Comments }
  */

  /**
   * Gets comments from post
   * @group Post Comments
   * @param postId - Post identifier
   * @param lastId - Last comment ID for pagination
   * @since 1.0.0
   * @returns {Promise<any[]>} Array of comments
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const comments = await rest.posts.getComments(123);
   * const olderComments = await rest.posts.getComments(123, 456);
   * ```
   */
  async getComments(postId: number, lastId: number = 0): Promise<any[]> {
    if (postId < 1) throw new Error('Invalid post ID');
    return this.client.get(`/posts/${postId}/comments`, { last_id: lastId });
  }

  /**
   * Adds comment to post
   * @group Post Comments
   * @param postId - Post identifier
   * @param content - Comment content
   * @param photos - Photo IDs array
   * @since 1.0.0
   * @returns {Promise<any>} Created comment
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.posts.addComment(123, "Nice post!");
   * await rest.posts.addComment(123, "With photo", [456]);
   * ```
   */
  async addComment(postId: number, content: string, photos: number[] = []): Promise<any> {
    if (postId < 1) throw new Error('Invalid post ID');
    if (!content || content.length > 1000) throw new Error('Invalid content');
    return this.client.post(`/posts/${postId}/comment`, { content, photos_list: photos });
  }

  /**
   * Deletes a comment
   * @group Post Comments
   * @param commentId - Comment identifier
   * @since 1.0.0
   * @returns {Promise<any>} Delete response
   * @throws {Error} If comment ID is invalid
   * @example
   * ```javascript
   * await rest.posts.deleteComment(789);
   * ```
   */
  async deleteComment(commentId: number): Promise<any> {
    if (commentId < 1) throw new Error('Invalid comment ID');
    return this.client.delete(`/comments/${commentId}`);
  }
}