const { isMatch } = require('../src/utils');

describe('utils', () => {
  describe('isMatch', () => {
    it('should match all properties', () => {
      expect(isMatch({ a: 1, b: true, c: 'dont care' }, { a: 1, b: true })).toBe(true);
      expect(isMatch({ a: 1, b: false, c: 'dont care' }, { a: 1, b: true })).toBe(false);
    });

    it('should handle the $elemMatch selector', () => {
      const match = { a: { $elemMatch: { x: 2 } } };
      expect(isMatch({ a: [{ x: 1 }, { x: 2 }], c: 'dont care' }, match)).toBe(true);
      expect(isMatch({ a: [{ x: 1 }, { x: 3 }], c: 'dont care' }, match)).toBe(false);
    });

    it('should handle the $ne selector', () => {
      const match = { a: { $ne: undefined } };
      expect(isMatch({ a: 1, c: 'dont care' }, match)).toBe(true);
      expect(isMatch({ c: 'dont care' }, match)).toBe(false);
    });
  });
});
