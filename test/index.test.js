import PublicationClient from '../src/index.js';

describe('PublicationClient', () => {
  it('constructs', () => {
    const pub = new PublicationClient('https://127.0.0.1', {});
    expect(pub).toBeInstanceOf(PublicationClient);
  });

  describe('reconnectIfIdle', () => {
    it('short-circuits when not in paranoid mode', () => {
      jest.useFakeTimers();
      const pub = new PublicationClient('https://127.0.0.1', {});
      pub.reconnectIfIdle('test');
      expect(clearTimeout).not.toHaveBeenCalled();
    });

    it.skip('reconnects if the connection is idle', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      jest.spyOn(pub, '_resetCollectionsAndConnect');
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      expect(pub._resetCollectionsAndConnect).toHaveBeenCalled();
      jest.clearAllTimers();
    });

    it('emits an event when it reconnects', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      jest.spyOn(pub, 'emit');
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      expect(pub.emit).toHaveBeenCalledWith('proactivelyReconnected', 'test');
      jest.clearAllTimers();
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
      jest.clearAllTimers();
    });
  });
});
