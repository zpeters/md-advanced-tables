import { err, ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { Cell, checkChildLength, checkType, ValueProvider } from './ast_utils';
import { Column } from './column';
import { Reference } from './reference';
import { Value } from './results';
import { Row } from './row';
import { IToken } from 'ebnf';
import { flatMap, map, range } from 'lodash';

export class Range implements ValueProvider {
  private readonly startRow: Row | undefined;
  private readonly startColumn: Column | undefined;
  private readonly endRow: Row | undefined;
  private readonly endColumn: Column | undefined;

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
    const startColumn = this.startColumn
      ? this.startColumn.getIndex(currentCell)
      : currentCell.column;

    // if the column is provided in the first set, but not the second, copy it
    const endColumn = this.endColumn
      ? this.endColumn.getIndex(currentCell)
      : startColumn;

    const startRow = this.startRow
      ? this.startRow.getIndex(currentCell)
      : currentCell.row;
    const endRow = this.endRow
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

    const startRowIndex = this.startRow.getAbsoluteIndex();
      const endRowIndex = this.endRow.getAbsoluteIndex();
      const startColumnIndex = this.startColumn.getAbsoluteIndex();
      const endColumnIndex = endColumn.getAbsoluteIndex();

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

    const minRow = Math.min(startRowIndex.value, endRowIndex.value);
      const maxRow = Math.max(startRowIndex.value, endRowIndex.value);
      const minColumn = Math.min(startColumnIndex.value, endColumnIndex.value);
      const maxColumn = Math.max(startColumnIndex.value, endColumnIndex.value);

    return ok(
      flatMap(range(minRow, maxRow + 1), (rowNum): Cell[] =>
        range(minColumn, maxColumn + 1).map(
          (colNum): Cell => ({ row: rowNum, column: colNum }),
        ),
      ),
    );
  };
}
