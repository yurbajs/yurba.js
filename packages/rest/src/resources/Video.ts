import { REST } from '../index';
import { Video, response } from '@yurbajs/types';
import { readFileSync } from 'fs';

export class VideoResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Video Core }
  */

  /**
   * Gets a video by identifier
   * @group Video Core
   * @param videoId - Video identifier
   * @since 1.0.0
   * @returns {Promise<Video>} {@link Video} object
   * @example
   * ```javascript
   * const video = await rest.video.get(28);
   * ```
   */
  async get(videoId: number): Promise<Video> {
    return this.client.get<Video>(`/video/${videoId}`);
  }

  /**
   * Gets all videos
   * @group Video Core
   * @param page - Page number (optional)
   * @since 1.0.0
   * @returns {Promise<Video[]>} Array of {@link Video} objects
   * @example
   * ```javascript
   * const videos = await rest.video.getAll();
   * const nextPage = await rest.video.getAll(1);
   * ```
   */
  async getAll(page?: number): Promise<Video[]> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    
    const query = params.toString();
    return this.client.get<Video[]>(`/video${query ? `?${query}` : ''}`);
  }

  /**
   * Upload a video
   * @group Video Core
   * @param input - Path to video file or Buffer
   * @param filename - Custom filename (optional)
   * @since 1.0.0
   * @returns {Promise<Video>} {@link Video} Uploaded video
   * @example
   * ```javascript
   * const video = await rest.video.upload('/path/to/video.mp4');
   * // or with Buffer
   * const video = await rest.video.upload(buffer, 'video.mkv');
   * ```
   */
  async upload(input: string | Buffer, filename?: string): Promise<Video> {
    let buffer: Buffer;
    let name: string;
    
    if (typeof input === 'string') {
      buffer = readFileSync(input);
      name = filename || input.split('/').pop() || 'video';
    } else {
      buffer = input;
      name = filename || 'video';
    }
    
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)]);
    
    formData.append('file', blob, name);

    return this.client.uploadFile<Video>('/video', formData);
  }

  /**
   * Delete a video
   * @group Video Core
   * @param videoId - Video identifier
   * @since 1.0.0
   * @returns {Promise<response>} Delete response
   * @example
   * ```javascript
   * await rest.video.delete(28);
   * ```
   */
  async delete(videoId: number): Promise<response> {
    return this.client.delete<response>(`/video/${videoId}`);
  }
}