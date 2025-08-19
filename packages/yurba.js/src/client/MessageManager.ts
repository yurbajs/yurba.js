import { Message, IMessageManager } from '@yurbajs/types';
import { REST } from '@yurbajs/rest';

/**
 * Message manager for client
 */
export default class MessageManager implements IMessageManager {
  private api: REST;

  /**
   * Creates a new message manager
   * @param api REST client
   */
  constructor(api: REST) {
    this.api = api;
  }

  /**
   * Enhances message object with additional methods
   * @param message Message object
   */
  enhanceMessage(message: Message): void {
    const msg = message as any;
    /**
     * Replies to the message
     */
    msg.reply = async (
      text: string,
      photos_list: any[] | null = null,
      attachments: any[] | null = null
    ) => {
      return await this.api.messages.send(
        message.Dialog?.ID as number,
        text,
        message.ID,
        photos_list,
        attachments
      );
    };

    /**
     * Sends a message in response
     */
    msg.response = async (
      text: string,
      photos_list: any[] | null = null,
      attachments: any[] | null = null,
      edit?: number | null
    ) => {
      const response = await this.api.messages.send(
        message.Dialog?.ID as number,
        text,
        message.ID,
        photos_list,
        attachments,
        edit
      );
      (response as any).edit = async (
        newText: string,
        newPhotosList: any[] | null = photos_list,
        newAttachments: any[] | null = attachments
      ) => {
        return await this.api.messages.send(
          message.Dialog?.ID as number,
          newText,
          message.ID,
          newPhotosList,
          newAttachments,
          response.ID
        );
      };
      return response;
    };

    /**
     * Deletes the message
     */
    msg.delete = async () => {
      await this.api.messages.delete(message.ID);
    };

    /**
     * Edits the message
     */
    msg.edit = async (
      text?: string,
      replyToId?: number | null,
      photos_list?: any[] | null,
      attachments?: any[] | null
    ) => {
      return await this.api.messages.send(
        message.Dialog?.ID as number,
        text || message.Text,
        replyToId ?? message.ReplyTo?.ID ?? null,
        photos_list || message.Photos,
        attachments || message.Attachments,
        message.ID
      );
    };

    // Add helper methods for working with commands
    msg.isCommand = (prefix: string = '/') => {
      return message.Text && message.Text.startsWith(prefix);
    };
    msg.getCommandArgs = (prefix: string = '/') => {
      if (!message.Text || !message.Text.startsWith(prefix)) {
        return [];
      }
      const parts = message.Text.slice(prefix.length).split(' ');
      return parts.slice(1);
    };
    msg.getCommandName = (prefix: string = '/') => {
      if (!message.Text || !message.Text.startsWith(prefix)) {
        return null;
      }
      const parts = message.Text.slice(prefix.length).split(' ');
      return parts[0];
    };
  }
}
