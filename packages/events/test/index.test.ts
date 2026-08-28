import createEventEmitter, { Emitter, EventHandlerMap, mitt } from '../src/index';

describe('@yurbajs/events', () => {
  describe('createEventEmitter', () => {
    it('should be a function', () => {
      expect(createEventEmitter).toBeInstanceOf(Function);
    });

    it('should accept an optional event handler map', () => {
      expect(() => createEventEmitter(new Map())).not.toThrow();
      const map = new Map();
      const a = jest.fn();
      const b = jest.fn();
      map.set('foo', [a, b]);
      const events = createEventEmitter<{ foo: undefined }>(map);
      events.emit('foo');
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('should export mitt as alias', () => {
      expect(mitt).toBe(createEventEmitter);
    });
  });

  describe('Emitter instance', () => {
    const eventType = Symbol('eventType');
    type Events = {
      foo: string;
      bar: number;
      baz: { data: string };
      constructor: unknown;
      FOO: unknown;
      Bar: unknown;
      'baz:bat!': unknown;
      'baz:baT!': unknown;
      Foo: unknown;
      error: Error;
      [eventType]: unknown;
    };
    let events: EventHandlerMap<Events>;
    let emitter: Emitter<Events>;

    beforeEach(() => {
      events = new Map();
      emitter = createEventEmitter(events);
    });

    describe('properties', () => {
      it('should expose the event handler map', () => {
        expect(emitter.all).toBeInstanceOf(Map);
        expect(emitter.all).toBe(events);
      });
    });

    describe('on()', () => {
      it('should be a function', () => {
        expect(emitter.on).toBeInstanceOf(Function);
      });

      it('should register handler for new type', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        expect(events.get('foo')).toEqual([handler]);
      });

      it('should register handlers for any type strings', () => {
        const handler = jest.fn();
        emitter.on('constructor', handler);
        expect(events.get('constructor')).toEqual([handler]);
      });

      it('should append handler for existing type', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on('foo', handler1);
        emitter.on('foo', handler2);
        expect(events.get('foo')).toEqual([handler1, handler2]);
      });

      it('should NOT normalize case', () => {
        const handler = jest.fn();
        emitter.on('FOO', handler);
        emitter.on('Bar', handler);
        emitter.on('baz:baT!', handler);

        expect(events.get('FOO')).toEqual([handler]);
        expect(events.has('foo')).toBe(false);
        expect(events.get('Bar')).toEqual([handler]);
        expect(events.has('bar')).toBe(false);
        expect(events.get('baz:baT!')).toEqual([handler]);
      });

      it('can take symbols for event types', () => {
        const handler = jest.fn();
        emitter.on(eventType, handler);
        expect(events.get(eventType)).toEqual([handler]);
      });

      it('should add duplicate listeners', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.on('foo', handler);
        expect(events.get('foo')).toEqual([handler, handler]);
      });

      it('should handle wildcard listeners', () => {
        const handler = jest.fn();
        emitter.on('*', handler);
        expect(events.get('*')).toEqual([handler]);
      });
    });

    describe('once()', () => {
      it('should be a function', () => {
        expect(emitter.once).toBeInstanceOf(Function);
      });

      it('should register a one-time handler', () => {
        const handler = jest.fn();
        emitter.once('foo', handler);

        emitter.emit('foo', 'test');
        expect(handler).toHaveBeenCalledWith('test');
        expect(handler).toHaveBeenCalledTimes(1);

        emitter.emit('foo', 'test2');
        expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
      });

      it('should work with wildcard events', () => {
        const handler = jest.fn();
        emitter.once('*', handler);

        emitter.emit('foo', 'test');
        expect(handler).toHaveBeenCalledWith('foo', 'test');
        expect(handler).toHaveBeenCalledTimes(1);

        emitter.emit('bar', 123);
        expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
      });

      it('should be removable with off()', () => {
        const handler = jest.fn();
        emitter.once('foo', handler);

        // Get the wrapper function that was actually registered
        const registeredHandlers = events.get('foo') as any[];
        expect(registeredHandlers).toHaveLength(1);

        emitter.off('foo', registeredHandlers[0]);
        emitter.emit('foo', 'test');
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe('prependListener()', () => {
      it('should be a function', () => {
        expect(emitter.prependListener).toBeInstanceOf(Function);
      });

      it('should add handler to the beginning of the list', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        emitter.on('foo', handler1);
        emitter.prependListener('foo', handler2);

        expect(events.get('foo')).toEqual([handler2, handler1]);
      });

      it('should work with wildcard events', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        emitter.on('*', handler1);
        emitter.prependListener('*', handler2);

        expect(events.get('*')).toEqual([handler2, handler1]);
      });
    });

    describe('prependOnceListener()', () => {
      it('should be a function', () => {
        expect(emitter.prependOnceListener).toBeInstanceOf(Function);
      });

      it('should add one-time handler to the beginning of the list', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        emitter.on('foo', handler1);
        emitter.prependOnceListener('foo', handler2);

        const handlers = events.get('foo') as any[];
        expect(handlers).toHaveLength(2);

        emitter.emit('foo', 'test');
        expect(handler2).toHaveBeenCalledWith('test');
        expect(handler1).toHaveBeenCalledWith('test');
        expect(handler2).toHaveBeenCalledTimes(1);

        emitter.emit('foo', 'test2');
        expect(handler2).toHaveBeenCalledTimes(1); // Should not be called again
        expect(handler1).toHaveBeenCalledTimes(2);
      });
    });

    describe('off()', () => {
      it('should be a function', () => {
        expect(emitter.off).toBeInstanceOf(Function);
      });

      it('should remove handler for type', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.off('foo', handler);
        expect(events.get('foo')).toEqual([]);
      });

      it('should NOT normalize case', () => {
        const handler = jest.fn();
        emitter.on('FOO', handler);
        emitter.on('Bar', handler);
        emitter.on('baz:bat!', handler);

        emitter.off('FOO', handler);
        emitter.off('Bar', handler);
        emitter.off('baz:baT!', handler);

        expect(events.get('FOO')).toEqual([]);
        expect(events.has('foo')).toBe(false);
        expect(events.get('Bar')).toEqual([]);
        expect(events.has('bar')).toBe(false);
        expect(events.get('baz:bat!')).toHaveLength(1);
      });

      it('should remove all matching listeners', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.on('foo', handler);
        emitter.off('foo', handler);
        expect(events.get('foo')).toEqual([]);
      });

      it('should remove all handlers when no handler specified', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on('foo', handler1);
        emitter.on('foo', handler2);
        emitter.on('bar', handler1);

        emitter.off('foo');
        expect(events.get('foo')).toEqual([]);
        expect(events.get('bar')).toHaveLength(1);

        emitter.off('bar');
        expect(events.get('bar')).toEqual([]);
      });
    });

    describe('removeAllListeners()', () => {
      it('should be a function', () => {
        expect(emitter.removeAllListeners).toBeInstanceOf(Function);
      });

      it('should remove all listeners for specific type', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on('foo', handler1);
        emitter.on('foo', handler2);
        emitter.on('bar', handler1);

        emitter.removeAllListeners('foo');
        expect(events.get('foo')).toEqual([]);
        expect(events.get('bar')).toHaveLength(1);
      });

      it('should remove all listeners when no type specified', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.on('bar', handler);
        emitter.on('*', handler);

        emitter.removeAllListeners();
        expect(events.size).toBe(0);
      });
    });

    describe('listenerCount()', () => {
      it('should be a function', () => {
        expect(emitter.listenerCount).toBeInstanceOf(Function);
      });

      it('should return correct count of listeners', () => {
        expect(emitter.listenerCount('foo')).toBe(0);

        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on('foo', handler1);
        expect(emitter.listenerCount('foo')).toBe(1);

        emitter.on('foo', handler2);
        expect(emitter.listenerCount('foo')).toBe(2);

        emitter.off('foo', handler1);
        expect(emitter.listenerCount('foo')).toBe(1);
      });

      it('should work with wildcard events', () => {
        const handler = jest.fn();
        emitter.on('*', handler);
        expect(emitter.listenerCount('*')).toBe(1);
      });
    });

    describe('eventNames()', () => {
      it('should be a function', () => {
        expect(emitter.eventNames).toBeInstanceOf(Function);
      });

      it('should return array of event names', () => {
        expect(emitter.eventNames()).toEqual([]);

        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.on('bar', handler);
        emitter.on('*', handler);

        const names = emitter.eventNames();
        expect(names).toContain('foo');
        expect(names).toContain('bar');
        expect(names).toContain('*');
        expect(names).toHaveLength(3);
      });
    });

    describe('emit()', () => {
      it('should be a function', () => {
        expect(emitter.emit).toBeInstanceOf(Function);
      });

      it('should invoke handler for type', () => {
        const event = { a: 'b' };
        const handler = jest.fn();

        emitter.on('foo', handler);
        emitter.emit('foo', 'test');

        expect(handler).toHaveBeenCalledWith('test');
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('should NOT ignore case', () => {
        const onFoo = jest.fn();
        const onFOO = jest.fn();
        events.set('Foo', [onFoo]);
        events.set('FOO', [onFOO]);

        emitter.emit('Foo', 'Foo arg');
        emitter.emit('FOO', 'FOO arg');

        expect(onFoo).toHaveBeenCalledWith('Foo arg');
        expect(onFoo).toHaveBeenCalledTimes(1);
        expect(onFOO).toHaveBeenCalledWith('FOO arg');
        expect(onFOO).toHaveBeenCalledTimes(1);
      });

      it('should invoke wildcard handlers', () => {
        const wildcardHandler = jest.fn();
        const specificHandler = jest.fn();

        emitter.on('*', wildcardHandler);
        emitter.on('foo', specificHandler);

        emitter.emit('foo', 'test');

        expect(specificHandler).toHaveBeenCalledWith('test');
        expect(wildcardHandler).toHaveBeenCalledWith('foo', 'test');
      });

      it('should handle errors in handlers', () => {
        const errorHandler = jest.fn();
        const faultyHandler = jest.fn(() => {
          throw new Error('Test error');
        });

        emitter.on('error', errorHandler);
        emitter.on('foo', faultyHandler);

        emitter.emit('foo', 'test');

        expect(faultyHandler).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should log errors to console when no error handler', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const faultyHandler = jest.fn(() => {
          throw new Error('Test error');
        });

        emitter.on('foo', faultyHandler);
        emitter.emit('foo', 'test');

        expect(consoleSpy).toHaveBeenCalledWith('Unhandled event emitter error:', expect.any(Error));

        consoleSpy.mockRestore();
      });

      it('should handle errors in wildcard handlers', () => {
        const errorHandler = jest.fn();
        const faultyWildcardHandler = jest.fn(() => {
          throw new Error('Wildcard error');
        });

        emitter.on('error', errorHandler);
        emitter.on('*', faultyWildcardHandler);

        emitter.emit('foo', 'test');

        expect(faultyWildcardHandler).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should work with symbols', () => {
        const handler = jest.fn();
        emitter.on(eventType, handler);
        emitter.emit(eventType, 'symbol test');

        expect(handler).toHaveBeenCalledWith('symbol test');
      });

      it('should emit events without data', () => {
        const handler = jest.fn();
        emitter.on('foo', handler);
        emitter.emit('foo', 'test');

        expect(handler).toHaveBeenCalledWith('test');
      });
    });

    describe('Bot framework specific scenarios', () => {
      it('should handle message events', () => {
        type BotEvents = {
          message: { text: string; userId: string };
          command: { name: string; args: string[] };
          error: Error;
        };

        const botEmitter = createEventEmitter<BotEvents>();
        const messageHandler = jest.fn();
        const commandHandler = jest.fn();

        botEmitter.on('message', messageHandler);
        botEmitter.on('command', commandHandler);

        botEmitter.emit('message', { text: 'Hello', userId: '123' });
        botEmitter.emit('command', { name: 'ping', args: [] });

        expect(messageHandler).toHaveBeenCalledWith({ text: 'Hello', userId: '123' });
        expect(commandHandler).toHaveBeenCalledWith({ name: 'ping', args: [] });
      });

      it('should handle middleware pattern', () => {
        type MiddlewareEvents = {
          'middleware:before': { context: any };
          'middleware:after': { context: any; result: any };
        };

        const middlewareEmitter = createEventEmitter<MiddlewareEvents>();
        const beforeHandler = jest.fn();
        const afterHandler = jest.fn();

        middlewareEmitter.on('middleware:before', beforeHandler);
        middlewareEmitter.on('middleware:after', afterHandler);

        const context = { userId: '123' };
        const result = { success: true };

        middlewareEmitter.emit('middleware:before', { context });
        middlewareEmitter.emit('middleware:after', { context, result });

        expect(beforeHandler).toHaveBeenCalledWith({ context });
        expect(afterHandler).toHaveBeenCalledWith({ context, result });
      });

      it('should handle plugin system events', () => {
        const pluginEmitter = createEventEmitter<{
          'plugin:load': { name: string };
          'plugin:unload': { name: string };
          'plugin:error': { name: string; error: Error };
        }>();

        const loadHandler = jest.fn();
        const unloadHandler = jest.fn();
        const errorHandler = jest.fn();

        pluginEmitter.on('plugin:load', loadHandler);
        pluginEmitter.on('plugin:unload', unloadHandler);
        pluginEmitter.on('plugin:error', errorHandler);

        pluginEmitter.emit('plugin:load', { name: 'test-plugin' });
        pluginEmitter.emit('plugin:unload', { name: 'test-plugin' });
        pluginEmitter.emit('plugin:error', { name: 'test-plugin', error: new Error('Plugin failed') });

        expect(loadHandler).toHaveBeenCalledWith({ name: 'test-plugin' });
        expect(unloadHandler).toHaveBeenCalledWith({ name: 'test-plugin' });
        expect(errorHandler).toHaveBeenCalledWith({ name: 'test-plugin', error: expect.any(Error) });
      });
    });
  });
});
