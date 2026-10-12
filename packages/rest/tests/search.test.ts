import { REST } from '../src/index';
import { installFetchMock, mockFetchRoutes } from './setup';

describe('SearchResource', () => {
  let rest: REST;

  beforeEach(() => {
    installFetchMock();
    rest = new REST().setToken('y.test-token-1234567890');
  });

  describe('Track Search', () => {
    test('should search tracks by query', async () => {
      mockFetchRoutes([{
        match: '/musebase/find/test',
        body: [{ ID: 1, Name: 'Test Track', Author: 'Artist' }],
      }]);

      const tracks = await rest.search.tracks('test');

      expect(Array.isArray(tracks)).toBe(true);
      if (tracks.length > 0) {
        expect(tracks[0]).toHaveProperty('ID');
        expect(tracks[0]).toHaveProperty('Name');
        expect(tracks[0]).toHaveProperty('Author');
      }
    });

    test('should search tracks with pagination', async () => {
      mockFetchRoutes([{ match: '/musebase/find/music', body: [] }]);

      const tracks = await rest.search.tracks('music', 1);

      expect(Array.isArray(tracks)).toBe(true);
    });

    test('should search tracks by artist', async () => {
      mockFetchRoutes([{ match: '/musebase/find/Queen', body: [] }]);

      const tracks = await rest.search.tracks('Queen');

      expect(Array.isArray(tracks)).toBe(true);
    });
  });

  describe('Dialog Search', () => {
    test('should search dialogs with basic filters', async () => {
      mockFetchRoutes([{
        method: 'POST',
        match: '/dialogs/find/test',
        body: [{ ID: 1, Name: 'Test Dialog', Type: 0 }],
      }]);

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
      mockFetchRoutes([{
        method: 'POST',
        match: '/dialogs/find/programming',
        body: [],
      }]);

      const dialogs = await rest.search.dialogs('programming', {
        sort: 1,
        type: 1,
        country: 0,
        topic: 5,
      });

      expect(Array.isArray(dialogs)).toBe(true);
    });

    test('should search dialogs with pagination', async () => {
      mockFetchRoutes([{
        method: 'POST',
        match: '/dialogs/find/tech',
        body: [],
      }]);

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
      await expect(rest.search.users(null as any))
        .rejects.toThrow('Invalid parameters');
    });

    test('should throw error for invalid track query', async () => {
      await expect(rest.search.tracks(''))
        .rejects.toThrow('Invalid query');
    });

    test('should throw error for invalid dialog search', async () => {
      await expect(rest.search.dialogs('', {} as any))
        .rejects.toThrow('Invalid parameters');
    });

    test('should throw error for negative page numbers', async () => {
      await expect(rest.search.tracks('test', -1))
        .rejects.toThrow('Invalid page number');

      await expect(rest.search.users({
        sort: 0, country: 0, region: 0, city: 0,
        worksAt: '', relationships: 0, online: false, avatar: false,
      }, -1)).rejects.toThrow('Invalid parameters');
    });
  });
});
