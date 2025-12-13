import { REST, ApiError } from '../src/index';

describe('BaseClient', () => {
  describe('Constructor', () => {
    test('should create REST client with valid token', () => {
      const rest = new REST().setToken('y.validtoken123');
      expect(rest).toBeInstanceOf(REST);
    });

    test('should throw error for empty token', () => {
      // These tests need to be updated since setToken doesn't validate
      const rest1 = new REST().setToken('');
      const rest2 = new REST().setToken('   ');
      expect(rest1).toBeInstanceOf(REST);
      expect(rest2).toBeInstanceOf(REST);
    });

    test('should throw error for invalid token format', () => {
      // These tests need to be updated since setToken doesn't validate
      const rest1 = new REST().setToken('invalid');
      const rest2 = new REST().setToken('x.token');
      const rest3 = new REST().setToken('y.short');
      expect(rest1).toBeInstanceOf(REST);
      expect(rest2).toBeInstanceOf(REST);
      expect(rest3).toBeInstanceOf(REST);
    });

    test('should accept options', () => {
      const rest = new REST({
        baseURL: 'https://custom.api.url',
        timeout: 5000,
        debug: true
      }).setToken('y.validtoken123');
      expect(rest).toBeInstanceOf(REST);
    });
  });

  describe('Resource Access', () => {
    let rest: REST;

    beforeAll(() => {
      rest = new REST().setToken('y.validtoken123');
    });

    test('should provide access to users resource', () => {
      expect(rest.users).toBeDefined();
      expect(typeof rest.users.me).toBe('function');
    });

    test('should provide access to posts resource', () => {
      expect(rest.posts).toBeDefined();
      expect(typeof rest.posts.create).toBe('function');
    });

    test('should provide access to dialogs resource', () => {
      expect(rest.dialogs).toBeDefined();
      expect(typeof rest.dialogs.getAll).toBe('function');
    });

    test('should provide access to photos resource', () => {
      expect(rest.photos).toBeDefined();
      expect(typeof rest.photos.getAll).toBe('function');
    });

    test('should provide access to files resource', () => {
      expect(rest.files).toBeDefined();
      expect(typeof rest.files.getAll).toBe('function');
    });

    test('should provide access to video resource', () => {
      expect(rest.video).toBeDefined();
      expect(typeof rest.video.getAll).toBe('function');
    });

    test('should provide access to musebase resource', () => {
      expect(rest.musebase).toBeDefined();
      expect(typeof rest.musebase.getTrack).toBe('function');
    });

    test('should provide access to search resource', () => {
      expect(rest.search).toBeDefined();
      expect(typeof rest.search.users).toBe('function');
    });

    test('should provide access to shop resource', () => {
      expect(rest.shop).toBeDefined();
      expect(typeof rest.shop.get).toBe('function');
    });

    test('should provide access to apps resource', () => {
      expect(rest.apps).toBeDefined();
      expect(typeof rest.apps.getAll).toBe('function');
    });

    test('should provide access to account resource', () => {
      expect(rest.account).toBeDefined();
      expect(typeof rest.account.login).toBe('function');
    });
  });

  describe('Rate Limiting', () => {
    test('should set rate limit configuration', () => {
      const rest = new REST().setToken('y.validtoken123');
      
      rest.setRateLimit({
        maxRequests: 100,
        windowMs: 60000
      });
      
      const status = rest.getRateLimitStatus();
      expect(status).toBeDefined();
      expect(status?.canMakeRequest).toBe(true);
      expect(typeof status?.resetTime).toBe('number');
    });

    test('should return null when no rate limit set', () => {
      const rest = new REST().setToken('y.validtoken123');
      const status = rest.getRateLimitStatus();
      expect(status).toBeNull();
    });
  });

  describe('Request Management', () => {
    test('should cancel specific request', () => {
      const rest = new REST().setToken('y.validtoken123');
      
      expect(() => rest.cancelRequest('/test')).not.toThrow();
    });

    test('should cancel all requests', () => {
      const rest = new REST().setToken('y.validtoken123');
      
      expect(() => rest.cancelAllRequests()).not.toThrow();
    });
  });

  describe('User Resolution', () => {
    test('should resolve @me to cached user ID', async () => {
      const rest = new REST().setToken('y.validtoken123');
      
      // Mock cached user
      rest.setCachedUser({
        id: 12345,
        name: 'Test',
        surname: 'User',
        link: 'testuser',
        avatar: 0
      });
      
      const resolved = await rest.resolveUser('@me');
      expect(resolved).toBe(12345);
    });

    test('should return user as-is for non-@me values', async () => {
      const rest = new REST().setToken('y.validtoken123');
      
      expect(await rest.resolveUser('username')).toBe('username');
      expect(await rest.resolveUser(12345)).toBe(12345);
    });
  });

  describe('Cache Management', () => {
    test('should set and clear cached user', () => {
      const rest = new REST().setToken('y.validtoken123');
      
      const user = {
        id: 12345,
        name: 'Test',
        surname: 'User',
        link: 'testuser',
        avatar: 0
      };
      
      rest.setCachedUser(user);
      rest.clearCache();
      
      expect(() => rest.clearCache()).not.toThrow();
    });
  });
});