import { Focus } from './focus';
import { Point } from './point';
import { Range } from './range';
import { TableCell } from './table-cell';
import { TableRow } from './table-row';

/**
 * A `Table` object represents a table.
 *
 * @private
 */
export class Table {
  private readonly _rows: TableRow[];

  /**
   * Creates a new `Table` object.
   *
   * @param rows - An array of rows that the table contains.
   */
  constructor(rows: TableRow[]) {
    this._rows = rows.slice();
  }

  /**
   * Gets the number of rows in the table.
   *
   * @returns The number of rows.
   */
  public getHeight(): number {
    return this._rows.length;
  }

  /**
   * Gets the maximum width of the rows in the table.
   *
   * @returns The maximum width of the rows.
   */
  public getWidth(): number {
    return this._rows
      .map((row) => row.getWidth())
      .reduce((x, y) => Math.max(x, y), 0);
  }

  /**
   * Gets the width of the header row.
   * Assumes that it is called on a valid table with a header row.
   *
   * @returns The width of the header row
   */
  public getHeaderWidth(): number {
    return this._rows[0].getWidth();
  }

  /**
   * Gets the rows that the table contains.
   *
   * @returns An array of the rows.
   */
  public getRows(): TableRow[] {
    return this._rows.slice();
  }

  /**
   * Gets the delimiter row of the table.
   *
   * @returns The delimiter row; `undefined` if there is not delimiter row.
   */
  public getDelimiterRow(): TableRow | undefined {
    const row = this._rows[1];
    if (row === undefined) {
      return undefined;
    }
    if (row.isDelimiter()) {
      return row;
    }
    return undefined;
  }

  /**
   * Gets a cell at the specified index.
   *
   * @param rowIndex - Row index of the cell.
   * @param columnIndex - Column index of the cell.
   * @returns The cell at the specified index; `undefined` if not found.
   */
  public getCellAt(
    rowIndex: number,
    columnIndex: number,
  ): TableCell | undefined {
    const row = this._rows[rowIndex];
    if (row === undefined) {
      return undefined;
    }
    return row.getCellAt(columnIndex);
  }

  /**
   * Gets the cell at the focus.
   *
   * @param focus - Focus object.
   * @returns The cell at the focus; `undefined` if not found.
   */
  public getFocusedCell(focus: Focus): TableCell | undefined {
    return this.getCellAt(focus.row, focus.column);
  }

  /**
   * Converts the table to an array of text representations of the rows.
   *
   * @returns An array of text representations of the rows.
   */
  public toLines(): string[] {
    return this._rows.map((row) => row.toText());
  }

  /**
   * Computes a focus from a point in the text editor.
   *
   * @param pos - A point in the text editor.
   * @param rowOffset - The row index where the table starts in the text editor.
   * @returns A focus object that corresponds to the specified point;
   * `undefined` if the row index is out of bounds.
   */
  public focusOfPosition(pos: Point, rowOffset: number): Focus | undefined {
    const rowIndex = pos.row - rowOffset;
    const row = this._rows[rowIndex];
    if (row === undefined) {
      return undefined;
    }
    if (pos.column < row.marginLeft.length + 1) {
      return new Focus(rowIndex, -1, pos.column);
    }
    const cellWidths = row.getCells().map((cell) => cell.rawContent.length);
    let columnPos = row.marginLeft.length + 1; // left margin + a pipe
    let columnIndex = 0;
    for (; columnIndex < cellWidths.length; columnIndex++) {
      if (columnPos + cellWidths[columnIndex] + 1 > pos.column) {
        break;
      }
      columnPos += cellWidths[columnIndex] + 1;
    }
    const offset = pos.column - columnPos;
    return new Focus(rowIndex, columnIndex, offset);
  }

  /**
   * Computes a position in the text editor from a focus.
   *
   * @param focus - A focus object.
   * @param rowOffset - The row index where the table starts in the text editor.
   * @returns A position in the text editor that corresponds to the focus;
   * `undefined` if the focused row  is out of the table.
   */
  public positionOfFocus(focus: Focus, rowOffset: number): Point | undefined {
    const row = this._rows[focus.row];
    if (row === undefined) {
      return undefined;
    }
    const rowPos = focus.row + rowOffset;
    if (focus.column < 0) {
      return new Point(rowPos, focus.offset);
    }
    const cellWidths = row.getCells().map((cell) => cell.rawContent.length);
    const maxIndex = Math.min(focus.column, cellWidths.length);
    let columnPos = row.marginLeft.length + 1;
    for (let columnIndex = 0; columnIndex < maxIndex; columnIndex++) {
      columnPos += cellWidths[columnIndex] + 1;
    }
    return new Point(rowPos, columnPos + focus.offset);
  }

  /**
   * Computes a selection range from a focus.
   *
   * @param focus - A focus object.
   * @param rowOffset - The row index where the table starts in the text editor.
   * @returns A range to be selected that corresponds to the focus;
   * `undefined` if the focus does not specify any cell or the specified cell is empty.
   */
  public selectionRangeOfFocus(
    focus: Focus,
    rowOffset: number,
  ): Range | undefined {
    const row = this._rows[focus.row];
    if (row === undefined) {
      return undefined;
    }
    const cell = row.getCellAt(focus.column);
    if (cell === undefined) {
      return undefined;
    }
    if (cell.content === '') {
      return undefined;
    }
    const rowPos = focus.row + rowOffset;
    const cellWidths = row.getCells().map((cell) => cell.rawContent.length);
    let columnPos = row.marginLeft.length + 1;
    for (let columnIndex = 0; columnIndex < focus.column; columnIndex++) {
      columnPos += cellWidths[columnIndex] + 1;
    }
    columnPos += cell.paddingLeft;
    return new Range(
      new Point(rowPos, columnPos),
      new Point(rowPos, columnPos + cell.content.length),
    );
  }
}
