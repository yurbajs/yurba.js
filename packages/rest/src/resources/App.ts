import { REST } from '../index';
import { App, AppToken, CreateAppPayload, BaseOkay, User } from '@yurbajs/types';

export class AppResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Get all apps
   * @group Apps Core
   * @since 1.0.0
   * @returns {Promise<App[]>} Array of apps
   * @example
   * ```javascript
   * const apps = await rest.apps.getAll();
   * ```
   */
  async getAll(): Promise<App[]> {
    return this.client.get<App[]>('/apps');
  }

  /**
   * Create new app
   * @group Apps Core
   * @param payload - App creation data
   * @since 1.0.0
   * @returns {Promise<App>} Created app
   * @example
   * ```javascript
   * const app = await rest.apps.create({
   *   name: 'My App',
   *   redirectUrl: 'https://example.com/callback'
   * });
   * ```
   */
  async create(payload: CreateAppPayload): Promise<App> {
    return this.client.post<App>('/apps', payload);
  }

  /**
   * Get app by public key
   * @group Apps Core
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<App>} App information
   * @example
   * ```javascript
   * const app = await rest.apps.get('public_key_here');
   * ```
   */
  async get(publicKey: string): Promise<App> {
    return this.client.get<App>(`/apps/${publicKey}`);
  }

  /**
   * Delete app
   * @group Apps Core
   * @param appId - App identifier
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Operation result
   * @example
   * ```javascript
   * await rest.apps.delete(123);
   * ```
   */
  async delete(appId: number): Promise<BaseOkay> {
    return this.client.delete<BaseOkay>(`/apps/${appId}`);
  }

  /**
   * Get app token
   * @group App Tokens
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<AppToken>} App token information
   * @example
   * ```javascript
   * const token = await rest.apps.getToken('public_key_here');
   * ```
   */
  async getToken(publicKey: string): Promise<AppToken> {
    return this.client.get<AppToken>(`/apps/${publicKey}/token`);
  }

  /**
   * Create app token
   * @group App Tokens
   * @param publicKey - App public key
   * @param redirectUrl - Redirect URL
   * @since 1.0.0
   * @returns {Promise<AppToken>} Created app token
   * @example
   * ```javascript
   * const token = await rest.apps.createToken('public_key_here', 'https://example.com/callback');
   * ```
   */
  async createToken(publicKey: string, redirectUrl: string): Promise<AppToken> {
    return this.client.post<AppToken>(`/apps/${publicKey}/token?redirectUrl=${redirectUrl}`, {});
  }

  /**
   * Get app tokens
   * @group App Tokens
   * @param publicKey - App public key
   * @since 1.0.0
   * @returns {Promise<AppToken[]>} Array of app tokens
   * @example
   * ```javascript
   * const tokens = await rest.apps.getTokens('public_key_here');
   * ```
   */
  async getTokens(publicKey: string): Promise<AppToken[]> {
    return this.client.get<AppToken[]>(`/apps/${publicKey}/tokens`);
  }

  /**
   * Delete app token
   * @group App Tokens
   * @param token - App token
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Operation result
   * @example
   * ```javascript
   * await rest.apps.deleteToken('token_here');
   * ```
   */
  async deleteToken(token: string): Promise<BaseOkay> {
    return this.client.delete<BaseOkay>(`/apps/tokens/${token}`);
  }

  /**
   * Get user by app token
   * @group App Tokens
   * @param token - App token
   * @param secretKey - App secret key
   * @since 1.0.0
   * @returns {Promise<User>} User information
   * @example
   * ```javascript
   * const user = await rest.apps.getUser('token_here', 'secret_key_here');
   * ```
   */
  async getUser(token: string, secretKey: string): Promise<User> {
    return this.client.get<User>(`/apps/user/${token}`, {}, {
      headers: { 'Secret-Key': secretKey }
    });
  }
}