import { REST } from '../index';
import { Video, response } from '@yurbajs/types';
import { readFileSync } from 'fs';

/**
 * @category Resources
 */
export class VideoResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Video Core
   * @namespace
   */

  /**
   * Gets a video by identifier
   * @rest GET /video/{video_id}
   * @group Video Core
   * @param videoId - Video identifier
   * @since 1.0.0
   * @returns {Promise<Video>} {@link Video} object
   * @throws {Error} If video ID is invalid
   * @example
   * ```javascript
   * const video = await rest.video.get(28);
   * ```
   */
  async get(videoId: number): Promise<Video> {
    if (videoId < 1) throw new Error('Invalid video ID');
    return this.client.get<Video>(`/video/${videoId}`);
  }

  /**
   * Gets all videos
   * @rest GET /video
   * @group Video Core
   * @param page - Page number (optional)
   * @since 1.0.0
   * @returns {Promise<Video[]>} Array of {@link Video} objects
   * @throws {Error} If page number is invalid
   * @example
   * ```javascript
   * const videos = await rest.video.getAll();
   * const nextPage = await rest.video.getAll(1);
   * ```
   */
  async getAll(page?: number): Promise<Video[]> {
    if (page !== undefined && page < 0) throw new Error('Invalid page number');
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    
    const query = params.toString();
    return this.client.get<Video[]>(`/video${query ? `?${query}` : ''}`);
  }

  /**
   * Uploads a video
   * @rest POST /video
   * @group Video Core
   * @param input - Path to video file or Buffer
   * @param filename - Custom filename (optional)
   * @since 1.0.0
   * @returns {Promise<Video>} {@link Video} Uploaded video
   * @throws {Error} If input is invalid
   * @example
   * ```javascript
   * const video = await rest.video.upload('/path/to/video.mp4');
   * // or with Buffer
   * const video = await rest.video.upload(buffer, 'video.mkv');
   * ```
   */
  async upload(input: string | Buffer, filename?: string): Promise<Video> {
    if (!input) throw new Error('Invalid input');
    
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
   * Deletes a video
   * @rest DELETE /video/{video_id}
   * @group Video Core
   * @param videoId - Video identifier
   * @since 1.0.0
   * @returns {Promise<response>} {@link response} Delete response
   * @throws {Error} If video ID is invalid
   * @example
   * ```javascript
   * await rest.video.delete(28);
   * ```
   */
  async delete(videoId: number): Promise<response> {
    if (videoId < 1) throw new Error('Invalid video ID');
    return this.client.delete<response>(`/video/${videoId}`);
  }
}