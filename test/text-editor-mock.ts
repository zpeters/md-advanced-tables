import { Point } from '../lib/point';
import { Range } from '../lib/range';
import { ITextEditor } from '../lib/text-editor';

// This is a mock class of the ITextEditor interface
export class TextEditor extends ITextEditor {
  private readonly _lines: string[];
  private _cursorPos: Point;
  private _selectionRange: Range | undefined;

  constructor(lines: string[]) {
    super();
    this._lines = lines.slice();
    this._cursorPos = new Point(0, 0);
    this._selectionRange = undefined;
  }

  public getCursorPosition(): Point {
    return this._cursorPos;
  }

  public setCursorPosition(pos: Point): void {
    this._cursorPos = pos;
    this._selectionRange = undefined;
  }

  public getSelectionRange(): Range | undefined {
    return this._selectionRange;
  }

  public setSelectionRange(range: Range): void {
    this._cursorPos = range.end;
    this._selectionRange = range;
  }

  public getLastRow(): number {
    return this._lines.length - 1;
  }

  public acceptsTableEdit(row: number): boolean {
    return true;
  }

  public getLine(row: number): string {
    return this._lines[row];
  }

  public getLines(): string[] {
    return this._lines.slice();
  }

  public insertLine(row: number, line: string): void {
    this._lines.splice(row, 0, line);
  }

  public deleteLine(row: number): void {
    this._lines.splice(row, 1);
  }

  public replaceLines(startRow: number, endRow: number, lines: string[]): void {
    this._lines.splice(startRow, endRow - startRow, ...lines);
  }

  public transact(func: () => void): void {
    func();
  }
}
