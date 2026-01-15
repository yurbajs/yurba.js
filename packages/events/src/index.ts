export type EventType = string | symbol;

// An event handler can take an optional event argument and should not return a value
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void;

// An array of all currently registered event handlers for a type
export type EventHandlerList<T = unknown> = Array<Handler<T>>;
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<WildcardHandler<T>>;

// A map of event types and their corresponding event handlers
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>;

export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>;

  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
  on(type: '*', handler: WildcardHandler<Events>): void;

  once<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
  once(type: '*', handler: WildcardHandler<Events>): void;

  off<Key extends keyof Events>(
    type: Key,
    handler?: Handler<Events[Key]>
  ): void;
  off(type: '*', handler?: WildcardHandler<Events>): void;

  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
  emit<Key extends keyof Events>(
    type: undefined extends Events[Key] ? Key : never
  ): void;

  removeAllListeners<Key extends keyof Events>(type?: Key): void;
  removeAllListeners(): void;

  listenerCount<Key extends keyof Events>(type: Key): number;
  listenerCount(type: '*'): number;

  eventNames(): Array<keyof Events | '*'>;

  prependListener<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
  prependListener(type: '*', handler: WildcardHandler<Events>): void;

  prependOnceListener<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
  prependOnceListener(type: '*', handler: WildcardHandler<Events>): void;
}

/**
 * YurbaJS Events: Enhanced event emitter for bot framework.
 * @name createEventEmitter
 * @returns {Emitter}
 */
export default function createEventEmitter<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>,
): Emitter<Events> {
  type GenericEventHandler =
    | Handler<Events[keyof Events]>
    | WildcardHandler<Events>;

  all = all || new Map();
  const onceHandlers = new WeakSet<GenericEventHandler>();

  // Helper function to get handler list (typed)
  function getHandlers(type: keyof Events | '*'): Array<GenericEventHandler> {
    let handlers = all!.get(type);
    if (!handlers) {
      handlers = [];
      all!.set(type, handlers as EventHandlerList<Events[keyof Events]>);
    }
    return handlers as Array<GenericEventHandler>;
  }

  const emitter: Emitter<Events> = {
    all,

    on(type: any, handler: any) {
      getHandlers(type).push(handler);
    },

    once(type: any, handler: any) {
      function onceWrapper(this: any, ...args: any[]) {
        emitter.off(type, onceWrapper as any);
        handler.apply(this, args);
      }
      onceHandlers.add(onceWrapper as GenericEventHandler);
      emitter.on(type, onceWrapper as any);
    },

    prependListener(type: any, handler: any) {
      getHandlers(type).unshift(handler);
    },

    prependOnceListener(type: any, handler: any) {
      function onceWrapper(this: any, ...args: any[]) {
        emitter.off(type, onceWrapper as any);
        handler.apply(this, args);
      }
      onceHandlers.add(onceWrapper as GenericEventHandler);
      emitter.prependListener(type, onceWrapper as any);
    },

    off(type: any, handler?: any) {
      if (!handler) {
        all!.set(type, []);
        return;
      }
      const handlers = all!.get(type);
      if (!handlers) return;
      let idx: number;
      // Remove all occurrences of handler
      while ((idx = handlers.indexOf(handler)) !== -1) {
        handlers.splice(idx, 1);
        onceHandlers.delete(handler);
      }
    },

    removeAllListeners(type?: any) {
      if (type !== undefined) {
        all!.set(type, []);
      } else {
        all!.clear();
      }
    },

    listenerCount(type: any): number {
      const handlers = all!.get(type);
      return handlers ? handlers.length : 0;
    },

    eventNames(): Array<keyof Events | '*'> {
      return Array.from(all!.keys());
    },

    emit(type: any, evt?: any) {
      // Standard listeners
      const handlers = (all!.get(type) || []).slice();
      for (const handler of handlers) {
        try {
          (handler as Handler<Events[keyof Events]>)(evt);
        } catch (error) {
          const errorHandlers = all!.get('error' as any) as Handler<any>[] | undefined;
          if (errorHandlers && errorHandlers.length > 0) {
            errorHandlers[0](error);
          } else {

            console.error('Unhandled event emitter error:', error);
          }
        }
      }

      // Wildcard listeners
      const wildcards = (all!.get('*') || []).slice();
      for (const handler of wildcards) {
        try {
          (handler as WildcardHandler<Events>)(type, evt);
        } catch (error) {
          const errorHandlers = all!.get('error' as any) as Handler<any>[] | undefined;
          if (errorHandlers && errorHandlers.length > 0) {
            errorHandlers[0](error);
          } else {

            console.error('Unhandled event emitter error:', error);
          }
        }
      }
    },
  };

  return emitter;
}

// Export the function as both default and named export for compatibility
export { createEventEmitter };

// Legacy mitt compatibility
export const mitt = createEventEmitter;
