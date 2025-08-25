import { REST } from '../index';
import { Photo, DeletePhotoResponse } from '@yurbajs/types';

export class PhotosResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Photos Core }
  */

  /**
   * Gets a photo by identifier
   * @group Photos Core
   * @param photoId - Photo identifier
   * @returns {Promise<Photo>} {@link Photo} object
   * @example
   * ```javascript
   * const photo = await rest.photos.get('123');
   * ```
   */
  async get(photoId: string): Promise<Photo> {
    return this.client.get<Photo>(`/photos/${photoId}`);
  }

  /**
   * Upload a photo
   * @group Photos Core
   * @param photo - Photo buffer or blob
   * @param caption - Photo caption
   * @param mode - Photo visibility mode
   * @returns {Promise<Photo>} {@link Photo} Uploaded photo
   * @example
   * ```javascript
   * const photo = await rest.photos.upload(buffer, 'My photo', 'public');
   * ```
   */
  async upload(photo: Buffer, caption: string = '', mode: 'public' | 'private' = 'public'): Promise<Photo> {
    const formData = new FormData();
    const blob = new Blob([photo], { type: 'image/png' });
    
    formData.append('photo', blob, `photo-${Date.now()}.png`);
    formData.append('caption', caption);
    formData.append('mode', mode);

    return this.client.uploadFile<Photo>('/photos', formData);
  }

  /**
   * Delete a photo
   * @group Photos Core
   * @param photoId - Photo identifier
   * @returns {Promise<DeletePhotoResponse>} Delete response
   * @example
   * ```javascript
   * await rest.photos.delete(123);
   * ```
   */
  async delete(photoId: number): Promise<DeletePhotoResponse> {
    return this.client.delete<DeletePhotoResponse>(`/photos/${photoId}`);
  }
}