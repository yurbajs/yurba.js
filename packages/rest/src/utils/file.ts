/**
 * Universal file handling utility
 * Works in Node.js, Browser, and Edge Runtime
 * @category Utilities
 */

export interface FileInput {
  data: Blob;
  filename: string;
  mimeType?: string;
}

/**
 * Converts various file inputs to Blob with filename
 * @param input - File path (Node.js), Blob, File, or Buffer
 * @param filename - Custom filename (required for Buffer/Blob without name)
 * @returns FileInput object with Blob and filename
 */
export async function prepareFile(
  input: string | Blob | Buffer,
  filename?: string,
): Promise<FileInput> {
  // Handle file path (Node.js only)
  if (typeof input === 'string') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const buffer = fs.readFileSync(input);
      const name = filename || path.basename(input);
      const ext = path.extname(name).toLowerCase();

      return {
        data: new Blob([new Uint8Array(buffer)]),
        filename: name,
        mimeType: getMimeType(ext),
      };
    } catch (error) {
      throw new Error(`Failed to read file from path: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Handle Blob/File (Browser)
  if (input instanceof Blob) {
    const name = filename || (input as any).name || 'file';
    const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')).toLowerCase() : '';

    return {
      data: input,
      filename: name,
      mimeType: input.type || getMimeType(ext),
    };
  }

  // Handle Buffer (Node.js)
  if (Buffer.isBuffer(input)) {
    if (!filename) {
      throw new Error('Filename is required for Buffer upload');
    }
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';

    return {
      data: new Blob([new Uint8Array(input)]),
      filename,
      mimeType: getMimeType(ext),
    };
  }

  throw new Error('Invalid file type. Expected Blob, File, Buffer, or file path string');
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',

    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',

    // Video
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',

    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.xml': 'application/xml',

    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
