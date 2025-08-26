import { BaseClient, ApiError, BaseClientOptions, RequestConfig, RateLimitConfig } from './BaseClient';
import type { UserResource, DialogResource, PostResource, PhotosResource, MusebaseResource, AccountResorce, FilesResource, VideoResource, SearchResource, ShopResource, AppResource } from './resources/';

/**
 * Main REST client with lazy-loaded API resources
 */
export class REST extends BaseClient {
  private _users?: UserResource;
  private _dialogs?: DialogResource;
  private _posts?: PostResource;
  private _musebase?: MusebaseResource;
  private _photos?: PhotosResource;
  private _auth?: AccountResorce;
  private _files?: FilesResource;
  private _video?: VideoResource;
  private _search?: SearchResource;
  private _shop?: ShopResource;
  private _apps?: AppResource;

  constructor(token: string, options?: BaseClientOptions) {
    super(token, options);
  }

  private _getResource<T>(
    resource: T | undefined,
    resourceName: string,
    modulePath: string
  ): T {
    if (!resource) {
      const module = require(modulePath) as { [key: string]: new (client: REST) => T };
      resource = new module[resourceName](this);
      // @ts-ignore - We are setting the private property
      this[`_${resourceName.toLowerCase()}`] = resource;
    }
    return resource;
  }

  get users(): UserResource {
    return this._getResource(this._users, 'UserResource', './resources/User');
  }

  get dialogs(): DialogResource {
    return this._getResource(this._dialogs, 'DialogResource', './resources/Dialog');
  }

  get posts(): PostResource {
    return this._getResource(this._posts, 'PostResource', './resources/Post');
  }

  get musebase(): MusebaseResource {
    return this._getResource(this._musebase, 'MusebaseResource', './resources/Musebase');
  }

  get photos(): PhotosResource {
    return this._getResource(this._photos, 'PhotosResource', './resources/Photos');
  }

  get account(): AccountResorce {
    return this._getResource(this._auth, 'AccountResorce', './resources/Account');
  }

  get files(): FilesResource {
    return this._getResource(this._files, 'FilesResource', './resources/Files');
  }

  get video(): VideoResource {
    return this._getResource(this._video, 'VideoResource', './resources/Video');
  }

  get search(): SearchResource {
    return this._getResource(this._search, 'SearchResource', './resources/Search');
  }

  get shop(): ShopResource {
    return this._getResource(this._shop, 'ShopResource', './resources/Shop');
  }

  get apps(): AppResource {
    return this._getResource(this._apps, 'AppResource', './resources/App');
  }
}

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
  AccountResorce,
  FilesResource,
  VideoResource,
  SearchResource,
  ShopResource,
  AppResource
} from './resources/';

// Default export for convenience
export default REST;