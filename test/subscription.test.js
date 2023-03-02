import Subscription from '../src/subscription';

describe('Subscription', () => {
  const conn = {
    _send: jest.fn(),
    on: jest.fn(),
    _isConnected: true,
  };

  it('constructs', () => {
    const sub = new Subscription('foo', 'fooSub', {}, conn);
    expect(sub).toBeInstanceOf(Subscription);
  });

  it('sends a subscribe message when started', () => {
    new Subscription('foo', 'fooSub', {}, conn);
    expect(conn._send).toHaveBeenCalledWith({
      msg: 'sub',
      id: 'foo',
      name: 'fooSub',
      params: {},
    });
    expect(conn.on).toHaveBeenNthCalledWith(1, 'ready', expect.any(Function));
    expect(conn.on).toHaveBeenNthCalledWith(2, 'nosub', expect.any(Function));
  });

  it('should call resolve handler on `ready` event', () => {
    const sub = new Subscription('foo', 'fooSub', {}, conn);
    // Spy on resolve handler function that is used for `ready` event
    jest.spyOn(sub, '_boundWhenReadyResolver');
    // We subscribe to 'ready' event with `_boundWhenReadyResolver`
    sub.whenReady();
    // Emit `ready` event to verify that handler is called
    sub.emit('ready');
    expect(sub._boundWhenReadyResolver).toBeCalled();
  });

  it('should call reject handler on `nosub` event', () => {
    const sub = new Subscription('foo', 'fooSub', {}, conn);
    // Spy on reject handler function that is used for `unsub` event
    jest.spyOn(sub, '_boundWhenReadyRejecter');
    // We subscribe to 'unsub' event with `_boundWhenReadyRejecter`
    sub.whenReady();
    // Emit 'nosub' event to verify that handler is called
    sub.emit('nosub');
    expect(sub._boundWhenReadyRejecter).toBeCalled();
  });

  it('should trigger `ready` resolver after reconnection', () => {
    const sub = new Subscription('foo', 'fooSub', {}, conn);
    // Let's suppose we call `whenReady`, but connection is failing at this point
    sub.whenReady();
    // After it reconnects, we reset all current subscriptions in `PublicationClient`
    sub._reset();
    // Resetting shouldn't affect resolve function if `whenReady` is pending
    expect(sub._whenReadyResolveFn).not.toBeNull();
    // After reconnection `ready` event is emitted. Subscription handles it and triggers
    // `_whenReadyResolveFn`, which shouldn't cause `TypeError` (as it would for `null`)
    expect(() => {
      sub.emit('ready');
    }).not.toThrow(TypeError);
  });

  it('should not trigger error if `whenReady` is called multiple times', () => {
    const sub = new Subscription('foo', 'fooSub', {}, conn);
    // Calling more than once to subscribe multiple times to the `ready` event
    sub.whenReady();
    sub.whenReady();
    // Triggering `ready` shouldn't cause errors
    expect(() => {
      sub.emit('ready');
    }).not.toThrow(TypeError);
  });
});
