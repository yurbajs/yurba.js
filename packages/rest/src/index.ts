import { REST, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import { UserResource, MessageResource, DialogResource, PostResource, MediaResource, AuthResource } from './resources/';

/**
 * Enhanced REST client for Yurba.one API with all resources
 *
 * @example Basic usage
 * ```typescript
 * import { RestClient } from '@yurbajs/rest';
 *
 * const client = new RestClient('your-token');
 * const user = await client.users.getMe();
 * ```
 *
 * @example With configuration
 * ```typescript
 * const client = new RestClient('your-token', {
 *   timeout: 10000,
 *   maxRetries: 5,
 *   debug: true
 * });
 * 
 *
 * // Set rate limiting
 * client.setRateLimit({ maxRequests: 100, windowMs: 60000 });
 * ```
 *
 * @public
 */
class RestClient extends REST {
  /** User-related API operations */
  public readonly users: UserResource;

  /* Message-related API operations */
  public readonly messages: MessageResource;

  /** Dialog-related API operations */
  public readonly dialogs: DialogResource;

  /** Post-related API operations */
  public readonly posts: PostResource;

  /** Media-related API operations */
  public readonly media: MediaResource;

  /** Authentication-related API operations */
  public readonly auth: AuthResource;

  /**
   * Creates a new REST client with all resources
   *
   * @param token - Authorization token for API requests
   * @param options - Configuration options
   */
  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);

    // Initialize all resources
    this.users = new UserResource(this);
    this.messages = new MessageResource(this);
    this.dialogs = new DialogResource(this);
    this.posts = new PostResource(this);
    this.media = new MediaResource(this);
    this.auth = new AuthResource(this);
  }
}

// Export main client as default and named export
export { RestClient as REST };
export default RestClient;

// Export types and utilities
export {
  ApiError,
  BaseClientOptions,
  RequestConfig,
  RateLimitConfig
};

// Export individual resources for advanced usage
export {
  UserResource,
  MessageResource,
  DialogResource,
  PostResource,
  MediaResource,
  AuthResource
};
