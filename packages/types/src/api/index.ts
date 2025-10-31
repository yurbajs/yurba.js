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
    photos_list?: Photo['ID'][] | null;
    replyTo?:     Message['ID'] | null;
    edit?:        Message['ID'] | null;
    attachments?: AttachmentPayload[] | null;
}

export type DeleteMessageResponse = BaseDelete;
export type EditMessageResponse = Message;
export type SendMessageResponse = Message;

export type MessageType = 'join' | 'leave' | 'message' | 'post_on_wall' | 'post_like' | 'comment_post' | ''

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
    Nsfw:          boolean; // Spoiler
}

export interface GetPostPayload {
    lastId?: number;
    lang?: number | Language;
    feed?: boolean;
}


export interface CreatePostPayload {
    content:     string | '';
    photos_list: Photo['ID'][] | [];
    language:    Language | null;
    nsfw:        boolean | false;
    edit:        Post['ID'] | null;
    repost:      Post['ID'] | null;
    timestamp:   number | 0;
    attachments: AttachmentPayload[] | [];
}

export interface Likes {
    IsLikedByYou: boolean;
    Likes:        number;
}

export type DeletePostResponse = BaseDelete;
export type EditPostResponse = Post;
export type CreatePostResponse = Post;

// -------- COMMENTS TYPES -------
export interface Comment {
    ID:        number;
    Author:    Author;
    Content:   string;
    Photos:    number[];
    Timestamp: number;
    Likes:     Likes;
    Post:      Post;
}

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

export interface FindDialogPayload {
    sort:    number | Sort; // 0 - byRealative, 1 - byPopularity, 2 - byAlphabet
    type:    number | FDType; // 0 - none, 1 - group, 2 - channel
    country: number | Country; // 0 - none, 
    topic:   number | FDTopic; // 0 - none, 1
}

export enum FDType {
  NotSelected       = 0,
  Group             = 1,
  Channel           = 2,
}

export enum FDTopic {
  NotSelected       = 0,
  Education         = 1,
  Hobbies           = 2,
  Work              = 3,
  SocietyCulture    = 4,
  TechScience       = 5,
  Entertainment     = 6,
  HealthLifestyle   = 7,
  Travel            = 8,
  BusinessFinance   = 9,
  LocalCommunities  = 10,
  PersonalBlog      = 11,
}

export interface CreateDialogPayload {
    name:        string;
    description?: string;
    type:        DialogCreateType;
}

export interface UpdateDialogPayload {
    name?: string;
    description?: string; 
    avatar?: Photo['ID'];
    topic?: number;
    private?: boolean;
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
// Short model user
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
    Country:           number | Country;    // Country ID
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

export interface RelationshipsResult {
    RelationshipState:   RelationshipState;
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
export type GiftItem = Gift


export interface Shop {
    ID:          number;
    Name:        string;
    Description: string;
    Items:       Item[];
}

export interface Gift {
    ID:        number;
    User:      User;
    Target:    User;
    Item:      ShopItem;
    Timestamp: number;
}

export interface ShopItem {
    ID:          number;
    Name:        string;
    Description: string;
    Category:    number;
    Cost:        number;
    Sub:         number;
    Type:        ShopItemType;
    Animated:    number;
}

export enum ShopItemType {
    Gift = "gift",
    Sub = "sub",
}

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


// ------- Account Types ------

export interface Login {
    id:    number;
    ok:    number;
    token: string;
}


export interface Token {
    Token:     string;
    LastBeen:  number;
    Timestamp: number;
    Device:    string;
    User:      number;
    Online:    boolean;
    IP:        null;
}



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
  Married = 4
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

// -------- GIFT TYPES --------
export interface Gift {
    ID:        number;
    User:      User;
    Target:    User;
    Item:      ShopItem;
    Timestamp: number;
}

export interface Item {
    ID:          number;
    Name:        string;
    Description: string;
    Category:    number;
    Cost:        number;
    Sub:         number;
    Type:        Type;
    Animated:    number;
}

export interface Shop {
    ID:          number;
    Name:        string;
    Description: string;
    Items:       Item[];
}

export enum Type {
    Gift = "gift",
    Sub = "sub",
}

// -------- APP TYPES --------
export interface App {
    ID:          number;
    Name:        string;
    PublicKey:   string;
    SecretKey:   string;
    RedirectUrl: string;
    Timestamp:   number;
}

export interface AppToken {
    Token:     string;
    App:       App;
    User:      number;
    LastBeen:  number;
    Timestamp: number;
    IP:        string;
}

export interface CreateAppPayload {
    name:        string;
    redirectUrl: string;
}

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



// OTHER!!!!

export interface Regions {
    ID:      number;
    Country: number;
    Name:    string;
}


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


