
export interface ApiHeaders {
    [key: string]: string;
    Accept: string;
    token: string;
  }
  
  export interface PostData {
    content: string;
    photos_list?: any[];
    language?: number;
    nsfw?: number;
    edit?: number;
    repost?: number;
  }
  
  export interface CommentData {
    content: string;
    photos_list?: any[];
  }
  
  export interface PlaylistData {
    name: string;
    release: string;
    description: string;
    cover: number;
  }
  
  export interface TrackData {
    name: string;
    author: string;
    release: string;
    cover?: number;
    mode?: string;
  }
  
  export interface PageData {
    name: string;
    url: string;
    icon: string;
  }
  
  export interface AppData {
    name: string;
    redirectUrl: string;
  }