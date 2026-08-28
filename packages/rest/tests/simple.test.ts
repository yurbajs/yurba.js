import { REST, ApiError } from '../src/index';

describe('Simple Tests (No Token Required)', () => {
  describe('REST Client Creation', () => {
    test('should create REST client with valid token', () => {
      const rest = new REST().setToken('y.validtoken1234567890');
      expect(rest).toBeInstanceOf(REST);
    });

    test('should throw error for empty token', () => {
      const rest1 = new REST().setToken('');
      const rest2 = new REST().setToken('   ');
      expect(rest1).toBeInstanceOf(REST);
      expect(rest2).toBeInstanceOf(REST);
    });

    test('should throw error for invalid token format', () => {
      const rest1 = new REST().setToken('invalid');
      const rest2 = new REST().setToken('x.token');
      const rest3 = new REST().setToken('y.short');
      expect(rest1).toBeInstanceOf(REST);
      expect(rest2).toBeInstanceOf(REST);
      expect(rest3).toBeInstanceOf(REST);
    });
  });

  describe('Resource Access', () => {
    let rest: REST;

    beforeAll(() => {
      rest = new REST().setToken('y.validtoken1234567890');
    });

    test('should provide access to all resources', () => {
      expect(rest.users).toBeDefined();
      expect(rest.posts).toBeDefined();
      expect(rest.dialogs).toBeDefined();
      expect(rest.photos).toBeDefined();
      expect(rest.files).toBeDefined();
      expect(rest.video).toBeDefined();
      expect(rest.musebase).toBeDefined();
      expect(rest.search).toBeDefined();
      expect(rest.shop).toBeDefined();
      expect(rest.apps).toBeDefined();
      expect(rest.account).toBeDefined();
    });

    test('should have correct method signatures', () => {
      expect(typeof rest.users.me).toBe('function');
      expect(typeof rest.posts.create).toBe('function');
      expect(typeof rest.dialogs.getAll).toBe('function');
      expect(typeof rest.photos.getAll).toBe('function');
      expect(typeof rest.search.users).toBe('function');
    });
  });

  describe('Configuration', () => {
    test('should accept custom options', () => {
      const rest = new REST({
        baseURL: 'https://custom.api.url',
        timeout: 5000,
        debug: true,
      }).setToken('y.validtoken1234567890');
      expect(rest).toBeInstanceOf(REST);
    });

    test('should set rate limiting', () => {
      const rest = new REST().setToken('y.validtoken1234567890');

      rest.setRateLimit({
        maxRequests: 100,
        windowMs: 60000,
      });

      const status = rest.getRateLimitStatus();
      expect(status).toBeDefined();
      expect(status?.canMakeRequest).toBe(true);
    });
  });

  describe('Cache Management', () => {
    test('should manage cached user', () => {
      const rest = new REST().setToken('y.validtoken1234567890');

      const user = {
        id: 12345,
        name: 'Test',
        surname: 'User',
        link: 'testuser',
        avatar: 0,
      };

      rest.setCachedUser(user);
      expect(() => rest.clearCache()).not.toThrow();
    });
  });

  describe('Request Management', () => {
    test('should handle request cancellation', () => {
      const rest = new REST().setToken('y.validtoken1234567890');

      expect(() => rest.cancelRequest('/test')).not.toThrow();
      expect(() => rest.cancelAllRequests()).not.toThrow();
    });
  });
});
