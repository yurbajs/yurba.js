import { REST } from '../index';

export class AuthResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Login to account
   * @group Auth Core
   * @param email - User email
   * @param password - User password
   * @since 1.0.0
   * @returns {Promise<any>} Login response
   */
  async login(email: string, password: string): Promise<any> {
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
   */
  async register(name: string, email: string, password: string, surname: string = ''): Promise<any> {
    return this.client.post<any>('/register', { name, surname, email, password });
  }

  /**
   * Confirm account registration
   * @group Auth Core
   * @param code - Confirmation code
   * @param hCaptchaResponse - hCaptcha response
   * @since 1.0.0
   * @returns {Promise<any>} Confirmation response
   */
  async confirm(code: string, hCaptchaResponse: string): Promise<any> {
    return this.client.post<any>('/confirm', { code, h_captcha_response: hCaptchaResponse });
  }

  /**
   * Reset password
   * @group Auth Core
   * @param email - User email
   * @since 1.0.0
   * @returns {Promise<any>} Reset response
   */
  async resetPassword(email: string): Promise<any> {
    return this.client.post<any>('/reset', { email });
  }

  /**
   * Activate promo code
   * @group Auth Core
   * @param promo - Promo code
   * @since 1.0.0
   * @returns {Promise<any>} Promo activation response
   */
  async activatePromo(promo: string): Promise<any> {
    return this.client.get<any>(`/promo/${promo}`);
  }

  /**
   * Get user tokens
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<any>} User tokens
   */
  async getTokens(): Promise<any> {
    return this.client.get<any>('/tokens');
  }

  /**
   * Logout from account
   * @group Auth Core
   * @since 1.0.0
   * @returns {Promise<any>} Logout response
   */
  async logout(): Promise<any> {
    return this.client.delete<any>('/logout');
  }
}