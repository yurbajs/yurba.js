import { DialogMemberModel, UserModel } from '@yurbajs/types';
import { Client } from '../client/Client';
import { Base } from './Base';

/**
 * Represents a dialog member on Yurba
 */
export class DialogMember extends Base {
  /**
   * The member's ID
   */
  public id: number;

  /**
   * The dialog ID this member belongs to
   */
  public dialog: number;

  /**
   * The member user data
   */
  public member: UserModel;

  /**
   * The timestamp when the user joined the dialog
   */
  public timestamp: number;

  constructor(client: Client, data: DialogMemberModel) {
    super(client);

    this.id = data.ID;
    this.dialog = data.Dialog;
    this.member = data.Member;
    this.timestamp = data.Timestamp;
  }

  /**
   * Updates the dialog member with new data
   * @param data - The new dialog member data
   * @internal
   */
  _patch(data: Partial<DialogMemberModel>): this {
    if (data.Dialog !== undefined) this.dialog = data.Dialog;
    if (data.Member !== undefined) this.member = data.Member;
    if (data.Timestamp !== undefined) this.timestamp = data.Timestamp;

    return this;
  }

  /**
   * Creates a clone of this dialog member
   * @internal
   */
  _clone(): DialogMember {
    return Object.assign(Object.create(this), this);
  }

  /**
   * The user ID of this member
   */
  get userId(): number {
    return this.member.ID;
  }

  /**
   * The user's display name
   */
  get displayName(): string {
    return `${this.member.Name} ${this.member.Surname}`.trim();
  }

  /**
   * The user's link/username
   */
  get userLink(): string {
    return this.member.Link;
  }

  /**
   * When the user joined the dialog
   */
  get joinedAt(): Date {
    return new Date(this.timestamp * 1000);
  }

  toString(): string {
    return this.displayName;
  }
}