import { REST } from '../index';

export class AuthResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  async login(email: string, password: string): Promise<any> {
    return this.client.post<any>('/login', { email, password });
  }

  async register(name: string, email: string, password: string, surname: string = ''): Promise<any> {
    return this.client.post<any>('/register', { name, surname, email, password });
  }

  async confirm(code: string, hCaptchaResponse: string): Promise<any> {
    return this.client.post<any>('/confirm', { code, h_captcha_response: hCaptchaResponse });
  }

  async resetPassword(email: string): Promise<any> {
    return this.client.post<any>('/reset', { email });
  }

  async activatePromo(promo: string): Promise<any> {
    return this.client.get<any>(`/promo/${promo}`);
  }

  async getTokens(): Promise<any> {
    return this.client.get<any>('/tokens');
  }

  async logout(): Promise<any> {
    return this.client.delete<any>('/logout');
  }
}