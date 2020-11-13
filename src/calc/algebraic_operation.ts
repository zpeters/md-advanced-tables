import { IToken } from 'ebnf';
import { Table } from '..';
import { Source, Value } from './calc';

export class AlgebraicOperation {
  private leftSource: Source;
  private rightSource: Source;
  private operator: string;

  constructor(ast: IToken, table: Table) {
    if (ast.type !== 'algebraic_operation') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 3) {
      throw Error('Unexpected children length in AlgebraicOperation');
    }

    if (ast.children[1].type !== 'algebraic_operator') {
      throw Error(
        'Unexpected type for algebraic operator: ' + ast.children[1].type,
      );
    }
    this.operator = ast.children[1].text;

    this.leftSource = new Source(ast.children[0], table);
    this.rightSource = new Source(ast.children[2], table);
  }

  public getValue = (table: Table): Value => {
    switch (this.operator) {
      case '+':
        return this.add(table);
      case '-':
        return this.subtract(table);
      case '*':
        return this.multiply(table);
      case '/':
        return this.divide(table);
      default:
        throw Error('Invalid algbraic operator: ' + this.operator);
    }
  };

  private add = (table: Table): Value => {
    throw Error('Algebraic operator "add" is not yet implemented');
  };

  private subtract = (table: Table): Value => {
    throw Error('Algebraic operator "subtract" is not yet implemented');
  };

  private multiply = (table: Table): Value => {
    throw Error('Algebraic operator "multiply" is not yet implemented');
  };

  private divide = (table: Table): Value => {
    throw Error('Algebraic operator "divide" is not yet implemented');
  };
}
