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
export interface MessageModel {
  ID: number;
  Author: ShortUserModel;
  Dialog: DialogInfo;
  Type: MessageType;
  Text: string;
  Photos: Photo['ID'][];
  ReplyTo: MessageModel | null;
  Attachments: Attachment[];
  Views: number;
  Timestamp: number;
  EditTimestamp: number;
  Read: boolean;
}

export interface SendMessagePayload {
  text?: string | '';
  photos_list?: Photo['ID'][] | null;
  replyTo?: MessageModel['ID'] | null;
  edit?: MessageModel['ID'] | null;
  attachments?: AttachmentPayload[] | null;
}

export type DeleteMessageResponse = BaseDelete;
export type EditMessageResponse = MessageModel;
export type SendMessageResponse = MessageModel;

export type MessageType =
  | 'join'
  | 'leave'
  | 'message'
  | 'post_on_wall'
  | 'post_like'
  | 'comment_post'
  | '';

// -------- POST TYPES --------
export interface PostModel {
  ID: number;
  Author: ShortUserModel;
  Target: ShortUserModel | null;
  Content: string;
  Photos: number[];
  Attachments: Attachment[];
  Timestamp: number;
  EditTimestamp: number;
  Likes: Likes;
  Comments: number;
  Reposts: number;
  Views: number;
  IsAd: boolean;
  Language: Language;
  Repost: PostModel | null;
  Nsfw: boolean; // Spoiler
}

export interface GetPostPayload {
  lastId?: number;
  lang?: number | Language;
  feed?: boolean;
}

export interface CreatePostPayload {
  content: string | '';
  photos_list: Photo['ID'][] | [];
  language: Language | null;
  nsfw: boolean | false;
  edit: PostModel['ID'] | null;
  repost: PostModel['ID'] | null;
  timestamp: number | 0;
  attachments: AttachmentPayload[] | [];
}

export interface Likes {
  IsLikedByYou: boolean;
  Likes: number;
}

export type DeletePostResponse = BaseDelete;
export type EditPostResponse = PostModel;
export type CreatePostResponse = PostModel;

// -------- COMMENTS TYPES -------
export interface CommentModel {
  ID: number;
  Author: ShortUserModel;
  Content: string;
  Photos: number[];
  Timestamp: number;
  Likes: Likes;
  Post: PostModel;
}

// -------- PHOTO TYPES --------
export interface Photo {
  ID: number;
  Author: ShortUserModel['ID'];
  Caption: string;
  Timestamp: number;
  Url: string;
}

export type UploadPhotoResponse = Photo;
export type DeletePhotoResponse = BaseDelete;

// -------- DIALOG TYPES --------
export interface DialogInfo {
  ID: number;
  Type: DialogType;
  Name: string;
  Avatar: Photo['ID'];
}

export interface DialogModel {
  ID: number;
  Type: DialogType;
  Members: number;
  Author: ShortUserModel | null;
  DialogDude: ShortUserModel | null;
  Name: string;
  Link: string;
  Description: string;
  Avatar: Photo['ID'];
  Verify: DialogVerify;
  Private: boolean;
  LastMessage: MessageModel;
  Timestamp: number;
  Country: number;
  Topic: number;
  Fire: number;
  Mute: boolean;
  Member: boolean;
}

export interface DialogMemberModel {
  ID: number;
  Dialog: number;
  Member: UserModel;
  Timestamp: number;
}

export interface FindDialogPayload {
  sort: number | Sort; // 0 - byRealative, 1 - byPopularity, 2 - byAlphabet
  type: number | FDType; // 0 - none, 1 - group, 2 - channel
  country: number | Country; // 0 - none,
  topic: number | FDTopic; // 0 - none, 1
}

export enum FDType {
  NotSelected = 0,
  Group = 1,
  Channel = 2,
}

export enum FDTopic {
  NotSelected = 0,
  Education = 1,
  Hobbies = 2,
  Work = 3,
  SocietyCulture = 4,
  TechScience = 5,
  Entertainment = 6,
  HealthLifestyle = 7,
  Travel = 8,
  BusinessFinance = 9,
  LocalCommunities = 10,
  PersonalBlog = 11,
}

export interface CreateDialogPayload {
  name: string;
  description?: string;
  type: DialogCreateType;
}

export interface UpdateDialogPayload {
  name?: string;
  description?: string;
  avatar?: Photo['ID'];
  topic?: number;
  private?: boolean;
}

export type CreateDialogResponse = DialogInfo;

export type CreatePrivateDialogResponse = DialogModel;

export type DialogCreateType = 'group' | 'channel';

// ISSUES:
export enum DialogType {
  Channel = 'channel',
  Group = 'group',
  Private = 'private',
}
export enum DialogVerify {
  Default = 'Default',
  None = 'None',
}

// -------- USER TYPES --------
// Short model user
export interface ShortUserModel {
  ID: number;
  Name: string;
  Surname: string;
  Link: string;
  Avatar: number;
  Sub: Subscription;
  Creative: number;
  Verify: Verification;
  Ban: number;
  Deleted: number;
  Reports: number;
  Emoji: string;
  CosmeticAvatar: number;
  Online: Online;
  CommentsState: number;
  ViewAvatarState: number;
  RelationshipState: RelationshipState;
}

/**
 * User interface representing a Yurba user profile
 */
export interface UserModel {
  ID: number; // Unique user identifier
  Name: string; // First name
  Surname: string; // Last name
  Link: string; // Username/handle for profile URL
  RegisterDate: number; // Unix timestamp of registration
  Avatar: number; // Avatar image ID
  Banner: number; // Profile banner image ID
  CosmeticAvatar: number; // Special avatar effects ID
  Status: string; // User status message
  About: string; // Profile description
  Emoji: string; // Profile emoji (e.g., ":coffee:")
  Creative: boolean; // Creative account flag
  Ban: boolean; // Account banned status
  Deleted: boolean; // Account deleted status
  Reports: number; // Number of reports against user
  Country: number | Country; // Country ID
  Region: number; // Region ID
  City: number; // City ID
  CityNative: string; // Native city name
  Birthday: string; // Birth date (YYYY-MM-DD format)
  Website: string; // Personal website URL
  WorksAt: string; // Workplace information
  Languages: number[]; // Array of language IDs user speaks
  Sub: Subscription; // Subscription level
  Verify: Verification; // Verification badge type
  Coins: number; // Virtual currency balance
  Posts: number; // Total posts count
  Friends: number; // Friends count
  Followers: number; // Followers count
  Online: Online; // Online status and last seen
  OriginalAccount: number; // Original account ID (for linked accounts)
  RelationshipState: RelationshipState; // Current relationship status
	/**
	 * tests
	 */
  PostState: Privacy; // Who can post on user's wall
  CommentsState: Privacy; // Who can comment on user's posts
  AddFriendState: boolean; // Whether others can send friend requests
  ViewFriendsState: Privacy; // Who can see user's friends list
  SendMessageState: Privacy; // Who can send direct messages
  ViewAvatarState: Privacy; // Who can see user's avatar
  ViewBirthdayState: Privacy; // Who can see user's birthday
  SearchState: boolean; // Whether user appears in search results
  OnlineType: OnlineDisplayType; // How online status is displayed
  Password?: string; // Encrypted password (for user only)
  Email?: string; // Primary email address (for user only)
  EmailReserve?: string; // Backup email address (for user only)
  TrackList?: number; // Music playlist ID (for user only)
  NewMessages?: number; // Unread messages count (for user only)
  NewNotifications?: number; // Unread notifications count (for user only)
  FriendsRequests?: number; // Pending friend requests count (for user only)
  Relationships?: number; // Relationship status ID (for user only)
}

export interface Online {
  Online: boolean;
  LastBeen: number;
  Degree: string;
  Status: Status;
}

export enum Status {
  DontDisturb = 'dont_disturb',
  MovedAway = 'moved_away',
  Online = 'online',
  None = '',
}

export interface RelationshipsResult {
  RelationshipState: RelationshipState;
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
  User: ShortUserModel;
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
  CommentLike = 'comment_like',
  NewFriendRequest = 'new_friend_request',
  AcceptFriendRequest = 'accept_friend_request',
  PostMention = 'post_mention',
  CommentMention = 'comment_mention',
  PostLike = 'post_like',
  PostOnWall = 'post_on_wall',
  Gift = 'gift',
  CommentPost = 'comment_post',
}
export type GiftItem = Gift;

export interface Shop {
  ID: number;
  Name: string;
  Description: string;
  Items: Item[];
}

export interface Gift {
  ID: number;
  User: UserModel;
  Target: UserModel;
  Item: ShopItem;
  Timestamp: number;
}

export interface ShopItem {
  ID: number;
  Name: string;
  Description: string;
  Category: number;
  Cost: number;
  Sub: number;
  Type: ShopItemType;
  Animated: number;
}

export enum ShopItemType {
  Gift = 'gift',
  Sub = 'sub',
}

export interface CommentLikeItem {
  ID: number;
  Author: UserModel;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: PostModel;
}

export interface CommentMentionItem {
  ID: number;
  Author: UserModel;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: PostModel;
}

export interface AcceptFriendRequestItem {
  RelationshipState: RelationshipState;
}

export interface NewFriendRequestItem {
  RelationshipState: RelationshipState;
}

export interface CommentPostItem {
  ID: number;
  Author: UserModel;
  Content: string;
  Photos: number[] | null;
  Timestamp: number;
  Likes: Likes;
  Post: PostModel;
}

export type PostMentionItem = PostModel;
export type PostOnWallItem = PostModel;
export type PostLikeItem = PostModel;

// -------- Friends types --------

export interface SubscribePayload {
  RelationshipState: RelationshipState;
}

// -------- Files types --------
export interface File {
  ID: number;
  Code: string;
  Name: string;
  Size: number;
  Mine: boolean;
  Timestamp: number;
  Url: string;
}
export type UploadFileResponse = File;
export type DeletFileResponse = BaseDelete;

// ------- Account Types ------

export interface Login {
  id: number;
  ok: number;
  token: string;
}

export interface Token {
  Token: string;
  LastBeen: number;
  Timestamp: number;
  Device: string;
  User: number;
  Online: boolean;
  IP: null;
}

export interface SettingsPayload {
  name?: string;
  surname?: string;
  worksAt?: string;
  website?: string;
  relationships?: number;
  online?: string;
  birthday?: string;
  status?: string;
  about?: string;
  country?: number;
  city?: number;
  cityNative?: string;
  languages?: number[];
  email?: string;
  reserve?: string;
  link?: string;
  avatar?: Photo['ID'];
  banner?: Photo['ID'];
  Emoji?: string;
}

// -------- Music types --------

export interface Track {
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
  Authorship: Authorship;
}

export interface Playlist {
  ID: number;
  Name: string;
  Release: string;
  Description: string;
  Tracks: Track['ID'][];
  Author: ShortUserModel;
  Timestamp: number;
  Cover: Photo['ID'];
}

export enum Authorship {
  Empty = '{}', // maybe later it has been @author
}

export interface TrackPayload {
  audio: Blob;
  name: string;
  author: ShortUserModel;
  release: number;
  cover: Photo['ID'];
  mode: 'public' | 'private';
}

export interface PlaylistPayload {
  name: string;
  release: string;
  description: string;
  cover: Photo['ID'];
}
export type EditPlaylistResponse = BaseOkay;
export type DeletePlaylistResponse = BaseDelete;
export type DeleteTrackResponse = Playlist;

// -------- Videos types --------

export interface Video {
  ID: number;
  Code: string;
  Name: string;
  Description: string;
  Preview: Photo['ID'];
  Duration: number;
  Views: number;
  Mine: boolean;
  Timestamp: number;
  Url: string;
}

///// Other later, videos in dev

// -------- Comments types --------

export interface Comment {
  ID: number;
  Author: ShortUserModel;
  Content: string;
  Photos: Photo['ID'][];
  Timestamp: number;
  Likes: Likes;
  Post: PostModel;
}

export interface CommentPayload {
  content: string;
  photos_list: Photo['ID'][];
}

export type DeleteCommentResponse = BaseDelete;

// -------- Search types --------

/**
 * Sort options for search results
 */
export enum Sort {
  ByRelevance = 0,
  ByPopularity = 1,
  ByAlphabet = 2,
}

export interface SearchFilters {
  sort: Sort;
  country: number | Country;
  region: number;
  city: number;
  worksAt: string;
  relationships: number;
  online: boolean;
  avatar: boolean;
}

export interface FindUserPayload {
  sort: number | Sort;
  country: number | Country | null;
  region: number | null;
  city: number | null;
  worksAt: string | '';
  relationships: number | RelationshipStatus;
  online: boolean;
  avatar: boolean;
}

export enum RelationshipStatus {
  PreferNotToSpeak = 0,
  NotMarried = 1,
  InRelationship = 2,
  InLove = 3,
  Married = 4,
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
  Type: 'track';
  Item: TrackItem;
}

export interface FileAttachment extends BaseAttachment {
  Type: 'file';
  Item: FileItem;
}

export interface VideoAttachment extends BaseAttachment {
  Type: 'video';
  Item: VideoItem;
}

export type AttachmentType = 'video' | 'track' | 'file' | 'post';

export type FileItem = File;

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

export type PostItem = PostModel;

// -------- GIFT TYPES --------
export interface Gift {
  ID: number;
  User: UserModel;
  Target: UserModel;
  Item: ShopItem;
  Timestamp: number;
}

export interface Item {
  ID: number;
  Name: string;
  Description: string;
  Category: number;
  Cost: number;
  Sub: number;
  Type: Type;
  Animated: number;
}

export interface Shop {
  ID: number;
  Name: string;
  Description: string;
  Items: Item[];
}

export enum Type {
  Gift = 'gift',
  Sub = 'sub',
}

// -------- APP TYPES --------
export interface App {
  ID: number;
  Name: string;
  PublicKey: string;
  SecretKey: string;
  RedirectUrl: string;
  Timestamp: number;
}

export interface AppToken {
  Token: string;
  App: App;
  User: number;
  LastBeen: number;
  Timestamp: number;
  IP: string;
}

export interface CreateAppPayload {
  name: string;
  redirectUrl: string;
}

// ================================
// SYSTEM ENUMS & UTILITIES
// ================================

export type BaseDelete = BaseOkay;

export interface BaseOkay {
  ok: boolean;
}

export enum Language {
  'None' = 0,
  'English' = 1,
  'Ukrainian' = 2,
  'Russian' = 3,
}

/**
 * User subscription levels
 */
export enum Subscription {
  None = 0,
  YurbaPlus = 1,
  YurbaPremium = 2,
}

/**
 * User verification types
 */
export enum Verification {
  None = '',
  Default = 'Default',
  Organisation = 'Organisation',
  Goverment = 'Goverment',
}

/**
 * Privacy settings for user profile
 */
export enum Privacy {
  All = 0,
  Friends = 1,
  Nobody = 2,
}

/**
 * Online status display types
 */
export enum OnlineDisplayType {
  Default = 0,
  Approximate = 1,
  Invisible = 2,
  Custom = 3,
}

export type response = {
  detail?: string;
  ok: boolean;
};

export type responseMute = {
  mute: boolean;
  ok: boolean;
};

// OTHER!!!!

export interface Regions {
  ID: number;
  Country: number;
  Name: string;
}

export interface Lang {
  ID: number;
  Code: string;
  Name: string;
}

export const languages: Lang[] = [
  { ID: 1, Code: 'en', Name: 'English' },
  { ID: 2, Code: 'ceb', Name: 'Sinugboanong Binisaya' },
  { ID: 3, Code: 'sv', Name: 'Svenska' },
  { ID: 4, Code: 'de', Name: 'Deutsch' },
  { ID: 5, Code: 'fr', Name: 'Français' },
  { ID: 6, Code: 'nl', Name: 'Nederlands' },
  { ID: 7, Code: 'ru', Name: 'Русский' },
  { ID: 8, Code: 'it', Name: 'Italiano' },
  { ID: 9, Code: 'es', Name: 'Español' },
  { ID: 10, Code: 'war', Name: 'Winaray' },
  { ID: 11, Code: 'pl', Name: 'Polski' },
  { ID: 12, Code: 'vi', Name: 'Tiếng Việt' },
  { ID: 13, Code: 'ja', Name: '日本語' },
  { ID: 14, Code: 'pt', Name: 'Português' },
  { ID: 15, Code: 'zh', Name: '中文' },
  { ID: 16, Code: 'uk', Name: 'Українська' },
  { ID: 17, Code: 'fa', Name: 'فارسی' },
  { ID: 18, Code: 'sr', Name: 'Српски / Srpski' },
  { ID: 19, Code: 'ca', Name: 'Català' },
  { ID: 20, Code: 'ar', Name: 'العربية' },
  { ID: 21, Code: 'no', Name: 'Norsk (Bokmål)' },
  { ID: 22, Code: 'sh', Name: 'Srpskohrvatski / Српскохрватски' },
  { ID: 23, Code: 'fi', Name: 'Suomi' },
  { ID: 24, Code: 'hu', Name: 'Magyar' },
  { ID: 25, Code: 'id', Name: 'Bahasa Indonesia' },
  { ID: 26, Code: 'ko', Name: '한국어' },
  { ID: 27, Code: 'cs', Name: 'Čeština' },
  { ID: 28, Code: 'ro', Name: 'Română' },
  { ID: 29, Code: 'ms', Name: 'Bahasa Melayu' },
  { ID: 30, Code: 'tr', Name: 'Türkçe' },
  { ID: 31, Code: 'eu', Name: 'Euskara' },
  { ID: 32, Code: 'eo', Name: 'Esperanto' },
  { ID: 33, Code: 'bg', Name: 'Български' },
  { ID: 34, Code: 'hy', Name: 'Հայերեն' },
  { ID: 35, Code: 'da', Name: 'Dansk' },
  { ID: 36, Code: 'zh-min-nan', Name: 'Bân-lâm-gú' },
  { ID: 37, Code: 'sk', Name: 'Slovenčina' },
  { ID: 38, Code: 'min', Name: 'Minangkabau' },
  { ID: 39, Code: 'kk', Name: 'Қазақша' },
  { ID: 40, Code: 'he', Name: 'עברית' },
  { ID: 41, Code: 'lt', Name: 'Lietuvių' },
  { ID: 42, Code: 'hr', Name: 'Hrvatski' },
  { ID: 43, Code: 'et', Name: 'Eesti' },
  { ID: 44, Code: 'ce', Name: 'Нохчийн' },
  { ID: 45, Code: 'sl', Name: 'Slovenščina' },
  { ID: 46, Code: 'be', Name: 'Беларуская' },
  { ID: 47, Code: 'gl', Name: 'Galego' },
  { ID: 48, Code: 'el', Name: 'Ελληνικά' },
  { ID: 49, Code: 'nn', Name: 'Nynorsk' },
  { ID: 50, Code: 'simple', Name: 'Simple English' },
  { ID: 51, Code: 'az', Name: 'Azərbaycanca' },
  { ID: 52, Code: 'uz', Name: 'O‘zbek' },
  { ID: 53, Code: 'la', Name: 'Latina' },
  { ID: 54, Code: 'ur', Name: 'اردو' },
  { ID: 55, Code: 'hi', Name: 'हिन्दी' },
  { ID: 56, Code: 'th', Name: 'ไทย' },
  { ID: 57, Code: 'vo', Name: 'Volapük' },
  { ID: 58, Code: 'ka', Name: 'ქართული' },
  { ID: 59, Code: 'ta', Name: 'தமிழ்' },
  { ID: 60, Code: 'cy', Name: 'Cymraeg' },
  { ID: 61, Code: 'tg', Name: 'Тоҷикӣ' },
  { ID: 62, Code: 'mk', Name: 'Македонски' },
  { ID: 63, Code: 'tl', Name: 'Tagalog' },
  { ID: 64, Code: 'mg', Name: 'Malagasy' },
  { ID: 65, Code: 'oc', Name: 'Occitan' },
  { ID: 66, Code: 'lv', Name: 'Latviešu' },
  { ID: 67, Code: 'ky', Name: 'Кыргызча' },
  { ID: 68, Code: 'bs', Name: 'Bosanski' },
  { ID: 69, Code: 'tt', Name: 'Tatarça / Татарча' },
  { ID: 70, Code: 'new', Name: 'नेपाल भाषा' },
  { ID: 71, Code: 'sq', Name: 'Shqip' },
  { ID: 72, Code: 'te', Name: 'తెలుగు' },
  { ID: 73, Code: 'pms', Name: 'Piemontèis' },
  { ID: 74, Code: 'zh-yue', Name: '粵語' },
  { ID: 75, Code: 'br', Name: 'Brezhoneg' },
  { ID: 76, Code: 'be-x-old', Name: 'Беларуская (тарашкевіца)' },
  { ID: 77, Code: 'azb', Name: 'تۆرکجه' },
  { ID: 78, Code: 'ast', Name: 'Asturianu' },
  { ID: 79, Code: 'bn', Name: 'বাংলা' },
  { ID: 80, Code: 'ml', Name: 'മലയാളം' },
  { ID: 81, Code: 'ht', Name: 'Krèyol ayisyen' },
  { ID: 82, Code: 'jv', Name: 'Basa Jawa' },
  { ID: 83, Code: 'lb', Name: 'Lëtzebuergesch' },
  { ID: 84, Code: 'mr', Name: 'मराठी' },
  { ID: 85, Code: 'sco', Name: 'Scots' },
  { ID: 86, Code: 'af', Name: 'Afrikaans' },
  { ID: 87, Code: 'ga', Name: 'Gaeilge' },
  { ID: 88, Code: 'pnb', Name: 'شاہ مکھی پنجابی (Shāhmukhī Pañjābī)' },
  { ID: 89, Code: 'is', Name: 'Íslenska' },
  { ID: 90, Code: 'ba', Name: 'Башҡорт' },
  { ID: 91, Code: 'cv', Name: 'Чăваш' },
  { ID: 92, Code: 'fy', Name: 'Frysk' },
  { ID: 93, Code: 'su', Name: 'Basa Sunda' },
  { ID: 94, Code: 'sw', Name: 'Kiswahili' },
  { ID: 95, Code: 'my', Name: 'မြန်မာဘာသာ' },
  { ID: 96, Code: 'lmo', Name: 'Lumbaart' },
  { ID: 97, Code: 'an', Name: 'Aragonés' },
  { ID: 98, Code: 'yo', Name: 'Yorùbá' },
  { ID: 99, Code: 'ne', Name: 'नेपाली' },
  { ID: 100, Code: 'pa', Name: 'ਪੰਜਾਬੀ' },
  { ID: 101, Code: 'gu', Name: 'ગુજરાતી' },
  { ID: 102, Code: 'io', Name: 'Ido' },
  { ID: 103, Code: 'nds', Name: 'Plattdüütsch' },
  { ID: 104, Code: 'scn', Name: 'Sicilianu' },
  { ID: 105, Code: 'bpy', Name: 'ইমার ঠার/বিষ্ণুপ্রিয়া মণিপুরী' },
  { ID: 106, Code: 'als', Name: 'Alemannisch' },
  { ID: 107, Code: 'bar', Name: 'Boarisch' },
  { ID: 108, Code: 'ku', Name: 'Kurdî / كوردی' },
  { ID: 109, Code: 'kn', Name: 'ಕನ್ನಡ' },
  { ID: 110, Code: 'ckb', Name: 'Soranî / کوردی' },
  { ID: 111, Code: 'ia', Name: 'Interlingua' },
  { ID: 112, Code: 'qu', Name: 'Runa Simi' },
  { ID: 113, Code: 'mn', Name: 'Монгол' },
  { ID: 114, Code: 'arz', Name: 'مصرى (Maṣri)' },
  { ID: 115, Code: 'bat-smg', Name: 'Žemaitėška' },
  { ID: 116, Code: 'gd', Name: 'Gàidhlig' },
  { ID: 117, Code: 'wa', Name: 'Walon' },
  { ID: 118, Code: 'nap', Name: 'Nnapulitano' },
  { ID: 119, Code: 'si', Name: 'සිංහල' },
  { ID: 120, Code: 'yi', Name: 'ייִדיש' },
  { ID: 121, Code: 'bug', Name: 'Basa Ugi' },
  { ID: 122, Code: 'am', Name: 'አማርኛ' },
  { ID: 123, Code: 'cdo', Name: 'Mìng-dĕ̤ng-ngṳ̄' },
  { ID: 124, Code: 'or', Name: 'ଓଡ଼ିଆ' },
  { ID: 125, Code: 'map-bms', Name: 'Basa Banyumasan' },
  { ID: 126, Code: 'fo', Name: 'Føroyskt' },
  { ID: 127, Code: 'mzn', Name: 'مَزِروني' },
  { ID: 128, Code: 'hsb', Name: 'Hornjoserbsce' },
  { ID: 129, Code: 'xmf', Name: 'მარგალური (Margaluri)' },
  { ID: 130, Code: 'mai', Name: 'मैथिली' },
  { ID: 131, Code: 'li', Name: 'Limburgs' },
  { ID: 132, Code: 'sah', Name: 'Саха тыла (Saxa Tyla)' },
  { ID: 133, Code: 'sa', Name: 'संस्कृतम्' },
  { ID: 134, Code: 'vec', Name: 'Vèneto' },
  { ID: 135, Code: 'ilo', Name: 'Ilokano' },
  { ID: 136, Code: 'os', Name: 'Иронау' },
  { ID: 137, Code: 'mrj', Name: 'Кырык Мары (Kyryk Mary)' },
  { ID: 138, Code: 'hif', Name: 'Fiji Hindi' },
  { ID: 139, Code: 'mhr', Name: 'Олык Марий (Olyk Marij)' },
  { ID: 140, Code: 'bh', Name: 'भोजपुरी' },
  { ID: 141, Code: 'eml', Name: 'Emiliàn e rumagnòl' },
  { ID: 142, Code: 'roa-tara', Name: 'Tarandíne' },
  { ID: 143, Code: 'ps', Name: 'پښتو' },
  { ID: 144, Code: 'diq', Name: 'Zazaki' },
  { ID: 145, Code: 'pam', Name: 'Kapampangan' },
  { ID: 146, Code: 'sd', Name: 'سنڌي، سندھی ، सिन्ध' },
  { ID: 147, Code: 'hak', Name: 'Hak-kâ-fa / 客家話' },
  { ID: 148, Code: 'nso', Name: 'Sepedi' },
  { ID: 149, Code: 'se', Name: 'Sámegiella' },
  { ID: 150, Code: 'zh-classical', Name: '古文 / 文言文' },
  { ID: 151, Code: 'bcl', Name: 'Bikol' },
  { ID: 152, Code: 'ace', Name: 'Bahsa Acèh' },
  { ID: 153, Code: 'mi', Name: 'Māori' },
  { ID: 154, Code: 'nah', Name: 'Nāhuatl' },
  { ID: 155, Code: 'nds-nl', Name: 'Nedersaksisch' },
  { ID: 156, Code: 'szl', Name: 'Ślůnski' },
  { ID: 157, Code: 'wuu', Name: '吴语' },
  { ID: 158, Code: 'gan', Name: '贛語' },
  { ID: 159, Code: 'rue', Name: 'Русиньскый' },
  { ID: 160, Code: 'frr', Name: 'Nordfriisk' },
  { ID: 161, Code: 'vls', Name: 'West-Vlams' },
  { ID: 162, Code: 'km', Name: 'ភាសាខ្មែរ' },
  { ID: 163, Code: 'bo', Name: 'བོད་སྐད' },
  { ID: 164, Code: 'vep', Name: 'Vepsän' },
  { ID: 165, Code: 'glk', Name: 'گیلکی' },
  { ID: 166, Code: 'sc', Name: 'Sardu' },
  { ID: 167, Code: 'crh', Name: 'Qırımtatarca' },
  { ID: 168, Code: 'fiu-vro', Name: 'Võro' },
  { ID: 169, Code: 'co', Name: 'Corsu' },
  { ID: 170, Code: 'lrc', Name: 'لۊری شومالی' },
  { ID: 171, Code: 'tk', Name: 'تركمن / Туркмен' },
  { ID: 172, Code: 'kv', Name: 'Коми' },
  { ID: 173, Code: 'csb', Name: 'Kaszëbsczi' },
  { ID: 174, Code: 'gv', Name: 'Gaelg' },
  { ID: 175, Code: 'as', Name: 'অসমীয়া' },
  { ID: 176, Code: 'myv', Name: 'Эрзянь (Erzjanj Kelj)' },
  { ID: 177, Code: 'lad', Name: 'Dzhudezmo' },
  { ID: 178, Code: 'so', Name: 'Soomaali' },
  { ID: 179, Code: 'zea', Name: 'Zeêuws' },
  { ID: 180, Code: 'nv', Name: 'Diné bizaad' },
  { ID: 181, Code: 'ay', Name: 'Aymar' },
  { ID: 182, Code: 'udm', Name: 'Удмурт кыл' },
  { ID: 183, Code: 'lez', Name: 'Лезги чІал (Lezgi č’al)' },
  { ID: 184, Code: 'ie', Name: 'Interlingue' },
  { ID: 185, Code: 'stq', Name: 'Seeltersk' },
  { ID: 186, Code: 'kw', Name: 'Kernowek' },
  { ID: 187, Code: 'nrm', Name: 'Normaund' },
  { ID: 188, Code: 'pcd', Name: 'Picard' },
  { ID: 189, Code: 'mwl', Name: 'Mirandés' },
  { ID: 190, Code: 'rm', Name: 'Rumantsch' },
  { ID: 191, Code: 'koi', Name: 'Перем Коми (Perem Komi)' },
  { ID: 192, Code: 'ab', Name: 'Аҧсуа' },
  { ID: 193, Code: 'gom', Name: 'गोंयची कोंकणी / Gõychi Konknni' },
  { ID: 194, Code: 'ug', Name: 'ئۇيغۇر تىلى' },
  { ID: 195, Code: 'lij', Name: 'Líguru' },
  { ID: 196, Code: 'cbk-zam', Name: 'Chavacano de Zamboanga' },
  { ID: 197, Code: 'gn', Name: "Avañe'ẽ" },
  { ID: 198, Code: 'mt', Name: 'Malti' },
  { ID: 199, Code: 'fur', Name: 'Furlan' },
  { ID: 200, Code: 'dsb', Name: 'Dolnoserbski' },
  { ID: 201, Code: 'sn', Name: 'chiShona' },
  { ID: 202, Code: 'dv', Name: 'ދިވެހިބަސް' },
  { ID: 203, Code: 'ang', Name: 'Englisc' },
  { ID: 204, Code: 'ln', Name: 'Lingala' },
  { ID: 205, Code: 'ext', Name: 'Estremeñu' },
  { ID: 206, Code: 'kab', Name: 'Taqbaylit' },
  { ID: 207, Code: 'ksh', Name: 'Ripoarisch' },
  { ID: 208, Code: 'frp', Name: 'Arpitan' },
  { ID: 209, Code: 'lo', Name: 'ລາວ' },
  { ID: 210, Code: 'gag', Name: 'Gagauz' },
  { ID: 211, Code: 'dty', Name: 'Doteli' },
  { ID: 212, Code: 'pag', Name: 'Pangasinan' },
  { ID: 213, Code: 'pi', Name: 'पाऴि' },
  { ID: 214, Code: 'olo', Name: 'Karjalan' },
  { ID: 215, Code: 'av', Name: 'Авар' },
  { ID: 216, Code: 'xal', Name: 'Хальмг' },
  { ID: 217, Code: 'pfl', Name: 'Pälzisch' },
  { ID: 218, Code: 'bxr', Name: 'Буряад' },
  { ID: 219, Code: 'haw', Name: 'Hawai`i' },
  { ID: 220, Code: 'krc', Name: 'Къарачай-Малкъар (Qarachay-Malqar)' },
  { ID: 221, Code: 'pap', Name: 'Papiamentu' },
  { ID: 222, Code: 'kaa', Name: 'Qaraqalpaqsha' },
  { ID: 223, Code: 'rw', Name: 'Ikinyarwanda' },
  { ID: 224, Code: 'pdc', Name: 'Deitsch' },
  { ID: 225, Code: 'bjn', Name: 'Bahasa Banjar' },
  { ID: 226, Code: 'to', Name: 'faka Tonga' },
  { ID: 227, Code: 'nov', Name: 'Novial' },
  { ID: 228, Code: 'ha', Name: 'هَوُسَ' },
  { ID: 229, Code: 'kl', Name: 'Kalaallisut' },
  { ID: 230, Code: 'arc', Name: 'ܐܪܡܝܐ' },
  { ID: 231, Code: 'jam', Name: 'Jumiekan Kryuol' },
  { ID: 232, Code: 'kbd', Name: 'Адыгэбзэ (Adighabze)' },
  { ID: 233, Code: 'tyv', Name: 'Тыва' },
  { ID: 234, Code: 'tpi', Name: 'Tok Pisin' },
  { ID: 235, Code: 'tet', Name: 'Tetun' },
  { ID: 236, Code: 'ig', Name: 'Igbo' },
  { ID: 237, Code: 'ki', Name: 'Gĩkũyũ' },
  { ID: 238, Code: 'na', Name: 'dorerin Naoero' },
  { ID: 239, Code: 'roa-rup', Name: 'Armãneashce' },
  { ID: 240, Code: 'lbe', Name: 'Лакку' },
  { ID: 241, Code: 'jbo', Name: 'Lojban' },
  { ID: 242, Code: 'ty', Name: 'Reo Mā`ohi' },
  { ID: 243, Code: 'mdf', Name: 'Мокшень (Mokshanj Kälj)' },
  { ID: 244, Code: 'za', Name: 'Cuengh' },
  { ID: 245, Code: 'kg', Name: 'KiKongo' },
  { ID: 246, Code: 'lg', Name: 'Luganda' },
  { ID: 247, Code: 'wo', Name: 'Wolof' },
  { ID: 248, Code: 'bi', Name: 'Bislama' },
  { ID: 249, Code: 'srn', Name: 'Sranantongo' },
  { ID: 250, Code: 'tcy', Name: 'ತುಳು' },
  { ID: 251, Code: 'zu', Name: 'isiZulu' },
  { ID: 252, Code: 'chr', Name: 'ᏣᎳᎩ' },
  { ID: 253, Code: 'kbp', Name: 'Kabiye' },
  { ID: 254, Code: 'ltg', Name: 'Latgaļu' },
  { ID: 255, Code: 'sm', Name: 'Gagana Samoa' },
  { ID: 256, Code: 'om', Name: 'Oromoo' },
  { ID: 257, Code: 'xh', Name: 'isiXhosa' },
  { ID: 258, Code: 'rmy', Name: 'romani - रोमानी' },
  { ID: 259, Code: 'tn', Name: 'Setswana' },
  { ID: 260, Code: 'cu', Name: 'Словѣньскъ' },
  { ID: 261, Code: 'pih', Name: 'Norfuk' },
  { ID: 262, Code: 'rn', Name: 'Kirundi' },
  { ID: 263, Code: 'chy', Name: 'Tsetsêhestâhese' },
  { ID: 264, Code: 'tw', Name: 'Twi' },
  { ID: 265, Code: 'tum', Name: 'chiTumbuka' },
  { ID: 266, Code: 'ts', Name: 'Xitsonga' },
  { ID: 267, Code: 'st', Name: 'Sesotho' },
  { ID: 268, Code: 'got', Name: '𐌲𐌿𐍄𐌹𐍃𐌺' },
  { ID: 269, Code: 'pnt', Name: 'Ποντιακά' },
  { ID: 270, Code: 'ss', Name: 'SiSwati' },
  { ID: 271, Code: 'ch', Name: 'Chamoru' },
  { ID: 272, Code: 'bm', Name: 'Bamanankan' },
  { ID: 273, Code: 'fj', Name: 'Na Vosa Vakaviti' },
  { ID: 274, Code: 'ady', Name: 'Адыгэбзэ' },
  { ID: 275, Code: 'iu', Name: 'ᐃᓄᒃᑎᑐᑦ' },
  { ID: 276, Code: 'ny', Name: 'Chichewa' },
  { ID: 277, Code: 'atj', Name: 'Atikamekw' },
  { ID: 278, Code: 'ee', Name: 'Eʋegbe' },
  { ID: 279, Code: 'ks', Name: 'कश्मीरी / كشميري' },
  { ID: 280, Code: 'ak', Name: 'Akana' },
  { ID: 281, Code: 'ik', Name: 'Iñupiak' },
  { ID: 282, Code: 've', Name: 'Tshivenda' },
  { ID: 283, Code: 'sg', Name: 'Sängö' },
  { ID: 284, Code: 'ff', Name: 'Fulfulde' },
  { ID: 285, Code: 'dz', Name: 'ཇོང་ཁ' },
  { ID: 286, Code: 'ti', Name: 'ትግርኛ' },
  { ID: 287, Code: 'cr', Name: 'Nehiyaw' },
  { ID: 288, Code: 'din', Name: 'Dinka' },
  { ID: 289, Code: 'ng', Name: 'Oshiwambo' },
  { ID: 290, Code: 'cho', Name: 'Choctaw' },
  { ID: 291, Code: 'kj', Name: 'Kuanyama' },
  { ID: 292, Code: 'mh', Name: 'Ebon' },
  { ID: 293, Code: 'ho', Name: 'Hiri Motu' },
  { ID: 294, Code: 'ii', Name: 'ꆇꉙ' },
  { ID: 295, Code: 'aa', Name: 'Afar' },
  { ID: 296, Code: 'mus', Name: 'Muskogee' },
  { ID: 297, Code: 'hz', Name: 'Otsiherero' },
  { ID: 298, Code: 'kr', Name: 'Kanuri' },
];

export enum Country {
  Country = 0,
  Afghanistan = 1,
  AlandIslands = 2,
  Albania = 3,
  Algeria = 4,
  AmericanSamoa = 5,
  Andorra = 6,
  Angola = 7,
  Anguilla = 8,
  Antarctica = 9,
  AntiguaAndBarbuda = 10,
  Argentina = 11,
  Armenia = 12,
  Aruba = 13,
  Australia = 14,
  Austria = 15,
  Azerbaijan = 16,
  TheBahamas = 17,
  Bahrain = 18,
  Bangladesh = 19,
  Barbados = 20,
  Belarus = 21,
  Belgium = 22,
  Belize = 23,
  Benin = 24,
  Bermuda = 25,
  Bhutan = 26,
  Bolivia = 27,
  BosniaAndHerzegovina = 28,
  Botswana = 29,
  BouvetIsland = 30,
  Brazil = 31,
  BritishIndianOceanTerritory = 32,
  Brunei = 33,
  Bulgaria = 34,
  BurkinaFaso = 35,
  Burundi = 36,
  Cambodia = 37,
  Cameroon = 38,
  Canada = 39,
  CapeVerde = 40,
  CaymanIslands = 41,
  CentralAfricanRepublic = 42,
  Chad = 43,
  Chile = 44,
  China = 45,
  ChristmasIsland = 46,
  CocosKeelingIslands = 47,
  Colombia = 48,
  Comoros = 49,
  Congo = 50,
  DemocraticRepublicOfTheCongo = 51,
  CookIslands = 52,
  CostaRica = 53,
  CoteDIvoire = 54,
  Croatia = 55,
  Cuba = 56,
  Cyprus = 57,
  CzechRepublic = 58,
  Denmark = 59,
  Djibouti = 60,
  Dominica = 61,
  DominicanRepublic = 62,
  TimorLeste = 63,
  Ecuador = 64,
  Egypt = 65,
  ElSalvador = 66,
  EquatorialGuinea = 67,
  Eritrea = 68,
  Estonia = 69,
  Ethiopia = 70,
  FalklandIslands = 71,
  FaroeIslands = 72,
  FijiIslands = 73,
  Finland = 74,
  France = 75,
  FrenchGuiana = 76,
  FrenchPolynesia = 77,
  FrenchSouthernTerritories = 78,
  Gabon = 79,
  GambiaThe = 80,
  Georgia = 81,
  Germany = 82,
  Ghana = 83,
  Gibraltar = 84,
  Greece = 85,
  Greenland = 86,
  Grenada = 87,
  Guadeloupe = 88,
  Guam = 89,
  Guatemala = 90,
  GuernseyAndAlderney = 91,
  Guinea = 92,
  GuineaBissau = 93,
  Guyana = 94,
  Haiti = 95,
  HeardIslandAndMcDonaldIslands = 96,
  Honduras = 97,
  HongKongSAR = 98,
  Hungary = 99,
  Iceland = 100,
  India = 101,
  Indonesia = 102,
  Iran = 103,
  Iraq = 104,
  Ireland = 105,
  Israel = 106,
  Italy = 107,
  Jamaica = 108,
  Japan = 109,
  Jersey = 110,
  Jordan = 111,
  Kazakhstan = 112,
  Kenya = 113,
  Kiribati = 114,
  NorthKorea = 115,
  SouthKorea = 116,
  Kuwait = 117,
  Kyrgyzstan = 118,
  Laos = 119,
  Latvia = 120,
  Lebanon = 121,
  Lesotho = 122,
  Liberia = 123,
  Libya = 124,
  Liechtenstein = 125,
  Lithuania = 126,
  Luxembourg = 127,
  MacauSAR = 128,
  NorthMacedonia = 129,
  Madagascar = 130,
  Malawi = 131,
  Malaysia = 132,
  Maldives = 133,
  Mali = 134,
  Malta = 135,
  IsleOfMan = 136,
  MarshallIslands = 137,
  Martinique = 138,
  Mauritania = 139,
  Mauritius = 140,
  Mayotte = 141,
  Mexico = 142,
  Micronesia = 143,
  Moldova = 144,
  Monaco = 145,
  Mongolia = 146,
  Montenegro = 147,
  Montserrat = 148,
  Morocco = 149,
  Mozambique = 150,
  Myanmar = 151,
  Namibia = 152,
  Nauru = 153,
  Nepal = 154,
  Netherlands = 155,
  NetherlandsAntilles = 156,
  NewCaledonia = 157,
  NewZealand = 158,
  Nicaragua = 159,
  Niger = 160,
  Nigeria = 161,
  Niue = 162,
  NorfolkIsland = 163,
  NorthernMarianaIslands = 164,
  Norway = 165,
  Oman = 166,
  Pakistan = 167,
  Palau = 168,
  PalestinianTerritoryOccupied = 169,
  Panama = 170,
  PapuaNewGuinea = 171,
  Paraguay = 172,
  Peru = 173,
  Philippines = 174,
  PitcairnIsland = 175,
  Poland = 176,
  Portugal = 177,
  PuertoRico = 178,
  Qatar = 179,
  Reunion = 180,
  Romania = 181,
  Russia = 182,
  Rwanda = 183,
  SaintHelena = 184,
  SaintKittsAndNevis = 185,
  SaintLucia = 186,
  SaintPierreAndMiquelon = 187,
  SaintVincentAndTheGrenadines = 188,
  Samoa = 189,
  SanMarino = 190,
  SaoTomeAndPrincipe = 191,
  SaudiArabia = 192,
  Senegal = 193,
  Serbia = 194,
  Seychelles = 195,
  SierraLeone = 196,
  Singapore = 197,
  Slovakia = 198,
  Slovenia = 199,
  SolomonIslands = 200,
  Somalia = 201,
  SouthAfrica = 202,
  SouthGeorgia = 203,
  SouthSudan = 204,
  Spain = 205,
  SriLanka = 206,
  Sudan = 207,
  Suriname = 208,
  SvalbardAndJanMayenIslands = 209,
  Swaziland = 210,
  Sweden = 211,
  Switzerland = 212,
  Syria = 213,
  Taiwan = 214,
  Tajikistan = 215,
  Tanzania = 216,
  Thailand = 217,
  Togo = 218,
  Tokelau = 219,
  Tonga = 220,
  TrinidadAndTobago = 221,
  Tunisia = 222,
  Turkey = 223,
  Turkmenistan = 224,
  TurksAndCaicosIslands = 225,
  Tuvalu = 226,
  Uganda = 227,
  Ukraine = 228,
  UnitedArabEmirates = 229,
  UnitedKingdom = 230,
  UnitedStates = 231,
  UnitedStatesMinorOutlyingIslands = 232,
  Uruguay = 233,
  Uzbekistan = 234,
  Vanuatu = 235,
  VaticanCityStateHolySee = 236,
  Venezuela = 237,
  Vietnam = 238,
  VirginIslandsBritish = 239,
  VirginIslandsUS = 240,
  WallisAndFutunaIslands = 241,
  WesternSahara = 242,
  Yemen = 243,
  Zambia = 244,
  Zimbabwe = 245,
}
