import { Point } from "../lib/point";
import { Range } from "../lib/range";
import { ITextEditor } from "../lib/text-editor";

// This is a mock class of the ITextEditor interface
export class TextEditor extends ITextEditor {
  private _lines: string[];
  private _cursorPos: Point;
  private _selectionRange: Range | undefined;

  constructor(lines: string[]) {
    super();
    this._lines = lines.slice();
    this._cursorPos = new Point(0, 0);
    this._selectionRange = undefined;
  }

  getCursorPosition() {
    return this._cursorPos;
  }

  setCursorPosition(pos: Point) {
    this._cursorPos = pos;
    this._selectionRange = undefined;
  }

  getSelectionRange(): Range | undefined {
    return this._selectionRange;
  }

  setSelectionRange(range: Range): void {
    this._cursorPos = range.end;
    this._selectionRange = range;
  }

  getLastRow(): number {
    return this._lines.length - 1;
  }

  acceptsTableEdit(row: number): boolean {
    return true;
  }

  getLine(row: number): string {
    return this._lines[row];
  }

  getLines() {
    return this._lines.slice();
  }

  insertLine(row: number, line: string): void {
    this._lines.splice(row, 0, line);
  }

  deleteLine(row: number): void {
    this._lines.splice(row, 1);
  }

  replaceLines(startRow: number, endRow: number, lines: string[]): void {
    this._lines.splice(startRow, endRow - startRow, ...lines);
  }

  transact(func: () => void): void {
    func();
  }
}
