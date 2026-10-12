import { REST } from '../src/index';
import { TEST_CONFIG, installFetchMock, mockFetchRoutes } from './setup';

const photo = {
  ID: Number(TEST_CONFIG.photoId),
  Author: { ID: 1111, Name: 'Test' },
  Url: 'https://cdn.example/photo.png',
};

describe('PhotosResource', () => {
  let rest: REST;

  beforeEach(() => {
    installFetchMock();
    rest = new REST().setToken('y.test-token-1234567890');
  });

  describe('Core Methods', () => {
    test('should get all photos', async () => {
      mockFetchRoutes([{ method: 'GET', match: '/photos', body: [photo] }]);

      const photos = await rest.photos.getAll();

      expect(Array.isArray(photos)).toBe(true);
      if (photos.length > 0) {
        expect(photos[0]).toHaveProperty('ID');
        expect(photos[0]).toHaveProperty('Author');
        expect(photos[0]).toHaveProperty('Url');
      }
    });

    test('should get photos with pagination', async () => {
      mockFetchRoutes([{ method: 'GET', match: '/photos', body: [photo] }]);

      const photos = await rest.photos.getAll(1);

      expect(Array.isArray(photos)).toBe(true);
    });

    test('should get private photos', async () => {
      mockFetchRoutes([{ method: 'GET', match: '/photos', body: [photo] }]);

      const photos = await rest.photos.getAll(0, 'private');

      expect(Array.isArray(photos)).toBe(true);
    });

    test('should get photo by ID', async () => {
      mockFetchRoutes([{ method: 'GET', match: `/photos/${TEST_CONFIG.photoId}`, body: photo }]);

      const result = await rest.photos.get(TEST_CONFIG.photoId);

      expect(result).toBeValidYurbaResponse();
      expect(result).toHaveProperty('ID');
      expect(result).toHaveProperty('Url');
    });
  });

  describe('Upload Methods', () => {
    test('should handle upload with buffer', async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
        0x60, 0x82,
      ]);

      mockFetchRoutes([
        { method: 'POST', match: '/photos', body: photo },
        { method: 'DELETE', match: `/photos/${photo.ID}`, body: { ok: true } },
      ]);

      const uploaded = await rest.photos.upload(
        pngBuffer,
        'Jest test photo',
        'public',
        'test.png',
      );

      expect(uploaded).toBeValidYurbaResponse();
      expect(uploaded).toHaveProperty('ID');
      expect(uploaded).toHaveProperty('Url');

      await rest.photos.delete(uploaded.ID);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid photo ID', async () => {
      await expect(rest.photos.get(''))
        .rejects.toThrow('Invalid photo ID');
    });

    test('should throw error for invalid input', async () => {
      await expect(rest.photos.upload(null as any, 'test'))
        .rejects.toThrow('Invalid file type');
    });

    test('should throw error for long caption', async () => {
      const longCaption = 'a'.repeat(1001);
      const buffer = Buffer.from('test');

      await expect(rest.photos.upload(buffer, longCaption))
        .rejects.toThrow('Caption too long');
    });

    test('should throw error for invalid page number', async () => {
      await expect(rest.photos.getAll(-1))
        .rejects.toThrow('Invalid page number');
    });
  });
});
