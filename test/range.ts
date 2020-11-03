import { Point } from '../src/point';
import { Range } from '../src/range';
import { expect } from 'chai';

/**
 * @test {Range}
 */
describe('Range', () => {
  /**
   * @test {Range.constructor}
   */
  describe('constructor(start, end)', () => {
    it('should create a new Range object', () => {
      const range = new Range(new Point(1, 2), new Point(3, 4));
      expect(range).to.be.an.instanceOf(Range);
    });
  });

  /**
   * @test {Range#start}
   */
  describe('#start', () => {
    it('should get the start point of the range', () => {
      const range = new Range(new Point(1, 2), new Point(3, 4));
      const start = range.start;
      expect(start).to.be.an.instanceOf(Point);
      expect(start.row).to.equal(1);
      expect(start.column).to.equal(2);
    });
  });

  /**
   * @test {Range#end}
   */
  describe('#end', () => {
    it('should get the end point of the range', () => {
      const range = new Range(new Point(1, 2), new Point(3, 4));
      const end = range.end;
      expect(end).to.be.an.instanceOf(Point);
      expect(end.row).to.equal(3);
      expect(end.column).to.equal(4);
    });
  });
});
