import { Client } from '../src/client/Client';

const VALID_TOKEN = 'y.AjqFIO1riKbU0ObhVXHscgnAC1LoZweW123456789';

describe('Client Improvements', () => {
  describe('Token Validation', () => {
    it('should accept valid Yurba token', () => {
      expect(() => new Client()).not.toThrow();
    });

    it('should reject invalid token format', async () => {
      const client = new Client();
      await expect(client.init('invalid_token')).rejects.toThrow();
    });

    it('should reject short token', async () => {
      const client = new Client();
      await expect(client.init('y.short')).rejects.toThrow();
    });

    it('should reject empty token', async () => {
      const client = new Client();
      await expect(client.init('')).rejects.toThrow();
    });
  });

  describe('Client Options', () => {
    it('should use default options', () => {
      const client = new Client();
      expect(client).toBeInstanceOf(Client);
    });

    it('should accept custom prefix', () => {
      const client = new Client({ prefix: '!' });
      expect(client).toBeInstanceOf(Client);
    });

    it('should accept custom reconnect attempts', () => {
      const client = new Client({ maxReconnectAttempts: 10 });
      expect(client).toBeInstanceOf(Client);
    });
  });

  describe('Middleware Management', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client();
    });

    it('should add middleware', () => {
      const middleware = jest.fn();
      client.use(middleware, { name: 'test-middleware', enabled: true });

      const middlewares = client.getMiddlewares();
      expect(middlewares).toHaveLength(1);
      expect(middlewares[0].name).toBe('test-middleware');
    });

    it('should remove middleware', () => {
      const middleware = jest.fn();
      client.use(middleware, { name: 'test-middleware', enabled: true });

      const removed = client.removeMiddleware('test-middleware');
      expect(removed).toBe(true);
      expect(client.getMiddlewares()).toHaveLength(0);
    });
  });

  describe('Command Registration', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client();
    });

    it('should register command successfully', () => {
      const handler = jest.fn();
      client.commands.register('test', { name: 'string' }, handler);

      const commands = client.commands.getAll();
      expect(commands).toContain('test');
    });

    it('should not register duplicate commands', () => {
      const handler = jest.fn();
      client.commands.register('test', { name: 'string' }, handler);

      expect(() => {
        client.commands.register('test', { name: 'string' }, handler);
      }).toThrow();
    });
  });
});
