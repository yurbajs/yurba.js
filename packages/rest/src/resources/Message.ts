import { REST } from '../BaseClient';
import { MessageData } from '@yurbajs/types';

/**
 * Ресурс для роботи з повідомленнями
 */
export class MessageResource {
  private client: REST;

  /**
   * Створює новий ресурс для роботи з повідомленнями
   * @param client REST клієнт
   */
  constructor(client: REST) {
    this.client = client;
  }

  /**
   * Отримати повідомлення з діалогу
   * @param dialogId ID діалогу
   * @param lastId ID останнього повідомлення для пагінації
   * @returns Список повідомлень
   */
  async getMessages(dialogId: number, lastId?: number): Promise<any[]> {
    let url = `/dialogs/${dialogId}/messages`;
    if (lastId) {
      url += `?last_id=${lastId}`;
    }
    return this.client.get<any[]>(url);
  }

  /**
   * Відправити повідомлення
   * @param dialogId ID діалогу
   * @param text Текст повідомлення
   * @param replyToId ID повідомлення, на яке відповідаємо (опціонально)
   * @param photos_list Список фото (опціонально)
   * @param attachments Список вкладень (опціонально)
   * @param edit ID повідомлення для редагування (опціонально)
   * @param repost Дані репосту (опціонально)
   * @returns Відправлене повідомлення
   */
  async send(
    dialogId: number,
    text: string,
    replyToId?: number | null,
    photos_list?: any[] | null,
    attachments?: any[] | null,
    edit?: number | null,
    repost?: any | null
  ): Promise<any> {
    const messageData: MessageData = {
      text,
      photos_list: photos_list || [],
      replyTo: replyToId || null,
      edit: edit || null,
      attachments: attachments || [],
      repost: repost || null,
    };
    return await this.client.post<any>(`/dialogs/${dialogId}/messages`, messageData);
  }

  /**
   * Видалити повідомлення
   * @param messageId ID повідомлення
   * @returns Результат видалення
   */
  async delete(messageId: number): Promise<boolean> {
    await this.client.patch<any>(`/dialogs/messages/${messageId}`);
    return await this.client.delete<any>(`/dialogs/messages/${messageId}`);
  }
}