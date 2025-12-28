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

  /**
   * Tracks
   * @namespace
   */

  /**
   * Gets a track by identifier
   * @group Tracks
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<Track>} {@link Track} object
   * @throws {Error} If track ID is invalid
   * @example
   * ```javascript
   * const track = await rest.musebase.getTrack(123);
   * ```
   */
  async getTrack(trackId: number): Promise<Track> {
    if (trackId < 1) throw new Error('Invalid track ID');
    return this.client.get<Track>(`/musebase/${trackId}`);
  }

  /**
   * Playlists
   * @namespace
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
   * @throws {Error} If playlist data is invalid
   * @example
   * ```javascript
   * const playlist = await rest.musebase.createPlaylist('My Playlist', '2024', 'Description', 123);
   * ```
   */
  async createPlaylist(name: string, release: string, description: string, cover: number): Promise<Playlist> {
    if (!name || name.length > 100) throw new Error('Invalid playlist name');
    if (cover < 1) throw new Error('Invalid cover photo ID');
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.post<Playlist>('/musebase/playlists', playlistData);
  }

  /**
   * Gets a playlist by identifier
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @since 1.0.0
   * @returns {Promise<Playlist>} {@link Playlist} object
   * @throws {Error} If playlist ID is invalid
   * @example
   * ```javascript
   * const playlist = await rest.musebase.getPlaylist(123);
   * ```
   */
  async getPlaylist(playlistId: number): Promise<Playlist> {
    if (playlistId < 1) throw new Error('Invalid playlist ID');
    return this.client.get<Playlist>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Gets user playlists by tag
   * @group Playlists
   * @param tag - User tag
   * @since 1.0.0
   * @returns {Promise<Playlist[]>} Array of {@link Playlist} objects
   * @throws {Error} If tag is invalid
   * @example
   * ```javascript
   * const playlists = await rest.musebase.getUserPlaylists('username');
   * ```
   */
  async getUserPlaylists(tag: string): Promise<Playlist[]> {
    if (!tag || tag.length > 255) throw new Error('Invalid tag');
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
   * @returns {Promise<EditPlaylistResponse>} {@link EditPlaylistResponse} Update response
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.musebase.updatePlaylist(123, 'Updated Name', '2024', 'New description', 456);
   * ```
   */
  async updatePlaylist(playlistId: number, name: string, release: string, description: string, cover: number): Promise<EditPlaylistResponse> {
    if (playlistId < 1) throw new Error('Invalid playlist ID');
    if (!name || name.length > 100) throw new Error('Invalid playlist name');
    if (cover < 1) throw new Error('Invalid cover photo ID');
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.patch<EditPlaylistResponse>(`/musebase/playlists/${playlistId}`, playlistData);
  }

  /**
   * Deletes a playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @since 1.0.0
   * @returns {Promise<DeletePlaylistResponse>} {@link DeletePlaylistResponse} Delete response
   * @throws {Error} If playlist ID is invalid
   * @example
   * ```javascript
   * await rest.musebase.deletePlaylist(123);
   * ```
   */
  async deletePlaylist(playlistId: number): Promise<DeletePlaylistResponse> {
    if (playlistId < 1) throw new Error('Invalid playlist ID');
    return this.client.delete<DeletePlaylistResponse>(`/musebase/playlists/${playlistId}`);
  }

  /**
   * Adds a track to playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<BaseOkay>} {@link BaseOkay} Operation result
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.musebase.addTrackToPlaylist(123, 456);
   * ```
   */
  async addTrackToPlaylist(playlistId: number, trackId: number): Promise<BaseOkay> {
    if (playlistId < 1 || trackId < 1) throw new Error('Invalid parameters');
    return this.client.post<BaseOkay>(`/musebase/playlists/${playlistId}/tracks/${trackId}`, {});
  }

  /**
   * Removes a track from playlist
   * @group Playlists
   * @param playlistId - Playlist identifier
   * @param trackId - Track identifier
   * @since 1.0.0
   * @returns {Promise<DeleteTrackResponse>} {@link DeleteTrackResponse} Delete response
   * @throws {Error} If parameters are invalid
   * @example
   * ```javascript
   * await rest.musebase.removeTrackFromPlaylist(123, 456);
   * ```
   */
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<DeleteTrackResponse> {
    if (playlistId < 1 || trackId < 1) throw new Error('Invalid parameters');
    return this.client.delete<DeleteTrackResponse>(`/musebase/playlists/${playlistId}/tracks/${trackId}`);
  }

  /**
   * Find tracks
   * @group Tracks
   * @param query - Song name or artist
   * @param page - Page number (optional)
   * @since 1.0.0
   * @returns {Promise<Track[]>} Track list
   * @deprecated Use rest.search.tracks() instead
   * @example
   * ```javascript
   * // Use rest.search.tracks() instead
   * const tracks = await rest.search.tracks('Bohemian Rhapsody');
   * ```
   */
  async find(query: string, page?: number): Promise<Track[]> {
    return this.client.search.tracks(query, page);
  }
}