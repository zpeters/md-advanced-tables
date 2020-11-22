import { err, ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { Cell, checkChildLength, checkType, ValueProvider } from './ast_utils';
import { Reference } from './reference';
import { Value } from './results';
import { IToken } from 'ebnf';
import { flatMap, map, range } from 'lodash';
import { Row } from './row';
import { Column } from './column';

export class Range implements ValueProvider {
  private startRow: Row | undefined;
  private startColumn: Column | undefined;
  private endRow: Row | undefined;
  private endColumn: Column | undefined;

  constructor(ast: IToken, table: Table) {
    let typeErr = checkType(ast, 'range');
    if (typeErr) {
      throw typeErr;
    }
    let lengthError = checkChildLength(ast, 2);
    if (lengthError) {
      throw lengthError;
    }

    const startChild = ast.children[0];
    const endChild = ast.children[1];

    typeErr = checkType(startChild, 'source_reference');
    if (typeErr) {
      throw typeErr;
    }
    typeErr = checkType(endChild, 'source_reference');
    if (typeErr) {
      throw typeErr;
    }
    lengthError = checkChildLength(startChild, 1);
    if (lengthError) {
      throw lengthError;
    }
    lengthError = checkChildLength(endChild, 1);
    if (lengthError) {
      throw lengthError;
    }

    const start = new Reference(startChild.children[0], table);
    const end = new Reference(endChild.children[0], table);

    if ((start.row && !end.row) || (end.row && !start.row)) {
      throw new Error('Range must use references of the same kind');
    }

    // Must provide at least a row or a column, but if the first value has a
    // column but the second does not, then copy the first col to second.
    if (!start.row && !start.column) {
      console.log(start);
      throw new Error('Range must have a row or a column defined');
    }

    if (start.row) {
      this.startRow = start.row;
    }
    if (start.column) {
      this.startColumn = start.column;
    }
    if (end.row) {
      this.endRow = end.row;
    }
    if (end.column) {
      this.endColumn = end.column;
    } else {
      this.endColumn = start.column;
    }
  }

  public readonly getValue = (
    table: Table,
    currentCell: Cell,
  ): Result<Value, Error> => {
    // if no start column is provided, copy it from the currentCell
    let startColumn = this.startColumn
      ? this.startColumn.getIndex(currentCell)
      : currentCell.column;

    // if the column is provided in the first set, but not the second, copy it
    let endColumn = this.endColumn
      ? this.endColumn.getIndex(currentCell)
      : startColumn;

    let startRow = this.startRow
      ? this.startRow.getIndex(currentCell)
      : currentCell.row;
    let endRow = this.endRow
      ? this.endRow.getIndex(currentCell)
      : currentCell.row;

    return ok(
      new Value(
        map(range(startRow, endRow + 1), (row): string[] =>
          map(
            range(startColumn, endColumn + 1),
            (col): string => table.getCellAt(row, col)?.toText() || '',
          ),
        ),
      ),
    );
  };

  // There needs to be a distinction between ranges for source and destination
  // a destination range does not allow relative references, which would
  // solve this issue with getting the index.
  public readonly asCells = (): Result<Cell[], Error> => {
    if (!this.startColumn || !this.startRow || !this.endRow) {
      return err(
        new Error('A range used as a desintation must define rows and cells'),
      );
    }

    // If the second reference in the range does not include a column,
    // use the start column.
    let endColumn = this.endColumn;
    if (!endColumn) {
      endColumn = this.startColumn;
    }

    const startRowIndex = this.startRow.getAbsoluteIndex(),
      endRowIndex = this.endRow.getAbsoluteIndex(),
      startColumnIndex = this.startColumn.getAbsoluteIndex(),
      endColumnIndex = endColumn.getAbsoluteIndex();

    if (
      startRowIndex.isErr() ||
      endRowIndex.isErr() ||
      startColumnIndex.isErr() ||
      endColumnIndex.isErr()
    ) {
      return err(
        new Error('A relative range can not be used in a formula destination'),
      );
    }

    const minRow = Math.min(startRowIndex.value, endRowIndex.value),
      maxRow = Math.max(startRowIndex.value, endRowIndex.value),
      minColumn = Math.min(startColumnIndex.value, endColumnIndex.value),
      maxColumn = Math.max(startColumnIndex.value, endColumnIndex.value);

    return ok(
      flatMap(range(minRow, maxRow + 1), (rowNum): Cell[] =>
        range(minColumn, maxColumn + 1).map(
          (colNum): Cell => {
            return { row: rowNum, column: colNum };
          },
        ),
      ),
    );
  };
}
