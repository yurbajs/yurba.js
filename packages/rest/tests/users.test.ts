import { REST } from '../src/index';
import { TEST_CONFIG, skipIfNoToken } from './setup';

describe('UserResource', () => {
  let rest: REST;

  beforeAll(() => {
    if (!skipIfNoToken()) {
      rest = new REST(TEST_CONFIG.token);
    }
  });

  describe('Core Methods', () => {
    test('should get current user info', async () => {
      if (skipIfNoToken()) {
        console.log('⏭️  Skipping test - no token provided');
        return;
      }
      
      const user = await rest.users.me();
      
      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
      expect(user.Name).toBeDefined();
      expect(user.Link).toBeDefined();
      expect(typeof user.RegisterDate).toBe('number');
    });

    test('should get user by identifier', async () => {
      if (skipIfNoToken()) return;
      
      const user = await rest.users.get(TEST_CONFIG.userId);
      
      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
      expect(user.Name).toBeDefined();
    });

    test('should get user by @me', async () => {
      if (skipIfNoToken()) return;
      
      const user = await rest.users.get('@me');
      
      expect(user).toBeValidYurbaResponse();
      expect(user).toHaveYurbaId();
    });
  });

  describe('Friends Methods', () => {
    test('should get current user friends', async () => {
      if (skipIfNoToken()) return;
      
      const friends = await rest.users.friends();
      
      expect(Array.isArray(friends)).toBe(true);
    });

    test('should handle private friends list', async () => {
      if (skipIfNoToken()) return;
      
      try {
        await rest.users.getFriends(TEST_CONFIG.userId, 0);
      } catch (error: any) {
        expect(error.message).toMatch(/Access denied|resource does not exist/);
      }
    });
  });

  describe('Gifts Methods', () => {
    test('should get current user gifts', async () => {
      if (skipIfNoToken()) return;
      
      const gifts = await rest.users.gifts();
      
      expect(Array.isArray(gifts)).toBe(true);
    });

    test('should get user gifts', async () => {
      if (skipIfNoToken()) return;
      
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
      if (skipIfNoToken()) return;
      
      await expect(rest.users.get('')).rejects.toThrow('Invalid user');
      await expect(rest.users.get('a'.repeat(256))).rejects.toThrow('Invalid user');
    });

    test('should throw error for invalid page number', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.users.friends(-1)).rejects.toThrow('Invalid page number');
    });
  });
});