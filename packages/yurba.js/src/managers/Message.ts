import { MessageModel, IMessageManager } from '@yurbajs/types';
import { CDLog } from '../utils/devlog';
import { Client } from '../client/Client';

const log = CDLog('MessageManager');

/**
 * Message manager for client
 */
export default class MessageManager implements IMessageManager {
  private client: Client;

  /**
   * Creates a new message manager
   * @param client Client instance
   */
  constructor(client: Client) {
    this.client = client; // * No validation that client is properly initialized
  }

  /**
   * Enhances message object with additional methods
   * @param message Message object
   */
  enhanceMessage(message: MessageModel): void {
    log.debug('Enhancing message:', message.ID);
    const msg = message as any; // !WARN: Using 'any' loses all type safety for enhanced message
    /**
     * Replies to the message
     */
    msg.reply = async (
      text: string,
      photos_list: any[] | null = null, // !WARN: Using 'any[]' loses type safety
      attachments: any[] | null = null // !WARN: Using 'any[]' loses type safety
    ) => {
      log.debug(`Replying to message ${message.ID}:`, text);
      return await this.client.api.dialogs.sendMessage(
        message.Dialog?.ID as number, // !WARN: Type assertion without null check - could be undefined
        {
          text,
          replyTo: message.ID,
          photos_list: photos_list || [],
          attachments: attachments || []
        }
      );
    };

    /**
     * Sends a message in response
     */
    msg.response = async (
      text: string,
      photos_list: any[] | null = null, // !WARN: Using 'any[]' loses type safety
      attachments: any[] | null = null, // !WARN: Using 'any[]' loses type safety
      edit?: number | null
    ) => {
      const response = await this.client.api.dialogs.sendMessage(
        message.Dialog?.ID as number, // !WARN: Type assertion without null check
        {
          text,
          replyTo: message.ID,
          photos_list: photos_list || [],
          attachments: attachments || [],
          edit: edit || null // * Redundant - edit is already number | null | undefined
        }
      );
      (response as any).edit = async ( // !WARN: Mutating response object with 'any' type
        newText: string,
        newPhotosList: any[] | null = photos_list, // !WARN: Using 'any[]' loses type safety
        newAttachments: any[] | null = attachments // !WARN: Using 'any[]' loses type safety
      ) => {
        return await this.client.api.dialogs.sendMessage(
          message.Dialog?.ID as number, // !WARN: Type assertion without null check
          {
            text: newText,
            replyTo: message.ID,
            photos_list: newPhotosList || [],
            attachments: newAttachments || [],
            edit: response.ID
          }
        );
      };
      return response;
    };

    /**
     * Deletes the message
     */
    msg.delete = async () => {
      log.debug('Deleting message:', message.ID);
      await this.client.api.dialogs.deleteMessage(message.ID);
    };

    /**
     * Edits the message
     */
    msg.edit = async (
      text?: string,
      replyToId?: number | null,
      photos_list?: any[] | null, // !WARN: Using 'any[]' loses type safety
      attachments?: any[] | null // !WARN: Using 'any[]' loses type safety
    ) => {
      log.debug(`Editing message ${message.ID}:`, text);
      return await this.client.api.dialogs.sendMessage(
        message.Dialog?.ID as number, // !WARN: Type assertion without null check
        {
          text: text || message.Text, // * Could be undefined if both are falsy
          replyTo: replyToId ?? message.ReplyTo?.ID ?? null, // * Complex nullish coalescing - could be simplified
          photos_list: photos_list || message.Photos || [],
          attachments: attachments || message.Attachments || [],
          edit: message.ID
        }
      );
    };

    // Add helper methods for working with commands
    msg.isCommand = (prefix: string = this.client.prefix) => {
      return message.Text && message.Text.startsWith(prefix); // * Could return undefined instead of boolean if Text is undefined
    };
    msg.getCommandArgs = (prefix: string = '/') => { // * Hardcoded default prefix instead of using client prefix
      if (!message.Text || !message.Text.startsWith(prefix)) {
        return [];
      }
      const parts = message.Text.slice(prefix.length).split(' ');
      return parts.slice(1); // * No validation that parts has enough elements
    };
    msg.getCommandName = (prefix: string = '/') => { // * Hardcoded default prefix instead of using client prefix
      if (!message.Text || !message.Text.startsWith(prefix)) {
        return null;
      }
      const parts = message.Text.slice(prefix.length).split(' ');
      return parts[0]; // * No validation that parts[0] exists
    };
  }
}
