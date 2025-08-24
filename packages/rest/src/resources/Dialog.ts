import { REST } from '../index';
import {
  Dialog,
  DialogMember,
  CreateDialogPayload,
  CreateDialogResponse,
  CreatePrivateDialogResponse,
  SendMessagePayload,
  Message,
  response,
  responseMute
} from '@yurbajs/types';

export class DialogResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Gets a dialog by identifier
   * @group Dialog Core
   * @param id - Dialog identifier
   * @param code - Invitation code (optional)
   * @since 0.1.10
   * @returns {Promise<Dialog>} {@link Dialog} object
   * @throws {Error} If dialog not found
   * @example
   * ```javascript
   * const dialog = await rest.dialogs.get(123);
   * const privateDialog = await rest.dialogs.get(456, 'invite123');
   * ```
   */
  async get(id: number, code: string = ''): Promise<Dialog> {
    return this.client.get<Dialog>(`/dialogs/${id}?code=${code}`);
  }

  /**
   * Gets all dialogs where the client is a member
   * @group Dialog Core
   * @since 0.1.10
   * @returns {Promise<Dialog[]>} Array of {@link Dialog} objects
   * @throws {Error} If dialogs cannot be retrieved
   * @example
   * ```javascript
   * const dialogs = await rest.dialogs.getAll();
   * ```
   */
  async getAll(): Promise<Dialog[]> {
    return this.client.get<Dialog[]>('/dialogs');
  }

  /**
   * Creates a new dialog
   * @group Dialog Core
   * @param payload - {@link CreateDialogPayload} Dialog creation data
   * @returns {Promise<CreateDialogResponse>} {@link CreateDialogResponse} Created dialog response
   * @since 0.1.10
   * @throws {Error} If name or description is invalid
   * @example
   * ```javascript
   * const dialog = await rest.dialogs.create({
   *   name: "My Dialog",
   *   description: "Discussion place",
   *   type: "public"
   * });
   * ```
   */
  async create(payload: CreateDialogPayload): Promise<CreateDialogResponse> {
    if (!payload.name || payload.name.length > 330)
      throw new Error('Invalid name');
    if (payload.description && payload.description.length > 330)
      throw new Error('Invalid description');

    return this.client.post<CreateDialogResponse>('/dialogs', payload);
  }

  /**
   * Creates a private dialog with a user
   * @group Dialog Core
   * @param userId - User identifier to create private dialog with
   * @returns {Promise<Dialog>} {@link Dialog} Created private dialog
   * @since 0.1.10
   * @throws {Error} If user ID is invalid or user not found
   * @example
   * ```javascript
   * const privateDialog = await rest.dialogs.createPrivate(12345);
   * ```
   */
  async createPrivate(userId: number): Promise<Dialog> {
    if (userId < 1) throw new Error('Invalid user ID');
    if (await this.client.get(`/user/${userId}`)) {
      return this.client.post<CreatePrivateDialogResponse>(
        '/dialogs/private/',
        userId
      );
    } else throw new Error('Invalid user ID');
  }


  /**
   * Join to dialog
   * @group Dialog Core
   * @param dialogId - Dialog identifier
   * @since 1.0.0
   * @returns {Promise<any>} Operation result
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.dialogs.join(123);
   * ```
   */
  async join(dialogId: number): Promise<response> {
    if (dialogId < 1) throw new Error('Invalid parameters');
    const token = this.client['defaultHeaders']['token'];
    const user = this.client.getCachedUser(token);
    if (!user) throw new Error('User not found in cache');
    return this.client.post(`/dialogs/${dialogId}/join/${user.id}`, {});
  }

  /**
   * Leave dialog
   * @group Dialog Core
   * @param dialogId - Dialog identifier
   * @since 1.0.0
   * @returns {Promise<any>} Operation result
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.dialogs.leave(123);
   * ```
   */
  async leave(dialogId: number): Promise<response> {
    if (dialogId < 1) throw new Error('Invalid parameters');
    const token = this.client['defaultHeaders']['token'];
    const user = this.client.getCachedUser(token);
    if (!user) throw new Error('User not found in cache');
    return this.client.delete(`/dialogs/${dialogId}/leave/${user.id}`);
  }


  /**
   * Get dialog members
   * @group Dialog Members
   * @param dialogId - Dialog identifier
   * @param page - Page number (default 0)
   * @since 0.1.10
   * @returns {Promise<DialogMember[]>} Array of {@link DialogMember} objects
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * const members = await rest.dialogs.getMembers(123);
   * const nextPage = await rest.dialogs.getMembers(123, 1);
   * ```
   */
  async getMembers(dialogId: number, page = 0): Promise<DialogMember[]> {
    if (dialogId < 1 || page < 0) throw new Error('Invalid parameters');
    return this.client.get<DialogMember[]>(`/dialogs/${dialogId}/members`, {
      page,
    });
  }


  /**
   * Add user to dialog
   * @group Dialog Members
   * @param dialogId - Dialog identifier
   * @param userId - User identifier
   * @since 0.1.10
   * @returns {Promise<any>} Operation result
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.dialogs.addMember(123, 456);
   * ```
   */
  async addMember(dialogId: number, userId: number, code: string = ''): Promise<response> {
    if (dialogId < 1 || userId < 1) throw new Error('Invalid parameters');
    return this.client.post(`/dialogs/${dialogId}/join/${userId}?code=${code}`, {});
  }

  /**
   * Remove user from dialog
   * @group Dialog Members
   * @param dialogId - Dialog identifier
   * @param userId - User identifier
   * @since 0.1.10
   * @returns {Promise<any>} Operation result
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.dialogs.removeMember(123, 456);
   * ```
   */
  async removeMember(dialogId: number, userId: number): Promise<response> {
    if (dialogId < 1 || userId < 1) throw new Error('Invalid parameters');
    return this.client.delete(`/dialogs/${dialogId}/leave/${userId}`);
  }


  /**
   * Get message (by id)
   * @group Dialog Messages
   * @param messageId - Message ID
   * @since 1.0.0
   * @returns {Promise<Message>} Array of messages
   * @example
   * ```javascript
   * const messages = await rest.dialogs.getMessage(123);
   * ```
   */
  async getMessage(dialogId: number): Promise<Message> {
    return this.client.get<Message>(`/dialogs/${dialogId}/messages`);
  }


  /**
   * Get messages from dialog
   * @group Dialog Messages
   * @param dialogId - Dialog identifier
   * @param lastId - Last message ID for pagination (optional)
   * @since 0.1.10
   * @returns {Promise<Message[]>} Array of messages
   * @example
   * ```javascript
   * const messages = await rest.dialogs.getMessages(123);
   * const older_messages = await rest.dialogs.getMessages(123, 999);
   * ```
   */
  async getMessages(dialogId: number, lastId?: number): Promise<Message[]> {
    const params = lastId ? { last_id: lastId } : {};
    return this.client.get<Message[]>(`/dialogs/${dialogId}/messages`, params);
  }

  /**
   * Send message to dialog
   * @group Dialog Messages
   * @param dialogId - Dialog identifier
   * @param payload - {@link SendMessagePayload} Message data
   * @since 0.1.10
   * @returns {Promise<Message>} {@link Message} Sent message
   * @example
   * ```javascript
   * // Text message
   * await rest.dialogs.sendMessage(123, { text: "Hello!" });
   *
   * // With photos and reply
   * await rest.dialogs.sendMessage(123, {
   *   text: "Check this",
   *   photos_list: [-1112],
   *   replyTo: 48561
   * });
   *
   * // With attachments
   * await rest.dialogs.sendMessage(123, {
   *   text: "Media",
   *   attachments: [
   *     { Type: "video", Item: 28 },
   *     { Type: "track", Item: 6422 },
   *     { Type: "file", Item: 684 },
   *     { Type: "post", Item: 3201 }
   *   ]
   * });
   *
   * // With new attachments
   * import { File, Audio, Video, Photo }
   * 
   * await rest.dialogs.sendMessage(123, {
   *   text: "Media",
   *   attachments: [
   *     New File('/path/to/file.txt'),
   *     New Photo('/path/to/photo.png', { caption: "the file" }),
   *     New Audio('/path/to/audio.mp3', { name: '', author: '', release: '', cover: '', mode: ''}),
   *     New Video('/path/to/video.mp4')
   *   ]
   * });
   * 
   * // Edit message
   * await rest.dialogs.sendMessage(123, {
   *   text: "Updated",
   *   edit: 12345
   * });
   * ```
   */
  async sendMessage(
    dialogId: number,
    payload: SendMessagePayload
  ): Promise<Message> {
    const messageData: SendMessagePayload = {
      text: payload.text || '',
      photos_list: payload.photos_list || [],
      replyTo: payload.replyTo ?? null,
      edit: payload.edit ?? null,
      attachments: payload.attachments || [],
    };

    return this.client.post<Message>(
      `/dialogs/${dialogId}/messages`,
      messageData
    );
  }

  /**
   * Delete message
   * @group Message Management
   * @param messageId - Message identifier
   * @since 0.1.10
   * @returns {Promise<response>} Operation result
   * @example
   * ```javascript
   * const deleted = await rest.dialogs.deleteMessage(12345);
   * ```
   */
  async deleteMessage(messageId: number): Promise<response> {
    await this.client.patch<undefined>(`/dialogs/messages/${messageId}`);
    return this.client.delete<response>(`/dialogs/messages/${messageId}`);
  }

  /**
   * Mute/unmute dialog
   * @group Dialog Core
   * @param dialogId - Dialog identifier
   * @since 1.0.0
   * @returns {Promise<{mute: boolean, ok: number}>} Mute status response
   * @example
   * ```javascript
   * const result = await rest.dialogs.mute(123);
   * ```
   */
  async mute(dialogId: number): Promise<responseMute> {
    return this.client.patch<responseMute>(`/dialogs/${dialogId}/mute`);
  }
}
