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

  describe('subscribe via callbacks', () => {
    const onReconnectedEvent = jest.fn();
    const onAddedEvent = jest.fn();
    const onChangedEvent = jest.fn();
    const onRemovedEvent = jest.fn();

    const callbacks = {
      added: onAddedEvent,
      changed: onChangedEvent,
      removed: onRemovedEvent,
    };

    const pub = new PublicationClient('https://127.0.0.1', {
      lastDataTimeout: 1,
      paranoid: true,
    });
    const defaultMessage = {
      collection: 'sequence',
      id: '62e76f79a1016bb8a303ef6b',
    };
    const defaultResponse = [defaultMessage.collection, defaultMessage.id];
    const callbacksResponse = {
      added: [...defaultResponse, undefined],
      changed: [...defaultResponse, undefined, undefined],
      removed: [...defaultResponse],
    };

    beforeEach(() => {
      pub._collections = [];
      pub._subscriptions = [];
      pub.unsubscribeEventFromCallbacks([]);
      pub.subscribeEventsToCallbacks(
        onReconnectedEvent,
        onAddedEvent,
        onChangedEvent,
        onRemovedEvent
      );
    });

    test.each(['added', 'changed', 'removed'])(
      'calls the event callback and updates the collection if collection subscribed via callbacks and it was created by backbone pubilcations on receiving %s event',
      (event) => {
        const message = {
          msg: event,
          collection: 'sequence',
          id: '62e76f79a1016bb8a303ef6b',
        };
        pub.subscribeViaCallbacks(message.collection);
        pub._collections[message.collection] = {};

        const getCollectionsMock = jest.spyOn(pub, 'getCollection');
        getCollectionsMock.mockReturnValue({
          _onRemoved: jest.fn(),
          _onChanged: jest.fn(),
          _onAdded: jest.fn(),
        });
        pub._handleMessage(message);
        expect(callbacks[event]).toHaveBeenCalled();
        expect(pub.getCollection).toHaveBeenCalled();
      }
    );
    test.each(['added', 'changed', 'removed'])(
      'does not call callback, but updates collection if collection not subscribed via callbacks but was created by backbone pubilcations on receiving an %s event',
      (event) => {
        const message = {
          msg: event,
          collection: 'sequence',
          id: '62e76f79a1016bb8a303ef6b',
        };
        pub._collections[message.collection] = {};
        const getCollectionsMock = jest.spyOn(pub, 'getCollection');
        getCollectionsMock.mockReturnValue({
          _onRemoved: jest.fn(),
          _onChanged: jest.fn(),
          _onAdded: jest.fn(),
        });
        pub._handleMessage(message);
        expect(callbacks[event]).not.toHaveBeenCalled();
        expect(pub.getCollection).toHaveBeenCalled();
      }
    );
    test.each(['added', 'changed', 'removed'])(
      'calls the event callback and not updates the collection if collection subscribed via callbacks and it was not created by backbone pubilcations on receiving %s event',
      (event) => {
        const message = {
          msg: event,
          ...defaultMessage,
        };
        pub.subscribeViaCallbacks(message.collection);
        jest.spyOn(pub, 'getCollection');
        pub._handleMessage(message);
        expect(callbacks[event]).toHaveBeenCalledWith(...callbacksResponse[event]);
        expect(pub.getCollection).not.toHaveBeenCalled();
      }
    );

    it('remove on unsubscribe subscription created', () => {
      const event = {
        name: 'sequence',
        options: {
          sequenceIds: ['62e76f79a1016bb8a303ef6b'],
          ids: ['62e76f79a1016bb8a303ef6b'],
          onlyNew: true,
        },
      };
      pub._subscriptions = [];
      pub.subscribeViaCallbacks(event.name, event.options);
      pub.unsubscribeEventFromCallbacks([event]);
      expect(pub._subscriptions).toEqual([]);
    });

    it('remove on unsubscribe subscription created without options', () => {
      const event = {
        name: 'orgs',
      };
      pub._subscriptions = [];
      pub.subscribeViaCallbacks(event.name);
      pub.unsubscribeEventFromCallbacks([event]);
      expect(pub._subscriptions).toEqual([]);
    });
  });
});
