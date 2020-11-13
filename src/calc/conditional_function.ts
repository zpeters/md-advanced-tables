import { IToken } from 'ebnf';
import { Table } from '../table';
import { Source, Value } from './calc';

export class ConditionalFunctionCall {
  private predicate: Predicate;
  private leftSource: Source;
  private rightSource: Source;

  constructor(ast: IToken, table: Table) {
    if (ast.type !== 'conditional_function_call') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 3) {
      throw Error('Unexpected children length in ConditionalFunctionCall');
    }

    if (ast.children[0].type !== 'predicate') {
      throw Error('Unexpected AST token type of ' + ast.children[0].type);
    }

    this.predicate = new Predicate(ast.children[0], table);
    this.leftSource = new Source(ast.children[1], table);
    this.rightSource = new Source(ast.children[2], table);
  }

  public getValue = (table: Table): Value => {
    return this.predicate.eval(table)
      ? this.leftSource.getValue(table)
      : this.rightSource.getValue(table);
  };
}

class Predicate {
  private leftSource: Source;
  private rightSource: Source;
  private operator: string;

  constructor(ast: IToken, table: Table) {
    if (ast.type !== 'predicate') {
      throw Error('Invalid AST token type of ' + ast.type);
    }

    if (ast.children.length !== 3) {
      throw Error('Unexpected children length in Predicate');
    }

    this.operator = ast.children[1].text;
    this.leftSource = new Source(ast.children[0], table);
    this.rightSource = new Source(ast.children[2], table);
  }

  public eval = (table: Table): boolean => {
    const leftData = this.leftSource.getValue(table);
    const rightData = this.rightSource.getValue(table);

    const leftArity = leftData.getArity();
    const rightArity = rightData.getArity();

    if (leftArity.cols != 1 || leftArity.rows != 1) {
      throw Error(
        'Can only use comparison operator on a single cell. Left side is not a cell.',
      );
    }
    if (rightArity.cols != 1 || rightArity.rows != 1) {
      throw Error(
        'Can only use comparison operator on a single cell. Right side is not a cell.',
      );
    }

    const leftVal = leftData.val[0][0];
    const rightVal = rightData.val[0][0];

    switch (this.operator) {
      case '>':
        return leftVal > rightVal;
      case '>=':
        return leftVal >= rightVal;
      case '<':
        return leftVal < rightVal;
      case '<=':
        return leftVal <= rightVal;
      case '==':
        return leftVal === rightVal;
      case '!=':
        return leftVal !== rightVal;
      default:
        throw Error('Invalid conditional operator: ' + this.operator);
    }
  };
}
