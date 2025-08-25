import { REST } from '../index';

export class AccountResorce {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Auth Core }
  */

  /**
   * Login to account
   * @group Auth Core
   * @param email - User email
   * @param password - User password
   * @since 1.0.0
   * @returns {Promise<any>} Login response
   * @throws {Error} If credentials are invalid
   * @example
   * ```javascript
   * const response = await rest.auth.login('user@example.com', 'password123');
   * ```
   */
  async login(email: string, password: string): Promise<any> {
    if (!email || !password) throw new Error('Invalid credentials');
    return this.client.post<any>('/login', { email, password });
  }

  /**
   * Register new account
   * @group Auth Core
   * @param name - User name
   * @param email - User email
   * @param password - User password
   * @param surname - User surname
   * @since 1.0.0
   * @returns {Promise<any>} Registration response
   * @throws {Error} If registration data is invalid
   * @example
   * ```javascript
   * const response = await rest.auth.register('John', 'john@example.com', 'password123', 'Doe');
   * ```
   */
  async register(name: string, email: string, password: string, surname: string = ''): Promise<any> {
    if (!name || !email || !password) throw new Error('Invalid registration data');
    return this.client.post<any>('/register', { name, surname, email, password });
  }

  /**
   * Confirm account registration
   * @group Auth Core
   * @param code - Confirmation code
   * @param hCaptchaResponse - hCaptcha response
   * @since 1.0.0
   * @returns {Promise<any>} Confirmation response
   * @throws {Error} If confirmation data is invalid
   * @example
   * ```javascript
   * const response = await rest.auth.confirm('123456', 'captcha_response');
   * ```
   */
  async confirm(code: string, hCaptchaResponse: string): Promise<any> {
    if (!code || !hCaptchaResponse) throw new Error('Invalid confirmation data');
    return this.client.post<any>('/confirm', { code, h_captcha_response: hCaptchaResponse });
  }

  /**
   * Reset password
   * @group Auth Core
   * @param email - User email
   * @since 1.0.0
   * @returns {Promise<any>} Reset response
   * @throws {Error} If email is invalid
   * @example
   * ```javascript
   * await rest.auth.resetPassword('user@example.com');
   * ```
   */
  async resetPassword(email: string): Promise<any> {
    if (!email) throw new Error('Invalid email');
    return this.client.post<any>('/reset', { email });
  }

  /**
   * Activate promo code
   * @group Auth Core
   * @param promo - Promo code
   * @since 1.0.0
   * @returns {Promise<any>} Promo activation response
   * @throws {Error} If promo code is invalid
   * @example
   * ```javascript
   * const result = await rest.auth.activatePromo('PROMO2024');
   * ```
   */
  async activatePromo(promo: string): Promise<any> {
    if (!promo) throw new Error('Invalid promo code');
    return this.client.get<any>(`/promo/${promo}`);
  }

  /**
   * Get user tokens
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<any>} User tokens
   * @example
   * ```javascript
   * const tokens = await rest.auth.getTokens();
   * ```
   */
  async getTokens(): Promise<any> {
    return this.client.get<any>('/tokens');
  }

  /**
   * Logout from account
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<any>} Logout response
   * @example
   * ```javascript
   * await rest.auth.logout();
   * ```
   */
  async logout(): Promise<any> {
    return this.client.delete<any>('/logout');
  }
}