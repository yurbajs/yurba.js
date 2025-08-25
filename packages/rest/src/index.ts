import { BaseClient, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import { UserResource, DialogResource, PostResource, PhotosResource, MusebaseResource, AuthResource } from './resources/';

/**
 * Main REST client with all API resources
 */
export class REST extends BaseClient {
  public readonly users: UserResource;
  public readonly dialogs: DialogResource;
  public readonly posts: PostResource;
  public readonly musebase: MusebaseResource;
  public readonly photos: PhotosResource;
  public readonly auth: AuthResource;

  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);

    this.users = new UserResource(this);
    this.dialogs = new DialogResource(this);
    this.posts = new PostResource(this);
    this.musebase = new MusebaseResource(this);
    this.photos = new PhotosResource(this);
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
  PhotosResource,
  MusebaseResource,
  AuthResource
};

export { userCache } from './cache';
export type { CachedUser } from './cache';