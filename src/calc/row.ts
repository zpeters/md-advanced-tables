import { IToken } from 'ebnf';
import { defaultOptions } from '../options';

enum RowSymbol {
  Header = 'I',
  First = '<',
  Last = '>',
}

export const newRow = (ast: IToken): AbsoluteRow | RelativeRow => {
  if (ast.type != 'row') {
    throw 'Invalid AST token type of ' + ast.type;
  }
  if (ast.children.length != 1) {
    throw 'Unexpected children length in Row';
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      return new AbsoluteRow(child);
    case 'relative_row':
      return new RelativeRow(child);
    default:
      throw 'Unexpected row type ' + child.type;
  }
};

export class RelativeRow {
  private offset: number;
  private anchor: RowSymbol;

  constructor(ast: IToken) {
    if (ast.type != 'relative_row') {
      throw 'Invalid AST token type of ' + ast.type;
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
        throw 'Invalid relative row symbol';
    }

    if (ast.children.length != 1) {
      throw 'Unexpected children length in RelativeRow';
    }
    const child = ast.children[0];
    if (child.type != 'offset') {
      throw 'Unexpected child type in RelativeRow of ' + child.type;
    }

    this.offset = +child.text;
  }
}

export class AbsoluteRow {
  private index: number;

  constructor(ast: IToken) {
    if (ast.type != 'real') {
      throw 'Invalid AST token type of ' + ast.type;
    }
    if (ast.children.length != 1) {
      throw 'Unexpected children length in AbsoluteRow';
    }
    const child = ast.children[0];
    if (child.type != 'int') {
      throw 'Unexpected child type in AbsoluteRow of ' + child.type;
    }

    this.index = +child.text;
  }
}
