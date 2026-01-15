import { REST, BatchRequest } from '../src/index';
import { skipIfNoToken, TEST_CONFIG } from './setup';

describe('Batch Requests', () => {
  describe('BatchRequest Class', () => {
    let batch: BatchRequest;

    beforeEach(() => {
      batch = new BatchRequest();
    });

    test('should create empty batch', () => {
      expect(batch.size()).toBe(0);
      expect(batch.isEmpty()).toBe(true);
      expect(batch.getKeys()).toEqual([]);
    });

    test('should add requests to batch', () => {
      const promise1 = Promise.resolve('result1');
      const promise2 = Promise.resolve('result2');

      batch.add('test1', promise1);
      batch.add('test2', promise2);

      expect(batch.size()).toBe(2);
      expect(batch.isEmpty()).toBe(false);
      expect(batch.getKeys()).toEqual(['test1', 'test2']);
    });

    test('should throw error for duplicate keys', () => {
      const promise = Promise.resolve('result');

      batch.add('test', promise);

      expect(() => batch.add('test', promise)).toThrow('Request with key "test" already exists');
    });

    test('should execute empty batch', async () => {
      const results = await batch.execute();
      expect(results).toEqual({});
    });

    test('should execute batch with successful requests', async () => {
      batch.add('test1', Promise.resolve('result1'));
      batch.add('test2', Promise.resolve('result2'));

      const results = await batch.execute();

      expect(results).toEqual({
        test1: 'result1',
        test2: 'result2',
      });
    });

    test('should fail if any request fails', async () => {
      batch.add('success', Promise.resolve('ok'));
      batch.add('failure', Promise.reject(new Error('failed')));

      await expect(batch.execute()).rejects.toThrow('failed');
    });

    test('should handle settled execution', async () => {
      batch.add('success', Promise.resolve('ok'));
      batch.add('failure', Promise.reject(new Error('failed')));

      const results = await batch.executeSettled();

      expect(results.success).toBe('ok');
      expect(results.failure).toEqual({ error: expect.any(Error) });
    });

    test('should clear batch', () => {
      batch.add('test', Promise.resolve('result'));
      expect(batch.size()).toBe(1);

      batch.clear();
      expect(batch.size()).toBe(0);
      expect(batch.isEmpty()).toBe(true);
    });
  });

  describe('REST Integration', () => {
    let rest: REST;

    beforeAll(() => {
      if (skipIfNoToken()) return;
      rest = new REST().setToken(TEST_CONFIG.token);
    });

    test('should create batch from REST client', () => {
      if (skipIfNoToken()) return;

      const batch = rest.batch();
      expect(batch).toBeInstanceOf(BatchRequest);
    });

    test('should execute real API batch requests', async () => {
      if (skipIfNoToken()) return;

      const results = await rest.batch()
        .add('me', rest.users.me())
        .add('posts', rest.posts.get('@me', {}))
        .execute();

      expect(results.me).toHaveProperty('ID');
      expect(Array.isArray(results.posts)).toBe(true);
    }, 15000);

    test('should handle mixed success/failure in settled mode', async () => {
      if (skipIfNoToken()) return;

      const results = await rest.batch()
        .add('me', rest.users.me())
        .add('invalid', rest.users.get(-1))
        .executeSettled();

      expect(results.me).toHaveProperty('ID');
      expect(results.invalid).toHaveProperty('error');
    }, 15000);
  });
});
