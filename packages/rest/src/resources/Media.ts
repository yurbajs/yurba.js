import { REST } from '../index';
import {
  Photo,
  Track,
  Playlist,
  DeletePhotoResponse,
  PlaylistPayload,
  BaseOkay,
  DeletePlaylistResponse,
  EditPlaylistResponse,
  DeleteTrackResponse,
} from '@yurbajs/types';

export class MediaResource {
  /**
   * @internal
   */
  constructor(private client: REST) {}

  async getPhoto(photoId: string): Promise<Photo> {
    return this.client.get<Photo>(`/photos/${photoId}`);
  }

  async addPhoto(photo: Blob | Buffer, caption: string = '', mode: 'public' | 'private' = 'public'): Promise<Photo> {
    const formData = new FormData();
    const blob = photo instanceof Blob ? photo : new Blob([photo], { type: "image/png" });
    
    formData.append('photo', blob, "card.png");
    formData.append('caption', caption);
    formData.append('mode', mode);

    return this.client.uploadFile<Photo>('/photos', formData);
  }

  async deletePhoto(photoId: number): Promise<DeletePhotoResponse> {
    return this.client.delete<DeletePhotoResponse>(`/photos/${photoId}`);
  }

  async getTrack(trackId: number): Promise<Track> {
    return this.client.get<Track>(`/musebase/${trackId}`);
  }

  async createPlaylist(name: string, release: string, description: string, cover: number): Promise<Playlist> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.post<Playlist>('/musebase/playlists', playlistData);
  }

  async deletePlaylist(playlistId: number): Promise<DeletePlaylistResponse> {
    return this.client.delete<DeletePlaylistResponse>(`/musebase/playlists/${playlistId}`);
  }

  async updatePlaylist(playlistId: number, name: string, release: string, description: string, cover: number): Promise<EditPlaylistResponse> {
    const playlistData: PlaylistPayload = { name, release, description, cover };
    return this.client.patch<EditPlaylistResponse>(`/musebase/playlists/${playlistId}`, playlistData);
  }

  async addTrackToPlaylist(playlistId: number, trackId: number): Promise<BaseOkay> {
    return this.client.post<BaseOkay>(`/musebase/playlists/${playlistId}/tracks/${trackId}`, {});
  }

  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<DeleteTrackResponse> {
    return this.client.delete<DeleteTrackResponse>(`/musebase/playlists/${playlistId}/tracks/${trackId}`);
  }

  async getPlaylist(playlistId: number): Promise<Playlist> {
    return this.client.get<Playlist>(`/musebase/playlists/${playlistId}`);
  }

  async getUserPlaylists(tag: string): Promise<Playlist[]> {
    return this.client.get<Playlist[]>(`/user/${tag}/playlists`);
  }
}