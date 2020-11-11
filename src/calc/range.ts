import { IToken } from 'ebnf';
import { map, range } from 'lodash';
import { Table } from '../table';
import { Value, Arity } from './calc';
import { newColumn, newRow } from './component';

export interface Cell {
  row: number;
  column: number;
}

export class Range {
  private readonly cellTL: Cell; // top left
  private readonly cellBR: Cell; // bottom right

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
  if (ast.children.length !== 4) {
    throw Error('Unexpected children length in Range');
  }

  const startRow = newRow(ast.children[0], table);
  const startCol = newColumn(ast.children[1], table);
  const endRow = newRow(ast.children[2], table);
  const endCol = newColumn(ast.children[3], table);

  return new Range(
    { row: startRow.index, column: startCol.index },
    { row: endRow.index, column: endCol.index },
  );
};
