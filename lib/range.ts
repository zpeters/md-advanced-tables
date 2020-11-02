import { Point } from "./point";

/**
 * A `Range` object represents a range in the text editor.
 */
export class Range {
  /**
   * The start point of the range.
   */
  public readonly start: Point;

  /**
   * The end point of the range.
   */
  public readonly end: Point;

  /**
   * Creates a new `Range` object.
   *
   * @param start - The start point of the range.
   * @param end - The end point of the range.
   */
  constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }
}
