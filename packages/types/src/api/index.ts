// ================================
// TODO: API Types Implementation
// ================================
/**
 * TODO LIST FOR ALL TYPES:
 * 
 * 📝 CORE ENTITIES:
 * [x] Photo
 *   [x] Add payload methods
 *   [x] Add delete methods
 * [x] Post
 *   [x] Add payload methods
 *   [x] Add edit methods
 *   [x] Add delete methods
 * [x] Message
 *   [x] Add payload methods
 *   [x] Add edit methods
 *   [x] Add delete methods
 * [x] Comments
 *   [x] Add payload methods
 *   [x] Add delete methods
 * [x] Dialog
 *   [x] Add payload methods
 *   [x] Add edit methods
 *   [x] Add delete methods

 * 
 * 📎 ATTACHMENTS:
 * [x] Files (Attachments)
 *   [x] Add payload methods
 *   [x] Add delete methods
 * [ ] Videos (Attachments)
 *   [ ] Add payload methods
 *   [ ] Add edit methods
 *   [ ] Add delete methods
 * [x] Music (Attachments)
 *   [x] Add payload methods
 *   [x] Add delete methods
 * 
 * 🔍 FEATURES:
 * [x] Search
 * 
 * [ ] Goling (Settings)
 *   [ ] Add types
 *   [ ] Add methods
 * 
 * [ ] Shop
 * 
 * 👥 SOCIAL:
 * [X] Friends
 * [x] Notifications // need to add gift model
 */

// ================================
// CORE ENTITIES
// ================================

// -------- MESSAGE TYPES --------
export interface Message {
    ID:            number;
    Author:        Author;
    Dialog:        DialogInfo;
    Type:          MessageType;
    Text:          string;
    Photos:        Photo['ID'][];
    ReplyTo:       Message | null;
    Attachments:   Attachment[];
    Views:         number;
    Timestamp:     number;
    EditTimestamp: number;
    Read:          boolean;
}

export interface SendMessagePayload {
    text?:        string | '';
    photos_list?: Photo['ID'][] | [];
    replyTo?:     Message['ID'] | null;
    edit?:        Message['ID'] | null;
    attachments?: AttachmentPayload[] | [];
}

export type DeleteMessageResponse = BaseDelete;
export type EditMessageResponse = Message;
export type SendMessageResponse = Message;

export enum MessageType {
    Join = "join",
    Leave = "leave",
    Message = "message",
}

// -------- POST TYPES --------
export interface Post {
    ID:            number;
    Author:        Author;
    Target:        Author | null;
    Content:       string;
    Photos:        number[];
    Attachments:   Attachment[];
    Timestamp:     number;
    EditTimestamp: number;
    Likes:         Likes;
    Comments:      number;
    Reposts:       number;
    Views:         number;
    IsAd:          boolean;
    Language:      Language;
    Repost:        Post | null;
    Nsfw:          boolean;
}

export interface CreatePostPayload {
    content:     string;
    photos_list: Photo['ID'][];
    language:    Language;
    nsfw:        boolean;
    edit:        Post['ID'] | null;
    repost:      Post['ID'] | null;
    timestamp:   number;
    attachments: AttachmentPayload[];
}

export interface Likes {
    IsLikedByYou: boolean;
    Likes:        number;
}

export type DeletePostResponse = BaseDelete;
export type EditPostResponse = Post;
export type CreatePostResponse = Post;

// -------- PHOTO TYPES --------
export interface Photo {
    ID:        number;
    Author:    Author['ID'];
    Caption:   string;
    Timestamp: number;
    Url:       string;
}

export type UploadPhotoResponse = Photo;
export type DeletePhotoResponse = BaseDelete;

// -------- DIALOG TYPES --------
export interface DialogInfo {
    ID:     number;
    Type:   DialogType;
    Name:   string;
    Avatar: Photo['ID'];
}

export interface Dialog {
    ID:          number;
    Type:        DialogType;
    Members:     number;
    Author:      Author | null;
    DialogDude:  Author | null;
    Name:        string;
    Link:        string;
    Description: string;
    Avatar:      Photo['ID'];
    Verify:      DialogVerify;
    Private:     boolean;
    LastMessage: Message;
    Timestamp:   number;
    Country:     number;
    Topic:       number;
    Fire:        number;
    Mute:        boolean;
    Member:      boolean;
}

export interface DialogMember {
    ID:        number;
    Dialog:    number;
    Member:    User;
    Timestamp: number;
}


export interface CreateDialogPayload {
    name:        string;
    description?: string;
    type:        DialogCreateType;
}

export type CreateDialogResponse = DialogInfo;

export type CreatePrivateDialogResponse = Dialog;

export type DialogCreateType = 'group' | 'channel';

// ISSUES:
export enum DialogType {
  Channel = 'channel',
  Group = 'group',
  Private = 'private',
}
export enum DialogVerify {
    Default = "Default",
    None = "None",
}

// -------- USER TYPES --------
export interface Author {
    ID:                number;
    Name:              string;
    Surname:           string;
    Link:              string;
    Avatar:            number;
    Sub:               Subscription;
    Creative:          number;
    Verify:            Verification;
    Ban:               number;
    Deleted:           number;
    Reports:           number;
    Emoji:             string;
    CosmeticAvatar:    number;
    Online:            Online;
    CommentsState:     number;
    ViewAvatarState:   number;
    RelationshipState: RelationshipState;
}

/**
 * User interface representing a Yurba user profile
 * 
 * @remarks
 * Basic user information: ID, Name, Surname, Link, RegisterDate
 * Profile customization: Avatar, Banner, CosmeticAvatar, Status, About, Emoji
 * Account status: Creative, Ban, Deleted, Reports
 * Location information: Country, Region, City, CityNative
 * Personal information: Birthday, Website, WorksAt, Languages
 * Account features: Sub, Verify, Coins
 * Social metrics: Posts, Friends, Followers
 * Current status: Online
 * Account linking: OriginalAccount
 * Relationship with current user: RelationshipState
 * Privacy settings: PostState, CommentsState, AddFriendState, ViewFriendsState, SendMessageState, ViewAvatarState, ViewBirthdayState, SearchState, OnlineType
 * Optional sensitive data: Password, Email, EmailReserve
 * Optional user-specific data: TrackList, NewMessages, NewNotifications, FriendsRequests, Relationships
 */
export interface User {
    ID:                number;    // Unique user identifier
    Name:              string;    // First name
    Surname:           string;    // Last name
    Link:              string;    // Username/handle for profile URL
    RegisterDate:      number;    // Unix timestamp of registration
    Avatar:            number;    // Avatar image ID
    Banner:            number;    // Profile banner image ID
    CosmeticAvatar:    number;    // Special avatar effects ID
    Status:            string;    // User status message
    About:             string;    // Profile description
    Emoji:             string;    // Profile emoji (e.g., ":coffee:")
    Creative:          boolean;   // Creative account flag
    Ban:               boolean;   // Account banned status
    Deleted:           boolean;   // Account deleted status
    Reports:           number;    // Number of reports against user
    Country:           number;    // Country ID
    Region:            number;    // Region ID
    City:              number;    // City ID
    CityNative:        string;    // Native city name
    Birthday:          string;    // Birth date (YYYY-MM-DD format)
    Website:           string;    // Personal website URL
    WorksAt:           string;    // Workplace information
    Languages:         number[];  // Array of language IDs user speaks
    Sub:               Subscription; // Subscription level
    Verify:            Verification; // Verification badge type
    Coins:             number;    // Virtual currency balance
    Posts:             number;    // Total posts count
    Friends:           number;    // Friends count
    Followers:         number;    // Followers count
    Online:            Online;    // Online status and last seen
    OriginalAccount:   number;    // Original account ID (for linked accounts)
    RelationshipState: RelationshipState; // Current relationship status
    PostState:         Privacy;   // Who can post on user's wall
    CommentsState:     Privacy;   // Who can comment on user's posts
    AddFriendState:    boolean;   // Whether others can send friend requests
    ViewFriendsState:  Privacy;   // Who can see user's friends list
    SendMessageState:  Privacy;   // Who can send direct messages
    ViewAvatarState:   Privacy;   // Who can see user's avatar
    ViewBirthdayState: Privacy;   // Who can see user's birthday
    SearchState:       boolean;   // Whether user appears in search results
    OnlineType:        OnlineDisplayType; // How online status is displayed
    Password?:         string;    // Encrypted password (for user only)
    Email?:            string;    // Primary email address (for user only)
    EmailReserve?:     string;    // Backup email address (for user only)
    TrackList?:        number;    // Music playlist ID (for user only)
    NewMessages?:      number;    // Unread messages count (for user only)
    NewNotifications?: number;    // Unread notifications count (for user only)
    FriendsRequests?:  number;    // Pending friend requests count (for user only)
    Relationships?:    number;    // Relationship status ID (for user only)
}

export interface Online {
    Online:   boolean;
    LastBeen: number;
    Degree:   string;
    Status:   Status;
}

export enum Status {
  DontDisturb = 'dont_disturb',
  MovedAway = 'moved_away',
  Online = 'online',
  None = '',
}

export enum RelationshipState {
  None = '',
  Strangers = 'strangers',
  MeSubscribed = 'me_subscribed',
  HeSubscribed = 'he_subscribed',
  Friends = 'friends',
}


// -------- Notification types --------
export interface Notification {
  ID: number;
  User: Author;
  Type: NotificationType;
  Item: NotificationItem;
  Read: boolean;
  Timestamp: number;
}

export type NotificationItem =
  | CommentLikeItem
  | NewFriendRequestItem
  | AcceptFriendRequestItem
  | CommentPostItem
  | PostLikeItem
  | PostMentionItem
  | CommentMentionItem
  | PostOnWallItem
  | GiftItem;

export enum NotificationType {
  CommentLike = "comment_like",
  NewFriendRequest = "new_friend_request",
  AcceptFriendRequest = "accept_friend_request",
  PostMention = "post_mention",
  CommentMention = "comment_mention",
  PostLike = "post_like",
  PostOnWall = "post_on_wall",
  Gift = "gift",
  CommentPost = "comment_post",
}

export type GiftItem = any; // Need to add

export interface CommentLikeItem {
  ID: number;
  Author: User;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: Post;
}

export interface CommentMentionItem {
  ID: number;
  Author: User;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: Post;
}

export interface AcceptFriendRequestItem {
  RelationshipState: RelationshipState;
}

export interface NewFriendRequestItem {
  RelationshipState: RelationshipState;
}

export interface CommentPostItem {
  ID: number;
  Author: User;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: Post;
}

export type PostMentionItem = Post;
export type PostOnWallItem = Post;
export type PostLikeItem = Post;

// -------- Friends types --------

export interface SubscribePayload {
    "RelationshipState": RelationshipState
}

// -------- Files types --------
export interface File {
    ID:        number;
    Code:      string;
    Name:      string;
    Size:      number;
    Mine:      boolean;
    Timestamp: number;
    Url:       string;
}
export type UploadFileResponse = File
export type DeletFileResponse = BaseDelete


// -------- Music types --------

export interface Track {
    ID:         number;
    Name:       string;
    Author:     string;
    Mine:       boolean;
    Release:    string;
    Size:       number;
    Duration:   number;
    Timestamp:  number;
    Cover:      number;
    Url:        string;
    Explicit:   number;
    Text:       string;
    Genre:      string;
    Authorship: Authorship;
}

export interface Playlist {
    ID:          number;
    Name:        string;
    Release:     string;
    Description: string;
    Tracks:      Track['ID'][];
    Author:      Author;
    Timestamp:   number;
    Cover:       Photo['ID'];
}

export enum Authorship {
    Empty = "{}", // maybe later it has been @author
}

export interface TrackPayload {
  audio: Blob;          
  name: string;
  author: Author;
  release: number;        
  cover: Photo['ID'];           
  mode: 'public' | 'private';
}


export interface PlaylistPayload {
    name:        string;
    release:     string;
    description: string;
    cover:       Photo['ID'];
}
export type EditPlaylistResponse = BaseOkay;
export type DeletePlaylistResponse = BaseDelete;
export type DeleteTrackResponse = Playlist;

// -------- Videos types --------

export interface Video {
    ID:          number;
    Code:        string;
    Name:        string;
    Description: string;
    Preview:     Photo['ID'];
    Duration:    number;
    Views:       number;
    Mine:        boolean;
    Timestamp:   number;
    Url:         string;
}

///// Other later, videos in dev

// -------- Comments types --------

export interface Comment {
    ID:        number;
    Author:    Author;
    Content:   string;
    Photos:    Photo['ID'][];
    Timestamp: number;
    Likes:     Likes;
    Post:      Post;
}

export interface CommentPayload {
    content:     string;
    photos_list: Photo['ID'][];
}

export type DeleteCommentResponse = BaseDelete;

// -------- Search types --------

enum Sort {
  ByRelevance = 0,
  ByPopularity = 1,
  ByAlphabet = 2,
}

export interface SearchFilters {
  sort: Sort;
  country: number;
  region: number;
  city: number;
  worksAt: string;
  relationships: number; 
  online: boolean;
  avatar: boolean;
}


// ================================
// ATTACHMENTS SYSTEM
// ================================

export interface AttachmentPayload {
    Type: AttachmentType;
    Item: BaseAttachment['ID'];
}

export type Attachment = 
  | PostAttachment
  | TrackAttachment
  | FileAttachment
  | VideoAttachment;
  

export interface BaseAttachment {
    ID: number;
    Type: AttachmentType;
    Timestamp?: number;
}

export interface PostAttachment extends BaseAttachment {
    Type: 'post';
    Item: PostItem;
}

export interface TrackAttachment extends BaseAttachment {
    Type: 'track'
    Item: TrackItem;
}

export interface FileAttachment extends BaseAttachment {
    Type: 'file'
    Item: FileItem;
}

export interface VideoAttachment extends BaseAttachment {
    Type: 'video'
    Item: VideoItem;
}

export type AttachmentType = 'video' | 'track' | 'file' | 'post';

export type FileItem = File

// -------- MUSIC ATTACHMENTS --------
export interface TrackItem {
    ID: number;
    Name: string;
    Author: string;
    Mine: boolean;
    Release: string;
    Size: number;
    Duration: number;
    Timestamp: number;
    Cover: number;
    Url: string;
    Explicit: number;
    Text: string;
    Genre: string;
    Authorship: string;
}

// -------- VIDEO ATTACHMENTS --------
export interface VideoItem {
    ID: number;
    Code: string;
    Name: string;
    Description: string;
    Preview: number;
    Duration: number;
    Views: number;
    Mine: boolean;
    Timestamp: number;
    Url: string;
}

export type PostItem = Post;

// ================================
// SYSTEM ENUMS & UTILITIES
// ================================

export type BaseDelete = BaseOkay;

export interface BaseOkay {
    "ok": boolean
}

export enum Language {
    "None" = 0,
    "English" = 1,
    "Ukrainian" = 2,
    "Russian" = 3
}

enum Subscription {
  None = 0,
  YurbaPlus = 1,
  YurbaPremium = 2
}

enum Verification {
  None = "",
  Default = "Default",
  Organisation = "Organisation",
  Goverment = "Goverment"
}

enum Privacy {
  All = 0,
  Friends = 1,
  Nobody = 2
}

enum OnlineDisplayType {
  Default = 0,
  Approximate = 1,
  Invisible = 2,
  Custom = 3
}

export type response = {
  detail?: string,
  ok: boolean
}


export type responseMute = {
  mute: boolean,
  ok: boolean
}
