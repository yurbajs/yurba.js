import { REST } from '../index';
import {
  Track,
  Playlist,
  PlaylistPayload,
  BaseOkay,
  DeletePlaylistResponse,
  EditPlaylistResponse,
  DeleteTrackResponse,
} from '@yurbajs/types';

export class MusebaseResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Tracks }
  */

  /**
   * Gets a track by identifier
   * @group Tracks
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<Track>} {@link Track} object
   * @example
   * ```javascript
   * const track = await rest.musebase.getTrack(123);
   * ```
   */
  async getTrack(trackId: number): Promise<Track> {
    return this.client.get<Track>(`/musebase/${trackId}`);
  }

  /* 
  //               { Playlists }
  */

  /**
   * Creates a new playlist
   * @group Playlists
   * @param name - Playlist name
   * @param release - Release information
   * @param description - Playlist description
   * @param cover - Cover photo ID
   * @since 1.0.0
   * @returns {Promise<Playlist>} {@link Playlist} Created playlist
   * @example
   * ```javascript
   * const playlist = await rest.musebase.createPlaylist('My Playlist', '2024', 'Description', 123);
   * ```
   */
  async createPlaylist(name: string, release: string, description: string, cover: number): Promise<Playlist> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.post<Playlist>('/musebase/playlists', playlistData);
  }

  /**
   * Gets a playlist by identifier
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @since 1.0.0
   * @returns {Promise<Playlist>} {@link Playlist} object
   * @example
   * ```javascript
   * const playlist = await rest.musebase.getPlaylist(123);
   * ```
   */
  async getPlaylist(playlistId: number): Promise<Playlist> {
    return this.client.get<Playlist>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Gets user playlists by tag
   * @group Playlists
   * @param tag - User tag
   * @since 1.0.0
   * @returns {Promise<Playlist[]>} Array of {@link Playlist} objects
   * @example
   * ```javascript
   * const playlists = await rest.musebase.getUserPlaylists('username');
   * ```
   */
  async getUserPlaylists(tag: string): Promise<Playlist[]> {
    return this.client.get<Playlist[]>(`/user/${tag}/playlists`);
  }

  /**
   * Updates a playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @param name - Playlist name
   * @param release - Release information
   * @param description - Playlist description
   * @param cover - Cover photo ID
   * @since 1.0.0
   * @returns {Promise<EditPlaylistResponse>} Update response
   * @example
   * ```javascript
   * await rest.musebase.updatePlaylist(123, 'Updated Name', '2024', 'New description', 456);
   * ```
   */
  async updatePlaylist(playlistId: number, name: string, release: string, description: string, cover: number): Promise<EditPlaylistResponse> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.patch<EditPlaylistResponse>(`/musebase/playlists/${playlistId}`, playlistData);
  }

  /**
   * Deletes a playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @since 1.0.0
   * @returns {Promise<DeletePlaylistResponse>} Delete response
   * @example
   * ```javascript
   * await rest.musebase.deletePlaylist(123);
   * ```
   */
  async deletePlaylist(playlistId: number): Promise<DeletePlaylistResponse> {
    return this.client.delete<DeletePlaylistResponse>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Adds a track to playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} Operation result
   * @example
   * ```javascript
   * await rest.musebase.addTrackToPlaylist(123, 456);
   * ```
   */
  async addTrackToPlaylist(playlistId: number, trackId: number): Promise<BaseOkay> {
    return this.client.post<BaseOkay>(`/musebase/playlists/${playlistId}/tracks/${trackId}`, {});
  }

  /**
   * Removes a track from playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<DeleteTrackResponse>} Delete response
   * @example
   * ```javascript
   * await rest.musebase.removeTrackFromPlaylist(123, 456);
   * ```
   */
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<DeleteTrackResponse> {
    return this.client.delete<DeleteTrackResponse>(`/musebase/playlists/${playlistId}/tracks/${trackId}`);
  }
}