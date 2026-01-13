import { REST } from '../index';
import { CreatePostPayload, GetPostPayload, PostModel, DeletePostResponse, Comment, BaseDelete } from '@yurbajs/types';

/**
 * @category Resources
 */
export class PostResource {
  /**
   * @ignore
   */
  constructor(private client: REST) { }

  /**
   * Posts Core
   * @namespace
   */

  /**
   * Gets posts from user
   * @rest GET /user/{user}/posts
   * @group Posts Core
   * @param user - User ({tag}/{id}/u{id}/@me)
   * @param payload - {@link GetPostPayload} Get posts parameters
   * @since 1.0.0
   * @returns {Promise<PostModel[]>} Array of {@link PostModel} objects
   * @throws {Error} If user is invalid
   * @example
   * ```javascript
   * const posts = await rest.posts.get('username', {});
   * const postsById = await rest.posts.get(12345, {});
   * const postsByUid = await rest.posts.get('u12345', {});
   * const myPosts = await rest.posts.get('@me', {});
   * const olderPosts = await rest.posts.get('username', { lastId: 123 });
   * ```
   */
  async get(user: string | number, payload: GetPostPayload): Promise<PostModel[]> {
    if (!user || (typeof user === 'string' && user.length > 255)) throw new Error('Invalid user');
    const resolvedUser = await this.client.resolveUser(user);
    const params: Record<string, unknown> = { last_id: payload.lastId || 0, feed: payload.feed || false };
    if ('lang' in payload && payload.lang) params.lang = payload.lang;
    return this.client.get<PostModel[]>(`/user/${resolvedUser}/posts`, params);
  }

  /**
   * Creates a new post
   * @rest POST /user/{user}/post
   * @group Posts Core
   * @param user - User ({tag}/{id}/u{id}/@me)
   * @param payload - {@link CreatePostPayload} Post data
   * @since 1.0.0
   * @returns {Promise<PostModel>} {@link PostModel} Created post
   * @throws {Error} If user or data is invalid
   * @example
   * ```javascript
   * // Text post
   * const post = await rest.posts.create('@me', {
   *   content: "Hello world!"
   * });
   * 
   * // Post with photos
   * const postWithPhotos = await rest.posts.create('username', {
   *   content: "Check out these photos!",
   *   photos_list: [123, 456]
   * });
   * 
   * // Post with attachments
   * const postWithAttachments = await rest.posts.create(12345, {
   *   content: "Sharing some content",
   *   attachments: [
   *     { Type: "video", Item: 28 },
   *     { Type: "track", Item: 6422 }
   *   ]
   * });
   * 
   * // Edit existing post
   * const editedPost = await rest.posts.create('@me', {
   *   content: "Updated content",
   *   edit: 98765
   * });
   * 
   * // Repost
   * const repost = await rest.posts.create('@me', {
   *   content: "Great post!",
   *   repost: 54321
   * });
   * ```
   */
  async create(user: string | number, payload: CreatePostPayload): Promise<PostModel> {
    if (!user || (typeof user === 'string' && user.length > 255)) throw new Error('Invalid user');
    if (!payload || !payload.content) throw new Error('Invalid post data');
    const resolvedUser = await this.client.resolveUser(user);
    return this.client.post<PostModel>(`/user/${resolvedUser}/post`, payload);
  }

  /**
   * Deletes a post
   * @rest DELETE /posts/{post_id} delete_post
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
   * @rest PATCH /posts/{post_id} edit_post
   * @group Posts Core
   * @param postId - Post identifier
   * @param data - {@link CreatePostPayload} Updated post data
   * @since 1.0.0
   * @returns {Promise<PostModel>} {@link PostModel} Updated post
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const updatedPost = await rest.posts.edit(12345, {
   *   text: "Updated content"
   * });
   * ```
   */
  async edit(postId: number, data: CreatePostPayload): Promise<PostModel> {
    if (postId < 1) throw new Error('Invalid post ID');
    if (!data || (!data.content && !data.photos_list?.length)) throw new Error('Invalid post data');
    return this.client.patch<PostModel>(`/posts/${postId}`, data);
  }

  /**
   * Post Comments
   * @namespace
   */

  /**
   * Gets comments from post
   * @rest GET /posts/{post_id}/comments get_comments
   * @group Post Comments
   * @param postId - Post identifier
   * @param lastId - Last comment ID for pagination
   * @since 1.0.0
   * @returns {Promise<Comment[]>} Array of comments
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const comments = await rest.posts.getComments(123);
   * const olderComments = await rest.posts.getComments(123, 456);
   * ```
   */
  async getComments(postId: number, lastId: number = 0): Promise<Comment[]> {
    if (postId < 1) throw new Error('Invalid post ID');
    return this.client.get(`/posts/${postId}/comments`, { last_id: lastId });
  }

  /**
   * Adds a new comment to an existing post. Comments can include text content 
   * and optional photo attachments.
   * 
   * @rest POST /posts/{post_id}/comment upload_comment
   * @group Post Comments
   * @param postId - Post identifier
   * @param content - Comment content (max 1000 characters)
   * @param photos - Array of photo IDs to attach to the comment
   * @since 1.0.0
   * @returns {Promise<Comment>} The newly created comment object
   * @throws {Error} If parameters are invalid
   * 
   * @example
   * **Basic Comment**
   * ```javascript
   * const comment = await rest.posts.addComment(123, "Nice post!");
   * console.log(comment.id); // 789
   * ```
   * 
   * @example
   * **Comment with Photo**
   * ```javascript
   * const commentWithPhoto = await rest.posts.addComment(
   *   123, 
   *   "Check this out!", 
   *   [456, 789]
   * );
   * ```
   * 
   * @example
   * **Error Handling**
   * ```javascript
   * try {
   *   await rest.posts.addComment(123, "");
   * } catch (error) {
   *   console.error(error.message); // "Invalid content"
   * }
   * ```
   */
  async addComment(postId: number, content: string, photos: number[] = []): Promise<Comment> {
    if (postId < 1) throw new Error('Invalid post ID');
    if (!content || content.length > 1000) throw new Error('Invalid content');
    return this.client.post(`/posts/${postId}/comment`, { content, photos_list: photos });
  }

  /**
   * Deletes a comment
   * @rest DELETE /comments/{comment_id} delete_comment
   * @group Post Comments
   * @param commentId - Comment identifier
   * @since 1.0.0
   * @returns {Promise<BaseDelete>} Delete response
   * @throws {Error} If comment ID is invalid
   * @example
   * ```javascript
   * await rest.posts.deleteComment(789);
   * ```
   */
  async deleteComment(commentId: number): Promise<BaseDelete> {
    if (commentId < 1) throw new Error('Invalid comment ID');
    return this.client.delete(`/comments/${commentId}`);
  }
}