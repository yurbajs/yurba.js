import { BaseClient, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import { UserResource } from './resources/User';
import { DialogResource } from './resources/Dialog';
import { PostResource } from './resources/Post';
import { PhotosResource } from './resources/Photos';
import { MusebaseResource } from './resources/Musebase';
import { AccountResource } from './resources/Account';
import { FilesResource } from './resources/Files';
import { VideoResource } from './resources/Video';
import { SearchResource } from './resources/Search';
import { ShopResource } from './resources/Shop';
import { AppResource } from './resources/App';
import { BatchRequest } from './BatchRequest';

/**
 * Main REST client with lazy-loaded API resources
 */
export class REST extends BaseClient {
  private _users?: UserResource;
  private _dialogs?: DialogResource;
  private _posts?: PostResource;
  private _musebase?: MusebaseResource;
  private _photos?: PhotosResource;
  private _auth?: AccountResource;
  private _files?: FilesResource;
  private _video?: VideoResource;
  private _search?: SearchResource;
  private _shop?: ShopResource;
  private _apps?: AppResource;

  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);
  }

  get users(): UserResource {
    if (!this._users) this._users = new UserResource(this);
    return this._users;
  }

  get dialogs(): DialogResource {
    if (!this._dialogs) this._dialogs = new DialogResource(this);
    return this._dialogs;
  }

  get posts(): PostResource {
    if (!this._posts) this._posts = new PostResource(this);
    return this._posts;
  }

  get musebase(): MusebaseResource {
    if (!this._musebase) this._musebase = new MusebaseResource(this);
    return this._musebase;
  }

  get photos(): PhotosResource {
    if (!this._photos) this._photos = new PhotosResource(this);
    return this._photos;
  }

  get account(): AccountResource {
    if (!this._auth) this._auth = new AccountResource(this);
    return this._auth;
  }

  get files(): FilesResource {
    if (!this._files) this._files = new FilesResource(this);
    return this._files;
  }

  get video(): VideoResource {
    if (!this._video) this._video = new VideoResource(this);
    return this._video;
  }

  get search(): SearchResource {
    if (!this._search) this._search = new SearchResource(this);
    return this._search;
  }

  get shop(): ShopResource {
    if (!this._shop) this._shop = new ShopResource(this);
    return this._shop;
  }

  get apps(): AppResource {
    if (!this._apps) this._apps = new AppResource(this);
    return this._apps;
  }

  /**
   * Create a new batch request for parallel API calls
   * @returns BatchRequest instance
   * @example
   * ```typescript
   * const results = await rest.batch()
   *   .add('user', rest.users.me())
   *   .add('posts', rest.posts.get('@me', {}))
   *   .execute();
   * 
   * console.log(results.user);  // User object
   * console.log(results.posts); // Posts array
   * ```
   */
  batch(): BatchRequest {
    return new BatchRequest();
  }
}

// Re-exports
export {
  ApiError,
  BaseClientOptions,
  RequestConfig,
  RateLimitConfig
};

export { BatchRequest } from './BatchRequest';
export type { CachedUser } from './cache';

// Default export for convenience
export default REST;