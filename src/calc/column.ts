import { IToken } from 'ebnf';

enum ColumnSymbol {
  First = '<',
  Last = '>',
}

export const newColumn = (ast: IToken): AbsoluteColumn | RelativeColumn => {
  if (ast.type != 'column') {
    throw 'Invalid AST token type of ' + ast.type;
  }
  if (ast.children.length != 1) {
    throw 'Unexpected children length in Column';
  }

  const child = ast.children[0];
  switch (child.type) {
    case 'real':
      return new AbsoluteColumn(child);
    case 'relative_row':
      return new RelativeColumn(child);
    default:
      throw 'Unexpected column type ' + child.type;
  }
};

export class RelativeColumn {
  private offset: number;
  private anchor: ColumnSymbol;

  constructor(ast: IToken) {
    if (ast.type != 'relative_column') {
      throw 'Invalid AST token type of ' + ast.type;
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
        throw 'Invalid relative column symbol';
    }

    if (ast.children.length != 1) {
      throw 'Unexpected children length in RelativeColumn';
    }
    const child = ast.children[0];
    if (child.type != 'offset') {
      throw 'Unexpected child type in RelativeColumn of ' + child.type;
    }

    this.offset = +child.text;
  }
}

export class AbsoluteColumn {
  private index: number;

  constructor(ast: IToken) {
    if (ast.type != 'real') {
      throw 'Invalid AST token type of ' + ast.type;
    }
    if (ast.children.length != 1) {
      throw 'Unexpected children length in AbsoluteColumn';
    }
    const child = ast.children[0];
    if (child.type != 'int') {
      throw 'Unexpected child type in AbsoluteColumn of ' + child.type;
    }

    this.index = +child.text;
  }
}
