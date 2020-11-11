import { Table } from '../table';
import { Range } from './range';
import { IToken } from 'ebnf';

export const newComponent = (ast: IToken, table: Table): Range => {
  if (ast.type !== 'component') {
    throw Error('Invalid AST token type of ' + ast.type);
  }

  let row: AbsoluteRow | undefined = undefined;
  let column: AbsoluteColumn | undefined = undefined;

  for (let i = 0; i < ast.children.length; i++) {
    const child = ast.children[i];
    switch (child.type) {
      case 'row':
        if (row !== undefined) {
          throw Error(
            'Component may only have at most 1 row, more than 1 provided',
          );
        }
        row = newRow(child, table);
        break;
      case 'column':
        if (column !== undefined) {
          throw Error(
            'Component may only have at most 1 column, more than 1 provided',
          );
        }
        column = newColumn(child, table);
        break;
    }
  }

  if (row && column) {
    return new Range(
      { row: row.index, column: column.index },
      { row: row.index, column: column.index },
    );
  }

  // Range values are inclusive, so remove one from the
  // table height and width.

  if (row) {
    return new Range(
      { row: row.index, column: 0 },
      { row: row.index, column: table.getWidth() - 1 },
    );
  }

  if (column) {
    return new Range(
      { row: 0, column: column.index },
      { row: table.getHeight() - 1, column: column.index },
    );
  }

  throw Error('Cannot create a component without a row, column, or both');
};

enum ColumnSymbol {
  First = '<',
  Last = '>',
}

export const newColumn = (ast: IToken, table: Table): AbsoluteColumn => {
  if (ast.type !== 'column') {
    throw Error('Invalid AST token type of ' + ast.type);
  }
  if (ast.children.length !== 1) {
    throw Error('Unexpected children length in Column');
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      return new AbsoluteColumn(child);
    case 'relative_row':
      return relativeColumnAsAbsoluteColumn(child, table);
    default:
      throw Error('Unexpected column type ' + child.type);
  }
};

const relativeColumnAsAbsoluteColumn = (
  ast: IToken,
  table: Table,
): AbsoluteColumn => {
  if (ast.type !== 'relative_column') {
    throw Error('Invalid AST token type of ' + ast.type);
  }

  let anchor = ColumnSymbol.First;
  switch (ast.text[0]) {
    case ColumnSymbol.First:
      anchor = ColumnSymbol.First;
      break;
    case ColumnSymbol.Last:
      anchor = ColumnSymbol.Last;
      break;
      break;
    default:
      throw Error('Invalid relative column symbol');
  }

  if (ast.children.length !== 1) {
    throw Error('Unexpected children length in RelativeColumn');
  }
  const child = ast.children[0];
  if (child.type !== 'offset') {
    throw Error('Unexpected child type in RelativeColumn of ' + child.type);
  }
  const offset = +child.text;

  throw Error('relativeColumnAsAbsoluteColumn not implemented');
};

class AbsoluteColumn {
  public readonly index: number;

  constructor(ast: IToken) {
    if (ast.type !== 'real') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 1) {
      throw Error('Unexpected children length in AbsoluteColumn');
    }
    const child = ast.children[0];
    if (child.type !== 'int') {
      throw Error('Unexpected child type in AbsoluteColumn of ' + child.type);
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

export const newRow = (ast: IToken, table: Table): AbsoluteRow => {
  if (ast.type !== 'row') {
    throw Error('Invalid AST token type of ' + ast.type);
  }
  if (ast.children.length !== 1) {
    throw Error('Unexpected children length in Row');
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      return new AbsoluteRow(child);
    case 'relative_row':
      return relativeRowAsAbsoluteRow(child, table);
    default:
      throw Error('Unexpected row type ' + child.type);
  }
};

const relativeRowAsAbsoluteRow = (ast: IToken, table: Table): AbsoluteRow => {
  if (ast.type !== 'relative_row') {
    throw Error('Invalid AST token type of ' + ast.type);
  }

  let anchor = RowSymbol.First;
  switch (ast.text[0]) {
    case RowSymbol.First:
      anchor = RowSymbol.First;
      break;
    case RowSymbol.Last:
      anchor = RowSymbol.Last;
      break;
    case RowSymbol.Header:
      anchor = RowSymbol.Header;
      break;
    default:
      throw Error('Invalid relative row symbol');
  }

  if (ast.children.length !== 1) {
    throw Error('Unexpected children length in RelativeRow');
  }
  const child = ast.children[0];
  if (child.type !== 'offset') {
    throw Error('Unexpected child type in RelativeRow of ' + child.type);
  }
  const offset = +child.text;

  throw Error('relativeRowAsAbsoluteRow not implemented');
};

class AbsoluteRow {
  public readonly index: number;

  constructor(ast: IToken) {
    if (ast.type !== 'real') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 1) {
      throw Error('Unexpected children length in AbsoluteRow');
    }
    const child = ast.children[0];
    if (child.type !== 'int') {
      throw Error('Unexpected child type in AbsoluteRow of ' + child.type);
    }

    // account for internal locations being 0 indexed
    this.index = +child.text - 1;
  }
}
