import { IToken } from 'ebnf';
import { err, ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { checkChildLength, checkType, Source, Value } from './calc';

export class ConditionalFunctionCall {
  private predicate: Predicate;
  private leftSource: Source;
  private rightSource: Source;

  constructor(ast: IToken, table: Table) {
    let typeError = checkType(ast, 'conditional_function_call');
    if (typeError) {
      throw typeError;
    }

    let lengthError = checkChildLength(ast, 3);
    if (lengthError) {
      throw lengthError;
    }

    try {
      this.predicate = new Predicate(ast.children[0], table);
      this.leftSource = new Source(ast.children[1], table);
      this.rightSource = new Source(ast.children[2], table);
    } catch (error) {
      // Still in a constructor, so nothing we can do but throw again
      throw error;
    }
  }

  public getValue = (table: Table): Result<Value, Error> => {
    return this.predicate
      .eval(table)
      .andThen((predicateResult) =>
        predicateResult
          ? this.leftSource.getValue(table)
          : this.rightSource.getValue(table),
      );
  };
}

class Predicate {
  private leftSource: Source;
  private rightSource: Source;
  private operator: string;

  constructor(ast: IToken, table: Table) {
    let typeError = checkType(ast, 'predicate');
    if (typeError) {
      throw typeError;
    }

    let lengthError = checkChildLength(ast, 3);
    if (lengthError) {
      throw lengthError;
    }

    let childTypeError = checkType(ast.children[1], 'conditional_operator');
    if (childTypeError) {
      throw childTypeError;
    }
    this.operator = ast.children[1].text;

    try {
      this.leftSource = new Source(ast.children[0], table);
      this.rightSource = new Source(ast.children[2], table);
    } catch (error) {
      // Still in a constructor, so nothing we can do but throw again
      throw error;
    }
  }

  public eval = (table: Table): Result<boolean, Error> => {
    const leftData = this.leftSource.getValue(table);
    if (leftData.isErr()) {
      return err(leftData.error);
    }
    const rightData = this.rightSource.getValue(table);
    if (rightData.isErr()) {
      return err(rightData.error);
    }

    const leftArity = leftData.value.getArity();
    const rightArity = rightData.value.getArity();

    if (leftArity.cols != 1 || leftArity.rows != 1) {
      return err(
        Error(
          'Can only use comparison operator on a single cell. Left side is not a cell.',
        ),
      );
    }
    if (rightArity.cols != 1 || rightArity.rows != 1) {
      return err(
        Error(
          'Can only use comparison operator on a single cell. Right side is not a cell.',
        ),
      );
    }

    const leftVal = leftData.value.val[0][0];
    const rightVal = rightData.value.val[0][0];

    switch (this.operator) {
      case '>':
        return ok(leftVal > rightVal);
      case '>=':
        return ok(leftVal >= rightVal);
      case '<':
        return ok(leftVal < rightVal);
      case '<=':
        return ok(leftVal <= rightVal);
      case '==':
        return ok(leftVal === rightVal);
      case '!=':
        return ok(leftVal !== rightVal);
      default:
        return err(Error('Invalid conditional operator: ' + this.operator));
    }
  };
}
