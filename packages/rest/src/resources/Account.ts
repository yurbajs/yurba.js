import { REST } from '../index';
import {
  Login,
  BaseOkay,
  Token,
  SettingsPayload,
} from '@yurbajs/types';

/**
 * @category Resources
 */
export class AccountResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Auth Core
   * @namespace
   */

  /**
   * Login to account
   * @rest POST /login login
   * @group Auth Core
   * @param email - User email
   * @param password - User password
   * @since 1.0.0
   * @returns {Promise<Login>} Login response
   * @throws {Error} If credentials are invalid
   * @example
   * ```javascript
   * const response = await rest.auth.login('user@example.com', 'password123');
   * ```
   */
  async login(email: string, password: string): Promise<Login> {
    if (!email || !password) throw new Error('Invalid credentials');
    return this.client.post<Login>('/login', { email, password });
  }

  /**
   * Register new account
   * @rest POST /register register
   * @group Auth Core
   * @param name - User name
   * @param email - User email
   * @param password - User password
   * @param surname - User surname
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Registration response
   * @throws {Error} If registration data is invalid
   * @example
   * ```javascript
   * const response = await rest.auth.register('John', 'john@example.com', 'password123', 'Doe');
   * ```
   */
  async register(name: string, email: string, password: string, surname: string = ''): Promise<BaseOkay> {
    if (!name || !email || !password) throw new Error('Invalid registration data');
    return this.client.post<BaseOkay>('/register', { name, surname, email, password });
  }

  /**
   * Confirm account registration
   * @rest POST /confirm confirm
   * @group Auth Core
   * @param code - Confirmation code
   * @param hCaptchaResponse - hCaptcha response
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Confirmation response
   * @throws {Error} If confirmation data is invalid
   * @example
   * ```javascript
   * const response = await rest.auth.confirm('123456', 'captcha_response');
   * ```
   */
  async confirm(code: string, hCaptchaResponse: string): Promise<BaseOkay> {
    if (!code || !hCaptchaResponse) throw new Error('Invalid confirmation data');
    return this.client.post<BaseOkay>('/confirm', { code, h_captcha_response: hCaptchaResponse });
  }

  /**
   * Reset password
   * @rest POST /reset reset
   * @group Auth Core
   * @param email - User email
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Reset response
   * @throws {Error} If email is invalid
   * @example
   * ```javascript
   * await rest.auth.resetPassword('user@example.com');
   * ```
   */
  async resetPassword(email: string): Promise<BaseOkay> {
    if (!email) throw new Error('Invalid email');
    return this.client.post<BaseOkay>('/reset', { email });
  }

  /**
   * Activate promo code
   * @rest GET /promo/{promo} https://docs.yurba.one/reference/get_promo-promo
   * @group Auth Core
   * @param promo - Promo code
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Promo activation response
   * @throws {Error} If promo code is invalid
   * @example
   * ```javascript
   * const result = await rest.auth.activatePromo('PROMO2024');
   * ```
   */
  async activatePromo(promo: string): Promise<BaseOkay> {
    if (!promo) throw new Error('Invalid promo code');
    return this.client.get<BaseOkay>(`/promo/${promo}`);
  }

  /**
   * Get user tokens
   * @rest GET /tokens tokens
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<Token[]>} User tokens
   * @example
   * ```javascript
   * const tokens = await rest.auth.getTokens();
   * ```
   */
  async getTokens(): Promise<Token[]> {
    return this.client.get<Token[]>('/tokens');
  }

  /**
   * Logout from account
   * @rest DELETE /logout logout
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Logout response
   * @example
   * ```javascript
   * await rest.auth.logout();
   * ```
   */
  async logout(): Promise<BaseOkay> {
    return this.client.delete<BaseOkay>('/logout');
  }

  /**
   * Update profile settings
   * @rest PATCH /settings/profile https://docs.yurba.one/reference/patch_settings-profile
   * @group Profile
   * @param settings - Profile settings to update
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Update response
   * @example
   * ```javascript
   * await rest.account.update({ name: 'John', status: 'Online' });
   * ```
   */
  async update(settings: SettingsPayload): Promise<BaseOkay> {
    return this.client.patch<BaseOkay>('/settings/profile', settings);
  }
}
