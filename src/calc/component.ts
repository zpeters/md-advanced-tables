import { err, ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { checkChildLength, checkType } from './calc';
import { Range } from './range';
import { IToken } from 'ebnf';

export const newComponent = (
  ast: IToken,
  table: Table,
): Result<Range, Error> => {
  const typeErr = checkType(ast, 'component');
  if (typeErr) {
    return err(typeErr);
  }

  let row: AbsoluteRow | undefined = undefined;
  let column: AbsoluteColumn | undefined = undefined;

  for (let i = 0; i < ast.children.length; i++) {
    const child = ast.children[i];
    switch (child.type) {
      case 'row':
        if (row !== undefined) {
          return err(
            Error(
              'Component may only have at most 1 row, more than 1 provided',
            ),
          );
        }
        const createdRow = newRow(child, table);
        if (createdRow.isErr()) {
          return err(createdRow.error);
        }
        row = createdRow.value;
        break;
      case 'column':
        if (column !== undefined) {
          return err(
            Error(
              'Component may only have at most 1 column, more than 1 provided',
            ),
          );
        }
        const createdCol = newColumn(child, table);
        if (createdCol.isErr()) {
          return err(createdCol.error);
        }
        column = createdCol.value;
        break;
    }
  }

  try {
    if (row && column) {
      return ok(
        new Range(
          { row: row.index, column: column.index },
          { row: row.index, column: column.index },
        ),
      );
    }

    // Range values are inclusive, so remove one from the
    // table height and width.

    if (row) {
      return ok(
        new Range(
          { row: row.index, column: 0 },
          { row: row.index, column: table.getWidth() - 1 },
        ),
      );
    }

    if (column) {
      return ok(
        new Range(
          { row: 0, column: column.index },
          { row: table.getHeight() - 1, column: column.index },
        ),
      );
    }
  } catch (error) {
    return err(error);
  }

  return err(Error('Cannot create a component without a row, column, or both'));
};

enum ColumnSymbol {
  First = '<',
  Last = '>',
}

export const newColumn = (
  ast: IToken,
  table: Table,
): Result<AbsoluteColumn, Error> => {
  const typeError = checkType(ast, 'column');
  if (typeError) {
    return err(typeError);
  }

  const lengthError = checkChildLength(ast, 1);
  if (lengthError) {
    return err(lengthError);
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      try {
        return ok(new AbsoluteColumn(child));
      } catch (error) {
        return err(error);
      }
    case 'relative_column':
      return relativeColumnAsAbsoluteColumn(child, table);
    default:
      return err(Error('Unexpected column type ' + child.type));
  }
};

const relativeColumnAsAbsoluteColumn = (
  ast: IToken,
  table: Table,
): Result<AbsoluteColumn, Error> => {
  const typeError = checkType(ast, 'relative_column');
  if (typeError) {
    return err(typeError);
  }

  if (ast.children.length > 1) {
    return err(
      new Error(
        `Formula element '${ast.text}' was expected to have 0 or 1 ` +
          `elements, but had ${ast.children.length}`,
      ),
    );
  }

  let offset = 0;
  if (ast.children.length === 1) {
    const child = ast.children[0];
    const childTypeError = checkType(child, 'offset');
    if (childTypeError) {
      return err(childTypeError);
    }
    offset = parseInt(child.text);
  }

  // Values used below have been converted to zero offset

  try {
    switch (ast.text[0]) {
      case ColumnSymbol.First:
        return ok(new AbsoluteColumn(0 + offset));
      case ColumnSymbol.Last:
        return ok(new AbsoluteColumn(table.getWidth() - 1 + offset));
      default:
        return err(
          Error(`Symbol ${ast.text[0]} is not valid for a relative column`),
        );
    }
  } catch (error) {
    return err(error);
  }
};

class AbsoluteColumn {
  public readonly index: number;

  constructor(ast: IToken);
  constructor(index: number);
  constructor(value: IToken | number) {
    if (typeof value === 'number') {
      this.index = value;
      return;
    }

    const ast = value;

    const typeError = checkType(ast, 'real');
    if (typeError) {
      throw typeError;
    }

    const lengthError = checkChildLength(ast, 1);
    if (lengthError) {
      throw lengthError;
    }

    const child = ast.children[0];
    const childTypeError = checkType(child, 'int');
    if (childTypeError) {
      throw childTypeError;
    }

    // account for internal locations being 0 indexed
    this.index = +child.text - 1;
  }
}

enum RowSymbol {
  Header = 'I',
  First = '<',
  Last = '>',
}

export const newRow = (
  ast: IToken,
  table: Table,
): Result<AbsoluteRow, Error> => {
  const typeError = checkType(ast, 'row');
  if (typeError) {
    return err(typeError);
  }

  const lengthError = checkChildLength(ast, 1);
  if (lengthError) {
    return err(lengthError);
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      try {
        return ok(new AbsoluteRow(child));
      } catch (error) {
        return err(error);
      }
    case 'relative_row':
      return relativeRowAsAbsoluteRow(child, table);
    default:
      return err(Error('Unexpected row type ' + child.type));
  }
};

const relativeRowAsAbsoluteRow = (
  ast: IToken,
  table: Table,
): Result<AbsoluteRow, Error> => {
  const typeError = checkType(ast, 'relative_row');
  if (typeError) {
    return err(typeError);
  }

  if (ast.children.length > 1) {
    return err(
      new Error(
        `Formula element '${ast.text}' was expected to have 0 or 1 ` +
          `elements, but had ${ast.children.length}`,
      ),
    );
  }

  let offset = 0;
  if (ast.children.length === 1) {
    const child = ast.children[0];
    const childTypeError = checkType(child, 'offset');
    if (childTypeError) {
      return err(childTypeError);
    }
    offset = parseInt(child.text);
  }

  // Values used below have been converted to zero offset

  try {
    switch (ast.text[0]) {
      case RowSymbol.First:
        return ok(new AbsoluteRow(0 + offset));
      case RowSymbol.Last:
        return ok(new AbsoluteRow(table.getHeight() - 1 + offset));
      case RowSymbol.Header:
        if (table.getRows().length >= 2) {
          return ok(new AbsoluteRow(1 + offset));
        }
        return err(Error('Table does not have a heading delimiter line'));
      default:
        return err(
          Error(`Symbol ${ast.text[0]} is not valid for a relative row`),
        );
    }
  } catch (error) {
    return err(error);
  }
};

class AbsoluteRow {
  public readonly index: number;

  constructor(index: number);
  constructor(ast: IToken);
  constructor(value: IToken | number) {
    if (typeof value === 'number') {
      this.index = value;
      return;
    }

    const ast = value;

    const typeError = checkType(ast, 'real');
    if (typeError) {
      throw typeError;
    }

    const lengthError = checkChildLength(ast, 1);
    if (lengthError) {
      throw lengthError;
    }

    const child = ast.children[0];
    const childTypeError = checkType(child, 'int');
    if (childTypeError) {
      throw childTypeError;
    }

    // account for internal locations being 0 indexed
    this.index = +child.text - 1;
  }
}
