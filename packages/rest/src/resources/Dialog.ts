import { REST } from '../BaseClient';
import { BaseResource } from './Base';
import { Dialog, DialogMember, CreateDialogPayload, Dtype } from '@yurbajs/types';

/**
 * Ресурс для роботи з діалогами
 */
export class DialogResource extends BaseResource {
  constructor(client: REST) {
    super(client);
  }
  
  /**
   * Отримати всі діалоги
   * @since 0.1.7
   * @category Dialogs
   * @returns {Promise<Dialog[]} Список діалогів
   */
  get = {
    all: async (): Promise<Dialog[]> => {
      return this.request<Dialog[]>('GET', '/dialogs');
    }
  };
  
  /**
   * Створити новий діалог
   * @param {string} name - Назва діалогу (макс. 330 символів)
   * @param {Dtype} type - Тип діалогу (тільки Channel або Group)
   * @param {Object} [options] - Додаткові опції
   * @param {string} [options.description] - Опис діалогу (макс. 330 символів)
   * @returns {Promise<Dialog>} Створений діалог
   * @throws {Error} Може кинути: auth_failed, invalid_type, upload_error або інші
   */
  create = async (
    name: string,
    type: Dtype,
    options?: { description?: string }
  ): Promise<Dialog> => {
    this.validateRequired({ name, type }, ['name', 'type']);
    this.validateStringLength(name, 330, 'Name');
    if (options?.description) {
      this.validateStringLength(options.description, 330, 'Description');
    }
    this.validateConstraints(type, { enum: Object.values(Dtype) }, 'type');

    const payload: CreateDialogPayload = { name, type, ...options };

    try {
      return await this.request<Dialog>('POST', '/dialogs', payload);
    } catch (err: any) {
      this.handleApiError(err, '/dialogs');
    }
  };


  
  /**
   * Методи для роботи з учасниками діалогу
   */
  members = {
    /**
     * Отримати учасників діалогу
     * @param {number} dialogId - ID діалогу (≥1)
     * @param {number} [page=0] - Номер сторінки для пагінації (≥0)
     * @returns {Promise<DialogMember[]>} Список учасників
     * @throws {Error} Може кинути: not_found, auth_failed, invalid_page або інші
     */
    get: async (dialogId: number, page: number = 0): Promise<DialogMember[]> => {
      this.validateDialogId(dialogId);
      this.validatePage(page);

      try {
        return await this.request<DialogMember[]>('GET', `/dialogs/${dialogId}/members`, { page });
      } catch (err: any) {
        this.handleApiError(err, `/dialogs/${dialogId}/members`);
      }
    },
    
    /**
     * Додати користувача до діалогу
     * @param dialogId - ID діалогу
     * @param userId - ID користувача
     * @returns Результат операції
     */
    add: async (dialogId: number, userId: number): Promise<any> => {
      this.validateDialogId(dialogId);
      this.validateRequired({ userId }, ['userId']);
      return this.request<any>('POST', `/dialogs/${dialogId}/join/${userId}`, {});
    },
    
    /**
     * Видалити користувача з діалогу
     * @param dialogId - ID діалогу
     * @param userId - ID користувача
     * @returns Результат операції
     */
    remove: async (dialogId: number, userId: number): Promise<any> => {
      this.validateDialogId(dialogId);
      this.validateRequired({ userId }, ['userId']);
      return this.request<any>('DELETE', `/dialogs/${dialogId}/leave/${userId}`);
    }
  };
}