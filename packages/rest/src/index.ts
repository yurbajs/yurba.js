import { BaseClient, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import type { UserResource, DialogResource, PostResource, PhotosResource, MusebaseResource, AuthResource } from './resources/';

/**
 * Main REST client with lazy-loaded API resources
 */
export class REST extends BaseClient {
  private _users?: UserResource;
  private _dialogs?: DialogResource;
  private _posts?: PostResource;
  private _musebase?: MusebaseResource;
  private _photos?: PhotosResource;
  private _auth?: AuthResource;

  static create: (token: string, options?: BaseClientOptions) => REST;

  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);
  }

  get users(): UserResource {
    if (!this._users) {
      const { UserResource } = require('./resources/User');
      this._users = new UserResource(this);
    }
    return this._users!;
  }

  get dialogs(): DialogResource {
    if (!this._dialogs) {
      const { DialogResource } = require('./resources/Dialog');
      this._dialogs = new DialogResource(this);
    }
    return this._dialogs!;
  }

  get posts(): PostResource {
    if (!this._posts) {
      const { PostResource } = require('./resources/Post');
      this._posts = new PostResource(this);
    }
    return this._posts!;
  }

  get musebase(): MusebaseResource {
    if (!this._musebase) {
      const { MusebaseResource } = require('./resources/Musebase');
      this._musebase = new MusebaseResource(this);
    }
    return this._musebase!;
  }

  get photos(): PhotosResource {
    if (!this._photos) {
      const { PhotosResource } = require('./resources/Photos');
      this._photos = new PhotosResource(this);
    }
    return this._photos!;
  }

  get auth(): AuthResource {
    if (!this._auth) {
      const { AuthResource } = require('./resources/Account');
      this._auth = new AuthResource(this);
    }
    return this._auth!;
  }
}

// Static factory method
REST.create = (token: string, options?: BaseClientOptions) => new REST(token, options);

// Re-exports
export {
  ApiError,
  BaseClientOptions,
  RequestConfig,
  RateLimitConfig
};

export { userCache } from './cache';
export type { CachedUser } from './cache';
export type {
  UserResource,
  DialogResource,
  PostResource,
  PhotosResource,
  MusebaseResource,
  AuthResource
} from './resources/';

// Default export for convenience
export default REST;