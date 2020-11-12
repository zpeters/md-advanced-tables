import { IToken } from 'ebnf';
import { map, range } from 'lodash';
import { Table } from '../table';
import { Value, Arity } from './calc';
import { newComponent } from './component';

export interface Cell {
  row: number;
  column: number;
}

export class Range {
  public readonly cellTL: Cell; // top left
  public readonly cellBR: Cell; // bottom right

  constructor(cell1: Cell, cell2: Cell) {
    let minRow = Math.min(cell1.row, cell2.row);
    let minColumn = Math.min(cell1.column, cell2.column);
    let maxRow = Math.max(cell1.row, cell2.row);
    let maxColumn = Math.max(cell1.column, cell2.column);

    this.cellTL = { row: minRow, column: minColumn };
    this.cellBR = { row: maxRow, column: maxColumn };
  }

  public readonly getValue = (table: Table): Value => {
    return new Value(
      map(range(this.cellTL.row, this.cellBR.row + 1), (row): string[] =>
        map(
          range(this.cellTL.column, this.cellBR.column + 1),
          (col): string => table.getCellAt(row, col)?.toText() || '',
        ),
      ),
    );
  };

  /**
   * getArity returns the dimensions described by the Range, in rows/columns.
   */
  public readonly getArity = (): Arity => {
    // cellBR is inclusive, so add 1 to each dimension
    return {
      rows: this.cellBR.row - this.cellTL.row + 1,
      cols: this.cellBR.column - this.cellTL.column + 1,
    };
  };

  /**
   * merge takes the provided values, and attempts to place them in the
   * location described by this Range in the provided table.
   */
  public readonly merge = (table: Table, value: Value): Table => {
    let newTable = table;
    let valueRow = 0;
    let valueColumn = 0;
    for (let r = this.cellTL.row; r <= this.cellBR.row; r++) {
      valueColumn = 0;
      for (let c = this.cellTL.column; c <= this.cellBR.column; c++) {
        const val = value.get(valueRow, valueColumn);
        newTable = newTable.setCellAt(r, c, val.toString());
        valueColumn++;
      }
      valueRow++;
    }

    return newTable;
  };
}

export const newRange = (ast: IToken, table: Table): Range => {
  if (ast.type !== 'range') {
    throw Error('Invalid AST token type of ' + ast.type);
  }
  if (ast.children.length !== 2) {
    throw Error('Unexpected children length in Range: ' + ast.children.length);
  }

  // TODO: A range may not be a cell to a cell
  // @2$3..@3$4
  // @2..@>
  // $1..$2
  // But you can not have mismatch
  // @2$3..@3
  // @2..$3

  const start = newComponent(ast.children[0], table);
  const end = newComponent(ast.children[1], table);

  return newRangeBetween(start, end, table);
};

/**
 * newRangeBetween creates a single Range which encompases the two provided.
 */
const newRangeBetween = (start: Range, end: Range, table: Table): Range => {
  const topRow = Math.min(start.cellTL.row, end.cellTL.row);
  const leftCol = Math.min(start.cellTL.column, end.cellTL.column);

  const bottomRow = Math.max(start.cellBR.row, end.cellBR.row);
  const rightCol = Math.max(start.cellBR.column, end.cellBR.column);

  return new Range(
    { row: topRow, column: leftCol },
    { row: bottomRow, column: rightCol },
  );
};
