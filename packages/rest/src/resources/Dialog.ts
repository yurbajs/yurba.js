import { REST } from '../index';
import { Dialog, DialogMember, CreateDialogPayload, DialogCreateType, CreateDialogResponse, CreatePrivateDialogResponse } from '@yurbajs/types';

export class DialogResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  /**
   * Gets a dialog by identifier
   * @param id - Dialog identifier
   * @param code - Invitation code (optional)
   * @since 0.1.7
   * @returns {Promise<Dialog[]>} Array of {@link Dialog} objects
   * @throws {Error} If dialog not found
   */
  async get(id: number, code: string = ''): Promise<Dialog[]> {
    return this.client.get<Dialog[]>(`/dialogs/${id}?code=${code}`);
  }

  /**
   * Gets all dialogs
   * @returns {Promise<Dialog[]>} Array of {@link Dialog} objects
   * @since 0.1.7
   * @throws {Error} If dialogs cannot be retrieved
   */
  async getAll(): Promise<Dialog[]> {
    return this.client.get<Dialog[]>('/dialogs');
  }

  /**
   * Creates a new dialog
   * @param name - Dialog name
   * @param type - {@link DialogCreateType} Dialog creation type
   * @param options - Optional dialog settings
   * @param options.description - Optional dialog description
   * @returns {Promise<CreateDialogResponse>} {@link CreateDialogResponse} Created dialog response
   * @since 0.1.7
   * @throws {Error} If name or description is invalid
   */
  async create(name: string, type: DialogCreateType, options?: { description?: string }): Promise<CreateDialogResponse> {
    if (!name || name.length > 330) throw new Error('Invalid name');
    if (options?.description && options.description.length > 330) throw new Error('Invalid description');
    const payload: CreateDialogPayload = { name, type, ...options };
    return this.client.post<CreateDialogResponse>('/dialogs', payload);
  }

  /**
   * Creates a private dialog with a user
   * @param userId - User identifier to create private dialog with
   * @returns {Promise<Dialog>} {@link Dialog} Created private dialog
   * @since 0.1.7
   * @throws {Error} If user ID is invalid or user not found
   */
  async createPrivate(userId: number): Promise<Dialog> {
    if (userId < 1) throw new Error('Invalid user ID');
    if (await this.client.get(`/user/${userId}`)){
      return this.client.post<CreatePrivateDialogResponse>('/dialogs/private/', userId);
    }
    else throw new Error('Invalid user ID');
  }


  /**
   * Get dialog members
   * @param dialogId - Dialog identifier
   * @param page - Page number (default 0)
   * @since 0.1.7
   */
  async getMembers(dialogId: number, page = 0): Promise<DialogMember[]> {
    if (dialogId < 1 || page < 0) throw new Error('Invalid parameters');
    return this.client.get<DialogMember[]>(`/dialogs/${dialogId}/members`, { page });
  }

  /**
   * Add user to dialog
   * @param dialogId - Dialog identifier
   * @param userId - User identifier
   * @since 0.1.7
   */
  async addMember(dialogId: number, userId: number): Promise<any> {
    if (dialogId < 1 || userId < 1) throw new Error('Invalid parameters');
    return this.client.post(`/dialogs/${dialogId}/join/${userId}`, {});
  }

  /**
   * Remove user from dialog
   * @param dialogId - Dialog identifier
   * @param userId - User identifier
   * @since 0.1.7
   */
  async removeMember(dialogId: number, userId: number): Promise<any> {
    if (dialogId < 1 || userId < 1) throw new Error('Invalid parameters');
    return this.client.delete(`/dialogs/${dialogId}/leave/${userId}`);
  }
}
