import { REST } from '../index';
import { File, BaseDelete } from '@yurbajs/types';
import { readFileSync } from 'fs';

export class FilesResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /* 
  //               { Files Core }
  */

  /* 
  //               { Files Core }
  */

  /**
   * Gets a file by identifier
   * @group Files Core
   * @param fileId - File identifier
   * @since 1.0.0
   * @returns {Promise<File>} {@link File} object
   * @throws {Error} If file ID is invalid
   * @example
   * ```javascript
   * const file = await rest.files.get(23);
   * ```
   */
  async get(fileId: number): Promise<File> {
    if (fileId < 1) throw new Error('Invalid file ID');
    return this.client.get<File>(`/files/${fileId}`);
  }

  /**
   * Gets all files
   * @group Files Core
   * @param page - Page number (optional)
   * @since 1.0.0
   * @returns {Promise<File[]>} Array of {@link File} objects
   * @throws {Error} If page number is invalid
   * @example
   * ```javascript
   * const files = await rest.files.getAll();
   * const nextPage = await rest.files.getAll(1);
   * ```
   */
  async getAll(page?: number): Promise<File[]> {
    if (page !== undefined && page < 0) throw new Error('Invalid page number');
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    
    const query = params.toString();
    return this.client.get<File[]>(`/files${query ? `?${query}` : ''}`);
  }

  /**
   * Uploads a file
   * @group Files Core
   * @param input - Path to file or Buffer
   * @param filename - Custom filename (optional)
   * @since 1.0.0
   * @returns {Promise<File>} {@link File} Uploaded file
   * @throws {Error} If input is invalid
   * @example
   * ```javascript
   * const file = await rest.files.upload('/path/to/file.txt');
   * // or with Buffer
   * const file = await rest.files.upload(buffer, 'document.pdf');
   * ```
   */
  async upload(input: string | Buffer, filename?: string): Promise<File> {
    if (!input) throw new Error('Invalid input');
    
    let buffer: Buffer;
    let name: string;
    
    if (typeof input === 'string') {
      buffer = readFileSync(input);
      name = filename || input.split('/').pop() || 'file';
    } else {
      buffer = input;
      name = filename || 'file';
    }
    
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)]);
    
    formData.append('file', blob, name);

    return this.client.uploadFile<File>('/files', formData);
  }

  /**
   * Deletes a file
   * @group Files Core
   * @param fileId - File identifier
   * @since 1.0.0
   * @returns {Promise<BaseDelete>} {@link BaseDelete} Delete response
   * @throws {Error} If file ID is invalid
   * @example
   * ```javascript
   * await rest.files.delete(14);
   * ```
   */
  async delete(fileId: number): Promise<BaseDelete> {
    if (fileId < 1) throw new Error('Invalid file ID');
    return this.client.delete<BaseDelete>(`/files/${fileId}`);
  }
}