import { describe, it, expect, vi } from 'vitest';
import PublicationClient from '../src/index.js';

describe('PublicationClient', () => {
  it('constructs', () => {
    const pub = new PublicationClient('https://127.0.0.1', {});
    expect(pub).toBeInstanceOf(PublicationClient);
  });

  describe('reconnectIfIdle', () => {
    it('short-circuits when not in paranoid mode', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const pub = new PublicationClient('https://127.0.0.1', {});
      pub.reconnectIfIdle('test');
      expect(clearTimeoutSpy).not.toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });

    it.skip('reconnects if the connection is idle', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      vi.spyOn(pub, '_resetCollectionsAndConnect');
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      expect(pub._resetCollectionsAndConnect).toHaveBeenCalled();
      vi.clearAllTimers();
    });

    it('emits an event when it reconnects', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      vi.spyOn(pub, 'emit');
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      expect(pub.emit).toHaveBeenCalledWith('proactivelyReconnected', 'test');
      vi.clearAllTimers();
    });

    it('calls new method with correct parameters', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      const subscription = pub.subscribeWithOptions(
        'test',
        { bootstrap: false },
        { key: 1 },
        { key: 2 }
      );
      expect(pub._subscriptions).not.toBe({});
      expect(subscription._params).toStrictEqual([{ key: 1 }, { key: 2 }, { bootstrap: false }]);
      subscription.stop();
      expect(pub._subscriptions).toStrictEqual({});
      vi.clearAllTimers();
    });
  });

  describe('getSubscriptionById', () => {
    it('return the subscription with the given key', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      const subscriptionKey = {
        name: 'orgs',
        options: {
          bootstrap: false,
          expandMembers: true,
        },
      };
      pub._nextSubscriptionId = 0;
      for (let i = 0; i < 10; i++) {
        pub.subscribe(`${subscriptionKey.name}-${i}`, subscriptionKey.options);
      }
      const subscriptionId = '5';
      const subscription = pub.getSubscriptionById(subscriptionId);

      expect(subscription._id).toEqual(subscriptionId);
      expect(subscription._name).toEqual(`${subscriptionKey.name}-${subscriptionId}`);
    });

    it('return null if there is no subscription with the given id', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      const subscriptionKey = {
        name: 'orgs',
        options: {
          bootstrap: false,
          expandMembers: true,
        },
      };
      pub._nextSubscriptionId = 0;
      for (let i = 0; i < 10; i++) {
        pub.subscribe(`${subscriptionKey.name}-${i}`, subscriptionKey.options);
      }
      const subscriptionId = '11';
      const subscription = pub.getSubscriptionById(subscriptionId);

      expect(subscription).toEqual(null);
    });
  });
});
