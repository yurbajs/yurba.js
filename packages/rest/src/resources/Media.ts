import { REST } from '../BaseClient';
import {
  Photo,
  Track,
  Playlist,
  DeletePhotoResponse,
  PlaylistPayload,
  BaseOkay,
  DeletePlaylistResponse,
  EditPlaylistResponse,
  DeleteTrackResponse
} from '@yurbajs/types';

/**
 * Resource for working with media
 */
export class MediaResource {
  private client: REST;

  /**
   * Creates a new resource for working with media
   * @param client REST client
   */
  constructor(client: REST) {
    this.client = client;
  }

  /**
   * Get photo by ID
   * @param photoId Photo ID
   * @returns Photo data
   */
  async getPhoto(photoId: string): Promise<Photo> {
    return this.client.get<Photo>(`/photos/${photoId}`);
  }

  /**
   * Add a new photo
   * @param photo Binary photo data
   * @param caption Photo caption
   * @param mode Photo visibility mode
   * @returns Photo data
   */
  async addPhoto(photo: Blob, caption: string, mode: 'public' | 'private' = 'public'): Promise<Photo> {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('caption', caption);
    formData.append('mode', mode);
    
    return this.client.post<Photo>('/photos', formData);
  }

  /**
   * Delete photo
   * @param photoId Photo ID
   * @returns Deletion result
   */
  async deletePhoto(photoId: number): Promise<DeletePhotoResponse> {
    return this.client.delete<DeletePhotoResponse>(`/photos/${photoId}`);
  }

  /**
   * Get track by ID
   * @param trackId Track ID
   * @returns Track data
   */
  async getTrack(trackId: number): Promise<Track> {
    return this.client.get<Track>(`/musebase/${trackId}`);
  }

  /**
   * Create playlist
   * @param name Playlist name
   * @param release Release date
   * @param description Playlist description
   * @param cover Cover ID
   * @returns Created playlist
   */
  async createPlaylist(name: string, release: string, description: string, cover: number): Promise<Playlist> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.post<Playlist>('/musebase/playlists', playlistData);
  }

  /**
   * Delete playlist
   * @param playlistId Playlist ID
   * @returns Deletion result
   */
  async deletePlaylist(playlistId: number): Promise<DeletePlaylistResponse> {
    return this.client.delete<DeletePlaylistResponse>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Update playlist
   * @param playlistId Playlist ID
   * @param name Playlist name
   * @param release Release date
   * @param description Playlist description
   * @param cover Cover ID
   * @returns Updated playlist
   */
  async updatePlaylist(
    playlistId: number,
    name: string,
    release: string,
    description: string,
    cover: number
  ): Promise<EditPlaylistResponse> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.patch<EditPlaylistResponse>(`/musebase/playlists/${playlistId}`, playlistData);
  }

  /**
   * Add track to playlist
   * @param playlistId Playlist ID
   * @param trackId Track ID
   * @returns Addition result
   */
  async addTrackToPlaylist(playlistId: number, trackId: number): Promise<BaseOkay> {
    return this.client.post<BaseOkay>(`/musebase/playlists/${playlistId}/tracks/${trackId}`, {});
  }

  /**
   * Remove track from playlist
   * @param playlistId Playlist ID
   * @param trackId Track ID
   * @returns Removal result
   */
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<DeleteTrackResponse> {
    return this.client.delete<DeleteTrackResponse>(`/musebase/playlists/${playlistId}/tracks/${trackId}`);
  }

  /**
   * Get playlist by ID
   * @param playlistId Playlist ID
   * @returns Playlist data
   */
  async getPlaylist(playlistId: number): Promise<Playlist> {
    return this.client.get<Playlist>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Get user playlists
   * @param tag User tag
   * @returns List of playlists
   */
  async getUserPlaylists(tag: string): Promise<Playlist[]> {
    return this.client.get<Playlist[]>(`/user/${tag}/playlists`);
  }
}
