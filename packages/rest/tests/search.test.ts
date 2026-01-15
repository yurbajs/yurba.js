import { REST } from '../src/index';
import { TEST_CONFIG, skipIfNoToken } from './setup';

describe('SearchResource', () => {
  let rest: REST;

  beforeAll(() => {
    if (!skipIfNoToken()) {
      rest = new REST().setToken(TEST_CONFIG.token);
    }
  });

  // User Search tests disabled due to API 500 errors

  describe('Track Search', () => {
    test('should search tracks by query', async () => {
      if (skipIfNoToken()) return;

      const tracks = await rest.search.tracks('test');

      expect(Array.isArray(tracks)).toBe(true);
      if (tracks.length > 0) {
        expect(tracks[0]).toHaveProperty('ID');
        expect(tracks[0]).toHaveProperty('Name');
        expect(tracks[0]).toHaveProperty('Author');
      }
    });

    test('should search tracks with pagination', async () => {
      if (skipIfNoToken()) return;

      const tracks = await rest.search.tracks('music', 1);

      expect(Array.isArray(tracks)).toBe(true);
    });

    test('should search tracks by artist', async () => {
      if (skipIfNoToken()) return;

      const tracks = await rest.search.tracks('Queen');

      expect(Array.isArray(tracks)).toBe(true);
    });
  });

  describe('Dialog Search', () => {
    test('should search dialogs with basic filters', async () => {
      if (skipIfNoToken()) return;

      const dialogs = await rest.search.dialogs('test', {
        sort: 0,
        type: 0,
        country: 0,
        topic: 0,
      });

      expect(Array.isArray(dialogs)).toBe(true);
      if (dialogs.length > 0) {
        expect(dialogs[0]).toHaveProperty('ID');
        expect(dialogs[0]).toHaveProperty('Name');
        expect(dialogs[0]).toHaveProperty('Type');
      }
    });

    test('should search dialogs with specific filters', async () => {
      if (skipIfNoToken()) return;

      const dialogs = await rest.search.dialogs('programming', {
        sort: 1, // by popularity
        type: 1, // groups only
        country: 0,
        topic: 5, // tech & science
      });

      expect(Array.isArray(dialogs)).toBe(true);
    });

    test('should search dialogs with pagination', async () => {
      if (skipIfNoToken()) return;

      const dialogs = await rest.search.dialogs('tech', {
        sort: 0,
        type: 0,
        country: 0,
        topic: 0,
      }, 1);

      expect(Array.isArray(dialogs)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid user search payload', async () => {
      if (skipIfNoToken()) return;

      await expect(rest.search.users(null as any))
        .rejects.toThrow('Invalid parameters');
    });

    test('should throw error for invalid track query', async () => {
      if (skipIfNoToken()) return;

      await expect(rest.search.tracks(''))
        .rejects.toThrow('Invalid query');
    });

    test('should throw error for invalid dialog search', async () => {
      if (skipIfNoToken()) return;

      await expect(rest.search.dialogs('', {} as any))
        .rejects.toThrow('Invalid parameters');
    });

    test('should throw error for negative page numbers', async () => {
      if (skipIfNoToken()) return;

      await expect(rest.search.tracks('test', -1))
        .rejects.toThrow('Invalid page number');

      await expect(rest.search.users({
        sort: 0, country: 0, region: 0, city: 0,
        worksAt: '', relationships: 0, online: false, avatar: false,
      }, -1)).rejects.toThrow('Invalid parameters');
    });
  });
});
