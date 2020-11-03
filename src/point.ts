/**
 * A `Point` represents a point in the text editor.
 */
export class Point {
  /**
   * Row of the point.
   */
  public readonly row: number;

  /**
   * Column of the point.
   */
  public readonly column: number;

  /**
   * Creates a new `Point` object.
   *
   * @param row - Row of the point, starts from 0.
   * @param column - Column of the point, starts from 0.
   */
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  /**
   * Checks if the point is equal to another point.
   */
  public equals(point: Point): boolean {
    return this.row === point.row && this.column === point.column;
  }
}
