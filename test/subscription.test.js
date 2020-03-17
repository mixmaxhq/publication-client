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
});
