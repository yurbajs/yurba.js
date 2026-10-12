import { REST } from '../src/index';
import { TEST_CONFIG, installFetchMock, mockFetchRoutes } from './setup';

const me = {
  ID: 1111,
  Name: 'Test',
  Surname: 'User',
  Link: 'tester',
  Avatar: 1,
  RegisterDate: 1_700_000_000,
};

describe('UserResource', () => {
  let rest: REST;

  beforeEach(() => {
    installFetchMock();
    rest = new REST().setToken('y.test-token-1234567890');
  });

  describe('Core Methods', () => {
    test('should get current user info', async () => {
      mockFetchRoutes([{ match: '/get_me', body: me }]);

      const user = await rest.users.me();

      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
      expect(user.Name).toBeDefined();
      expect(user.Link).toBeDefined();
      expect(typeof user.RegisterDate).toBe('number');
    });

    test('should get user by identifier', async () => {
      mockFetchRoutes([{ match: `/user/${TEST_CONFIG.userId}`, body: me }]);

      const user = await rest.users.get(TEST_CONFIG.userId);

      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
      expect(user.Name).toBeDefined();
    });

    test('should get user by @me', async () => {
      mockFetchRoutes([
        { match: '/get_me', body: me },
        { match: `/user/${me.ID}`, body: me },
      ]);

      const user = await rest.users.get('@me');

      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
    });
  });

  describe('Friends Methods', () => {
    test('should get current user friends', async () => {
      mockFetchRoutes([
        { match: '/get_me', body: me },
        { match: `/user/${me.ID}/friends`, body: [me] },
      ]);

      const friends = await rest.users.friends();

      expect(Array.isArray(friends)).toBe(true);
    });

    test('should handle private friends list', async () => {
      mockFetchRoutes([{
        match: `/user/${TEST_CONFIG.userId}/friends`,
        ok: false,
        status: 403,
        body: { detail: 'access_denied' },
      }]);

      await expect(rest.users.getFriends(TEST_CONFIG.userId, 0))
        .rejects.toThrow(/Access denied|resource does not exist|You don't have access to this resource/);
    });
  });

  describe('Gifts Methods', () => {
    test('should get current user gifts', async () => {
      mockFetchRoutes([
        { match: '/get_me', body: me },
        { match: `/user/${me.ID}/gifts`, body: [] },
      ]);

      const gifts = await rest.users.gifts();

      expect(Array.isArray(gifts)).toBe(true);
    });

    test('should get user gifts', async () => {
      mockFetchRoutes([{
        match: `/user/${TEST_CONFIG.userId}/gifts`,
        body: [{ ID: 1, User: me, Target: me }],
      }]);

      const gifts = await rest.users.getGifts(TEST_CONFIG.userId);

      expect(Array.isArray(gifts)).toBe(true);
      if (gifts.length > 0) {
        expect(gifts[0]).toHaveProperty('ID');
        expect(gifts[0]).toHaveProperty('User');
        expect(gifts[0]).toHaveProperty('Target');
      }
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid user identifier', async () => {
      await expect(rest.users.get('')).rejects.toThrow('Invalid user');
      await expect(rest.users.get('a'.repeat(256))).rejects.toThrow('Invalid user');
    });

    test('should throw error for invalid page number', async () => {
      await expect(rest.users.friends(-1)).rejects.toThrow('Invalid page number');
    });
  });
});
