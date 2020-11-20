import { err, ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { checkChildLength, checkType } from './ast_utils';
import { newComponent } from './component';
import { Arity, Value } from './results';
import { IToken } from 'ebnf';
import { map, range } from 'lodash';

export interface Cell {
  row: number;
  column: number;
}

export class Range {
  public readonly cellTL: Cell; // top left
  public readonly cellBR: Cell; // bottom right

  constructor(cell1: Cell, cell2: Cell) {
    const minRow = Math.min(cell1.row, cell2.row);
    const minColumn = Math.min(cell1.column, cell2.column);
    const maxRow = Math.max(cell1.row, cell2.row);
    const maxColumn = Math.max(cell1.column, cell2.column);

    this.cellTL = { row: minRow, column: minColumn };
    this.cellBR = { row: maxRow, column: maxColumn };
  }

  public readonly getValue = (table: Table): Result<Value, Error> =>
    ok(
      new Value(
        map(range(this.cellTL.row, this.cellBR.row + 1), (row): string[] =>
          map(
            range(this.cellTL.column, this.cellBR.column + 1),
            (col): string => table.getCellAt(row, col)?.toText() || '',
          ),
        ),
      ),
    );

  /**
   * getArity returns the dimensions described by the Range, in rows/columns.
   */
  public readonly getArity = (): Arity =>
    // cellBR is inclusive, so add 1 to each dimension
    new Arity(
      this.cellBR.row - this.cellTL.row + 1,
      this.cellBR.column - this.cellTL.column + 1,
    );

  /**
   * merge takes the provided values, and attempts to place them in the
   * location described by this Range in the provided table.
   */
  public readonly merge = (
    table: Table,
    value: Value,
  ): Result<Table, Error> => {
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

    return ok(newTable);
  };
}

export const newRange = (ast: IToken, table: Table): Result<Range, Error> => {
  const typeErr = checkType(ast, 'range');
  if (typeErr) {
    return err(typeErr);
  }
  const lengthError = checkChildLength(ast, 2);
  if (lengthError) {
    return err(lengthError);
  }

  // TODO: A range may not be a cell to a cell
  // @2$3..@3$4
  // @2..@>
  // $1..$2
  // But you can not have mismatch
  // @2$3..@3
  // @2..$3

  const start = newComponent(ast.children[0], table);
  if (start.isErr()) {
    return start;
  }
  const end = newComponent(ast.children[1], table);
  if (end.isErr()) {
    return end;
  }

  return ok(newRangeBetween(start.value, end.value, table));
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
