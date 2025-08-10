import { REST } from '../BaseClient';

/**
 * Ресурс для роботи з автентифікацією
 */
export class AuthResource {
  private client: REST;
  
  constructor(client: REST) {
    this.client = client;
  }
  
  /**
   * Увійти за допомогою email та пароля
   * @param email - Email користувача
   * @param password - Пароль користувача
   * @returns Результат входу
   */
  async login(email: string, password: string): Promise<any> {
    return this.client.post<any>('/login', { email, password });
  }
  
  /**
   * Зареєструвати нового користувача
   * @param name - Ім'я користувача
   * @param email - Email користувача
   * @param password - Пароль користувача
   * @param surname - Прізвище користувача
   * @returns Результат реєстрації
   */
  async register(name: string, email: string, password: string, surname: string = ''): Promise<any> {
    return this.client.post<any>('/register', { name, surname, email, password });
  }
  
  /**
   * Підтвердити реєстрацію кодом та капчею
   * @param code - Код підтвердження
   * @param hCaptchaResponse - Відповідь hCaptcha
   * @returns Результат підтвердження
   */
  async confirm(code: string, hCaptchaResponse: string): Promise<any> {
    return this.client.post<any>('/confirm', { code, h_captcha_response: hCaptchaResponse });
  }
  
  /**
   * Скинути пароль за email
   * @param email - Email користувача
   * @returns Результат скидання
   */
  async resetPassword(email: string): Promise<any> {
    return this.client.post<any>('/reset', { email });
  }
  
  /**
   * Активувати промокод
   * @param promo - Промокод
   * @returns Результат активації
   */
  async activatePromo(promo: string): Promise<any> {
    return this.client.get<any>(`/promo/${promo}`);
  }
  
  /**
   * Отримати токени користувача
   * @returns Список токенів
   */
  async getTokens(): Promise<any> {
    return this.client.get<any>('/tokens');
  }
  
  /**
   * Вийти з системи (видалити сесію)
   * @returns Результат виходу
   */
  async logout(): Promise<any> {
    return this.client.delete<any>('/logout');
  }
}