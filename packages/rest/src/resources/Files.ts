import { REST } from '../index';
import { File, BaseDelete } from '@yurbajs/types';
import { prepareFile } from '../utils/file';

export class FilesResource {
  /**
   * @ignore
   */
  constructor(private client: REST) {}

  /**
   * Files Core
   * @namespace
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
   * Uploads a file from Blob, File, Buffer, or file path (Node.js only)
   * @group Files Core
   * @param file - File, Blob, Buffer, or file path (string)
   * @param filename - Custom filename (required for Buffer/Blob, optional for path)
   * @since 1.0.0
   * @returns {Promise<File>} {@link File} Uploaded file
   * @throws {Error} If input is invalid
   * @example
   * ```javascript
   * // Browser: Upload File from input
   * const fileInput = document.querySelector('input[type="file"]');
   * const file = await rest.files.upload(fileInput.files[0]);
   * 
   * // Browser: Upload Blob
   * const blob = new Blob(['content'], { type: 'text/plain' });
   * const file = await rest.files.upload(blob, 'document.txt');
   * 
   * // Node.js: Upload Buffer
   * const buffer = Buffer.from('content');
   * const file = await rest.files.upload(buffer, 'document.txt');
   * 
   * // Node.js: Upload from file path
   * const file = await rest.files.upload('./document.pdf');
   * ```
   */
  async upload(file: Blob | Buffer | string, filename?: string): Promise<File> {
    const prepared = await prepareFile(file, filename);
    const formData = new FormData();
    formData.append('file', prepared.data, prepared.filename);
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