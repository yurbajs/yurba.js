import { BaseClient, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import { UserResource, DialogResource, PostResource, MediaResource, AuthResource } from './resources/';

/**
 * Main REST client with all API resources
 */
export class REST extends BaseClient {
  public readonly users: UserResource;
  public readonly dialogs: DialogResource;
  public readonly posts: PostResource;
  public readonly media: MediaResource;
  public readonly auth: AuthResource;

  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);

    this.users = new UserResource(this);
    this.dialogs = new DialogResource(this);
    this.posts = new PostResource(this);
    this.media = new MediaResource(this);
    this.auth = new AuthResource(this);
  }
}

export {
  ApiError,
  BaseClientOptions,
  RequestConfig,
  RateLimitConfig,
  UserResource,
  DialogResource,
  PostResource,
  MediaResource,
  AuthResource
};