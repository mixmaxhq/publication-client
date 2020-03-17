import PublicationClient from '../src/index.js';

describe('PublicationClient', () => {
  it('constructs', () => {
    const pub = new PublicationClient('https://127.0.0.1', {});
    expect(pub).toBeInstanceOf(PublicationClient);
  });

  describe('reconnectIfIdle', () => {
    it('short-circuits when not in paranoid mode', () => {
      const origClearTimeout = clearTimeout;
      clearTimeout = jest.fn();
      const pub = new PublicationClient('https://127.0.0.1', {});
      pub.reconnectIfIdle('test');
      expect(clearTimeout).not.toHaveBeenCalled();
      clearTimeout = origClearTimeout;
    });

    it('reconnects if the connection is idle', () => {
      const pub = new PublicationClient('https://127.0.0.1', {
        lastDataTimeout: 1,
        paranoid: true,
      });
      jest.spyOn(pub, '_resetCollectionsAndConnect');
      pub._lastDataTimestamp = 0;
      pub.reconnectIfIdle('test');
      expect(pub._resetCollectionsAndConnect).toHaveBeenCalled();
      clearTimeout(pub._idleTimer);
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
      clearTimeout(pub._idleTimer);
    });
  });
});
