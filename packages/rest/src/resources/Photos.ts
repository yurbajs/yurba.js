import { REST } from '../index';
import { Photo, DeletePhotoResponse } from '@yurbajs/types';
import { readFileSync } from 'fs';
import { extname } from 'path';

export class PhotosResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Photos Core
   * @namespace
   */

  /**
   * Gets all photos (up to 12 per page)
   * @group Photos Core
   * @param page - Page number (optional)
   * @param mode - Set to 'private' for private photos (optional)
   * @since 1.0.0
   * @returns {Promise<Photo[]>} Array of {@link Photo} objects
   * @throws {Error} If page number is invalid
   * @example
   * ```javascript
   * const photos = await rest.photos.getAll(2);
   * const privatePhotos = await rest.photos.getAll(0, 'private');
   * ```
   */
  async getAll(page?: number, mode?: 'private'): Promise<Photo[]> {
    if (page !== undefined && page < 0) throw new Error('Invalid page number');
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (mode === 'private') params.append('mode', 'private');
    
    const query = params.toString();
    return this.client.get<Photo[]>(`/photos${query ? `?${query}` : ''}`);
  }

  /**
   * Gets a photo by identifier
   * @group Photos Core
   * @param photoId - Photo identifier
   * @since 1.0.0
   * @returns {Promise<Photo>} {@link Photo} object
   * @throws {Error} If photo ID is invalid
   * @example
   * ```javascript
   * const photo = await rest.photos.get('123');
   * ```
   */
  async get(photoId: string): Promise<Photo> {
    if (!photoId) throw new Error('Invalid photo ID');
    return this.client.get<Photo>(`/photos/${photoId}`);
  }

  /**
   * Uploads a photo
   * @group Photos Core
   * @param input - Path to photo file or Buffer
   * @param caption - Photo caption
   * @param mode - Photo visibility mode
   * @param filename - Custom filename (optional)
   * @since 1.0.0
   * @returns {Promise<Photo>} {@link Photo} Uploaded photo
   * @throws {Error} If input is invalid or caption is too long
   * @example
   * ```javascript
   * const photo = await rest.photos.upload('/path/to/photo.jpg', 'My photo', 'public');
   * // or with Buffer
   * const photo = await rest.photos.upload(buffer, 'My photo', 'public', 'image.png');
   * ```
   */
  async upload(input: string | Buffer, caption: string = '', mode: 'public' | 'private' = 'public', filename?: string): Promise<Photo> {
    if (!input) throw new Error('Invalid input');
    if (caption.length > 1000) throw new Error('Caption too long');
    
    let buffer: Buffer;
    let ext: string;
    
    if (typeof input === 'string') {
      buffer = readFileSync(input);
      ext = extname(input).toLowerCase();
    } else {
      buffer = input;
      ext = filename ? extname(filename).toLowerCase() : '.png';
    }
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.svg': 'image/svg+xml'
    };
    
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    
    formData.append('photo', blob, filename || `photo-${Date.now()}${ext}`);
    formData.append('caption', caption);
    formData.append('mode', mode);

    return this.client.uploadFile<Photo>('/photos', formData);
  }

  /**
   * Deletes a photo
   * @group Photos Core
   * @param photoId - Photo identifier
   * @since 1.0.0
   * @returns {Promise<DeletePhotoResponse>} {@link DeletePhotoResponse} Delete response
   * @throws {Error} If photo ID is invalid
   * @example
   * ```javascript
   * await rest.photos.delete(123);
   * ```
   */
  async delete(photoId: number): Promise<DeletePhotoResponse> {
    if (photoId < 1) throw new Error('Invalid photo ID');
    return this.client.delete<DeletePhotoResponse>(`/photos/${photoId}`);
  }
}