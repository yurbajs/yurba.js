import { DialogModel, DialogType, DialogVerify } from '@yurbajs/types';
import { Client } from '../client/Client';
import { Base } from './Base';
import DialogMemberManager from '../managers/DialogMember';

/**
 * Represents a dialog on Yurba
 * @category Structures
 */
export class Dialog extends Base {
  /**
   * The dialog's ID
   */
  public id: number;

  /**
   * The type of dialog
   */
  public type: DialogType;

  /**
   * Number of members in the dialog
   */
  public members: number;

  /**
   * The dialog's author
   */
  public author: DialogModel['Author'];

  /**
   * The dialog dude (for private dialogs)
   */
  public dialogDude: DialogModel['DialogDude'];

  /**
   * The dialog's name
   */
  public name: string;

  /**
   * The dialog's link
   */
  public link: string;

  /**
   * The dialog's description
   */
  public description: string;

  /**
   * The dialog's avatar ID
   */
  public avatar: number;

  /**
   * The dialog's verification status
   */
  public verify: DialogVerify;

  /**
   * Whether the dialog is private
   */
  public private: boolean;

  /**
   * The last message in the dialog
   */
  public lastMessage: DialogModel['LastMessage'];

  /**
   * The dialog's creation timestamp
   */
  public timestamp: number;

  /**
   * The dialog's country
   */
  public country: number;

  /**
   * The dialog's topic
   */
  public topic: number;

  /**
   * The dialog's fire count
   */
  public fire: number;

  /**
   * Whether the dialog is muted
   */
  public mute: boolean;

  /**
   * Whether the current user is a member
   */
  public member: boolean;

  /**
   * The dialog member manager
   */
  public memberManager: DialogMemberManager;

  constructor(client: Client, data: DialogModel) {
    super(client);

    this.id = data.ID;
    this.type = data.Type;
    this.members = data.Members;
    this.author = data.Author;
    this.dialogDude = data.DialogDude;
    this.name = data.Name;
    this.link = data.Link;
    this.description = data.Description;
    this.avatar = data.Avatar;
    this.verify = data.Verify;
    this.private = data.Private;
    this.lastMessage = data.LastMessage;
    this.timestamp = data.Timestamp;
    this.country = data.Country;
    this.topic = data.Topic;
    this.fire = data.Fire;
    this.mute = data.Mute;
    this.member = data.Member;

    this.memberManager = new DialogMemberManager(client, this.id);
  }

  /**
   * Updates the dialog with new data
   * @param data - The new dialog data
   * @internal
   */
  _patch(data: Partial<DialogModel>): this {
    if (data.Type !== undefined) this.type = data.Type;
    if (data.Members !== undefined) this.members = data.Members;
    if (data.Author !== undefined) this.author = data.Author;
    if (data.DialogDude !== undefined) this.dialogDude = data.DialogDude;
    if (data.Name !== undefined) this.name = data.Name;
    if (data.Link !== undefined) this.link = data.Link;
    if (data.Description !== undefined) this.description = data.Description;
    if (data.Avatar !== undefined) this.avatar = data.Avatar;
    if (data.Verify !== undefined) this.verify = data.Verify;
    if (data.Private !== undefined) this.private = data.Private;
    if (data.LastMessage !== undefined) this.lastMessage = data.LastMessage;
    if (data.Timestamp !== undefined) this.timestamp = data.Timestamp;
    if (data.Country !== undefined) this.country = data.Country;
    if (data.Topic !== undefined) this.topic = data.Topic;
    if (data.Fire !== undefined) this.fire = data.Fire;
    if (data.Mute !== undefined) this.mute = data.Mute;
    if (data.Member !== undefined) this.member = data.Member;

    return this;
  }

  /**
   * Creates a clone of this dialog
   * @internal
   */
  _clone(): Dialog {
    return Object.assign(Object.create(this), this);
  }

  /**
   * The URL to the dialog
   */
  get url(): string {
    return `https://me.yurba.one/${this.link}`;
  }

  /**
   * The dialog's display name
   */
  get displayName(): string {
    return this.name || this.link;
  }

  /**
   * Whether this is a private dialog
   */
  get isPrivate(): boolean {
    return this.type === DialogType.Private;
  }

  /**
   * Whether this is a group dialog
   */
  get isGroup(): boolean {
    return this.type === DialogType.Group;
  }

  /**
   * Whether this is a channel dialog
   */
  get isChannel(): boolean {
    return this.type === DialogType.Channel;
  }

  /**
   * Whether the dialog is verified
   */
  get isVerified(): boolean {
    return this.verify !== DialogVerify.None;
  }

  toString(): string {
    return this.displayName;
  }
}
