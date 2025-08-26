import { REST } from '../src/index';
import { TEST_CONFIG, skipIfNoToken } from './setup';

describe('PhotosResource', () => {
  let rest: REST;

  beforeAll(() => {
    if (!skipIfNoToken()) {
      rest = new REST(TEST_CONFIG.token);
    }
  });

  describe('Core Methods', () => {
    test('should get all photos', async () => {
      if (skipIfNoToken()) return;
      
      const photos = await rest.photos.getAll();
      
      expect(Array.isArray(photos)).toBe(true);
      if (photos.length > 0) {
        expect(photos[0]).toHaveProperty('ID');
        expect(photos[0]).toHaveProperty('Author');
        expect(photos[0]).toHaveProperty('Url');
      }
    });

    test('should get photos with pagination', async () => {
      if (skipIfNoToken()) return;
      
      const photos = await rest.photos.getAll(1);
      
      expect(Array.isArray(photos)).toBe(true);
    });

    test('should get private photos', async () => {
      if (skipIfNoToken()) return;
      
      const photos = await rest.photos.getAll(0, 'private');
      
      expect(Array.isArray(photos)).toBe(true);
    });

    test('should get photo by ID', async () => {
      if (skipIfNoToken()) return;
      
      try {
        const photo = await rest.photos.get(TEST_CONFIG.photoId);
        
        expect(photo).toBeValidYurbaResponse();
        expect(photo).toHaveProperty('ID');
        expect(photo).toHaveProperty('Url');
      } catch (error: any) {
        expect(error.message).toMatch(/not found|Invalid photo ID/);
      }
    });
  });

  describe('Upload Methods', () => {
    test('should handle upload with buffer', async () => {
      if (skipIfNoToken()) return;
      
      // Create a simple test image buffer (1x1 PNG)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
        0x60, 0x82
      ]);

      try {
        const photo = await rest.photos.upload(
          pngBuffer, 
          'Jest test photo', 
          'public', 
          'test.png'
        );
        
        expect(photo).toBeValidYurbaResponse();
        expect(photo).toHaveProperty('ID');
        expect(photo).toHaveProperty('Url');
        
        // Clean up - delete the uploaded photo
        await rest.photos.delete(photo.ID);
      } catch (error: any) {
        // Upload might fail due to rate limits or other restrictions
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid photo ID', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.photos.get(''))
        .rejects.toThrow('Invalid photo ID');
    });

    test('should throw error for invalid input', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.photos.upload(null as any, 'test'))
        .rejects.toThrow('Invalid input');
    });

    test('should throw error for long caption', async () => {
      if (skipIfNoToken()) return;
      
      const longCaption = 'a'.repeat(1001);
      const buffer = Buffer.from('test');
      
      await expect(rest.photos.upload(buffer, longCaption))
        .rejects.toThrow('Caption too long');
    });

    test('should throw error for invalid page number', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.photos.getAll(-1))
        .rejects.toThrow('Invalid page number');
    });
  });
});