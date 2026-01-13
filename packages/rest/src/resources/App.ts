import { REST } from '../index';
import {
  App,
  AppToken,
  CreateAppPayload,
  BaseOkay,
  ShortUserModel
} from '@yurbajs/types';

/**
 * @category Resources
 */
export class AppResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Apps Core
   * @namespace
   */

  /**
   * Gets all apps
   * @rest GET /apps *
   * @group Apps Core
   * @since 1.0.0
   * @returns {Promise<App[]>} Array of {@link App} objects
   * @throws {Error} If apps cannot be retrieved
   * @example
   * ```javascript
   * const apps = await rest.apps.getAll();
   * ```
   */
  async getAll(): Promise<App[]> {
    return this.client.get<App[]>('/apps');
  }

  /**
   * Creates a new app
   * @rest POST /apps *
   * @group Apps Core
   * @param payload - {@link CreateAppPayload} App creation data
   * @returns {Promise<App>} {@link App} Created app
   * @since 1.0.0
   * @throws {Error} If payload is invalid
   * @example
   * ```javascript
   * const app = await rest.apps.create({
   *   name: 'My App',
   *   redirectUrl: 'https://example.com/callback'
   * });
   * ```
   */
  async create(payload: CreateAppPayload): Promise<App> {
    if (!payload.name || payload.name.length > 255) throw new Error('Invalid name');
    if (!payload.redirectUrl) throw new Error('Invalid redirect URL');
    return this.client.post<App>('/apps', payload);
  }

  /**
   * Gets an app by public key
   * @rest GET /apps/{public_key} *
   * @group Apps Core
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<App>} {@link App} object
   * @throws {Error} If public key is invalid or app not found
   * @example
   * ```javascript
   * const app = await rest.apps.get('public_key_here');
   * ```
   */
  async get(publicKey: string): Promise<App> {
    if (!publicKey || publicKey.length < 1) throw new Error('Invalid public key');
    return this.client.get<App>(`/apps/${publicKey}`);
  }

  /**
   * Deletes an app
   * @rest DELETE /apps/{app_id} *
   * @group Apps Core
   * @param appId - App identifier
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} {@link BaseOkay} Delete response
   * @throws {Error} If app ID is invalid
   * @example
   * ```javascript
   * await rest.apps.delete(123);
   * ```
   */
  async delete(appId: number): Promise<BaseOkay> {
    if (appId < 1) throw new Error('Invalid app ID');
    return this.client.delete<BaseOkay>(`/apps/${appId}`);
  }

  /**
   * App Tokens
   * @namespace
   */

  /**
   * Gets app token
   * @rest GET /apps/{public_key}/token *
   * @group App Tokens
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<AppToken>} {@link AppToken} object
   * @throws {Error} If public key is invalid
   * @example
   * ```javascript
   * const token = await rest.apps.getToken('public_key_here');
   * ```
   */
  async getToken(publicKey: string): Promise<AppToken> {
    if (!publicKey || publicKey.length < 1) throw new Error('Invalid public key');
    return this.client.get<AppToken>(`/apps/${publicKey}/token`);
  }

  /**
   * Creates app token
   * @rest POST /apps/{public_key}/token *
   * @group App Tokens
   * @param publicKey - App public key
   * @param redirectUrl - Redirect URL
   * @since 1.0.0
   * @returns {Promise<AppToken>} {@link AppToken} Created app token
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const token = await rest.apps.createToken('public_key_here', 'https://example.com/callback');
   * ```
   */
  async createToken(publicKey: string, redirectUrl: string): Promise<AppToken> {
    if (!publicKey || publicKey.length < 1) throw new Error('Invalid public key');
    if (!redirectUrl) throw new Error('Invalid redirect URL');
    return this.client.post<AppToken>(`/apps/${publicKey}/token?redirectUrl=${redirectUrl}`, {});
  }

  /**
   * Gets app tokens
   * @rest GET /apps/tokens *
   * @group App Tokens
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<AppToken[]>} Array of {@link AppToken} objects
   * @throws {Error} If public key is invalid
   * @example
   * ```javascript
   * const tokens = await rest.apps.getTokens('public_key_here');
   * ```
   */
  async getTokens(publicKey: string): Promise<AppToken[]> {
    if (!publicKey || publicKey.length < 1) throw new Error('Invalid public key');
    return this.client.get<AppToken[]>(`/apps/${publicKey}/tokens`);
  }

  /**
   * Deletes app token
   * @rest DELETE /apps/tokens/{token} *
   * @group App Tokens
   * @param token - App token
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} {@link BaseOkay} Delete response
   * @throws {Error} If token is invalid
   * @example
   * ```javascript
   * await rest.apps.deleteToken('token_here');
   * ```
   */
  async deleteToken(token: string): Promise<BaseOkay> {
    if (!token || token.length < 1) throw new Error('Invalid token');
    return this.client.delete<BaseOkay>(`/apps/tokens/${token}`);
  }

  /**
   * Gets user by app token
   * @rest GET /apps/user/{token} *
   * @group App Tokens
   * @param token - App token
   * @param secretKey - App secret key
   * @since 1.0.0
   * @returns {Promise<ShortUserModel>} {@link ShortUserModel} object
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const user = await rest.apps.getUser('token_here', 'secret_key_here');
   * ```
   */
  async getUser(token: string, secretKey: string): Promise<ShortUserModel> {
    if (!token || token.length < 1) throw new Error('Invalid token');
    if (!secretKey || secretKey.length < 1) throw new Error('Invalid secret key');
    return this.client.get<ShortUserModel>(`/apps/user/${token}`, {}, {
      headers: { 'Secret-Key': secretKey }
    });
  }
}