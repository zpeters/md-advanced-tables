import { Point } from './point';
import { Range } from './range';

/**
 * The `ITextEditor` represents an interface to a text editor.
 *
 * @interface
 */
export class ITextEditor {
  /**
   * Gets the current cursor position.
   *
   * @returns A point object that represents the cursor position.
   */
  public getCursorPosition(): Point {
    throw new Error('Not implemented: getCursorPosition');
  }

  /**
   * Sets the cursor position to a specified one.
   */
  public setCursorPosition(pos: Point): void {
    throw new Error('Not implemented: setCursorPosition');
  }

  /**
   * Sets the selection range.
   * This method also expects the cursor position to be moved as the end of the selection range.
   */
  public setSelectionRange(range: Range): void {
    throw new Error('Not implemented: setSelectionRange');
  }

  /**
   * Gets the last row index of the text editor.
   */
  public getLastRow(): number {
    throw new Error('Not implemented: getLastRow');
  }

  /**
   * Checks if the editor accepts a table at a row to be editted.
   * It should return `false` if, for example, the row is in a code block (not Markdown).
   *
   * @param row - A row index in the text editor.
   * @returns `true` if the table at the row can be editted.
   */
  public acceptsTableEdit(row: number): boolean {
    throw new Error('Not implemented: acceptsTableEdit');
  }

  /**
   * Gets a line string at a row.
   *
   * @param row - Row index, starts from `0`.
   * @returns The line at the specified row.
   * The line must not contain an EOL like `"\n"` or `"\r"`.
   */
  public getLine(row: number): string {
    throw new Error('Not implemented: getLine');
  }

  /**
   * Inserts a line at a specified row.
   *
   * @param row - Row index, starts from `0`.
   * @param line - A string to be inserted.
   * This must not contain an EOL like `"\n"` or `"\r"`.
   */
  public insertLine(row: number, line: string): void {
    throw new Error('Not implemented: insertLine');
  }

  /**
   * Deletes a line at a specified row.
   *
   * @param row - Row index, starts from `0`.
   */
  public deleteLine(row: number): void {
    throw new Error('Not implemented: deleteLine');
  }

  /**
   * Replace lines in a specified range.
   *
   * @param startRow - Start row index, starts from `0`.
   * @param endRow - End row index.
   * Lines from `startRow` to `endRow - 1` is replaced.
   * @param lines - An array of string.
   * Each strings must not contain an EOL like `"\n"` or `"\r"`.
   */
  public replaceLines(startRow: number, endRow: number, lines: string[]): void {
    throw new Error('Not implemented: replaceLines');
  }

  /**
   * Batches multiple operations as a single undo/redo step.
   *
   * @param func - A callback function that executes some operations on the text editor.
   */
  public transact(func: () => void): void {
    throw new Error('Not implemented: transact');
  }
}
