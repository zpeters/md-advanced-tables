import { Table } from '../table';
import { Value } from './calc';
import { IToken } from 'ebnf';

export class Component {
  private readonly row: AbsoluteRow | RelativeRow | undefined;
  private readonly column: AbsoluteColumn | RelativeColumn | undefined;

  constructor(ast: IToken) {
    if (ast.type !== 'component') {
      throw Error('Invalid AST token type of ' + ast.type);
    }

    for (let i = 0; i < ast.children.length; i++) {
      const child = ast.children[i];
      switch (child.type) {
        case 'row':
          if (this.row !== undefined) {
            throw Error(
              'Component may only have at most 1 row, more than 1 provided',
            );
          }
          this.row = newRow(child);
          break;
        case 'column':
          if (this.column !== undefined) {
            throw Error(
              'Component may only have at most 1 column, more than 1 provided',
            );
          }
          this.column = newColumn(child);
          break;
      }
    }

    if (!this.row && !this.column) {
      throw Error('Cannot create a component without a row, a column, or both');
    }
  }

  public readonly getValue = (table: Table): Value => {
    if (this.row && !this.column) {
      // Retrieving a full row
      const row = this.row.asAbsoluteRow(table);
    } else if (this.column && !this.row) {
      // Retrieving a full column
      const column = this.column.asAbsoluteColumn(table);
    } else if (this.column && this.row) {
      // Retrieving only a cell
      const row = this.row.asAbsoluteRow(table);
      const column = this.column.asAbsoluteColumn(table);
    } else {
      throw Error('Component description has no valid row or column');
    }

    throw Error('Range.getValue not implement');
  };
}
enum ColumnSymbol {
  First = '<',
  Last = '>',
}

const newColumn = (ast: IToken): AbsoluteColumn | RelativeColumn => {
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
      return new RelativeColumn(child);
    default:
      throw Error('Unexpected column type ' + child.type);
  }
};

class RelativeColumn {
  private readonly offset: number;
  private readonly anchor: ColumnSymbol;

  constructor(ast: IToken) {
    if (ast.type !== 'relative_column') {
      throw Error('Invalid AST token type of ' + ast.type);
    }

    switch (ast.text[0]) {
      case ColumnSymbol.First:
        this.anchor = ColumnSymbol.First;
        break;
      case ColumnSymbol.Last:
        this.anchor = ColumnSymbol.Last;
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

    this.offset = +child.text;
  }

  public readonly asAbsoluteColumn = (table: Table): AbsoluteColumn => {
    throw Error('asAbsoluteColumn not implemented');
  };
}

class AbsoluteColumn {
  private readonly index: number;

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

    this.index = +child.text;
  }

  public readonly asAbsoluteColumn = (table: Table): AbsoluteColumn => this;
}

enum RowSymbol {
  Header = 'I',
  First = '<',
  Last = '>',
}

const newRow = (ast: IToken): AbsoluteRow | RelativeRow => {
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
      return new RelativeRow(child);
    default:
      throw Error('Unexpected row type ' + child.type);
  }
};

class RelativeRow {
  private readonly offset: number;
  private readonly anchor: RowSymbol;

  constructor(ast: IToken) {
    if (ast.type !== 'relative_row') {
      throw Error('Invalid AST token type of ' + ast.type);
    }

    switch (ast.text[0]) {
      case RowSymbol.First:
        this.anchor = RowSymbol.First;
        break;
      case RowSymbol.Last:
        this.anchor = RowSymbol.Last;
        break;
      case RowSymbol.Header:
        this.anchor = RowSymbol.Header;
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

    this.offset = +child.text;
  }

  public readonly asAbsoluteRow = (table: Table): AbsoluteRow => {
    throw Error('asAbsoluteRow not implemented');
  };
}

class AbsoluteRow {
  private readonly index: number;

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

    this.index = +child.text;
  }

  public readonly asAbsoluteRow = (table: Table): AbsoluteRow => this;
}
