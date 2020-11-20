import { Table } from '..';
import { err, ok, Result } from '../neverthrow/neverthrow';
import { Source } from './calc';
import { Value } from './results';
import { IToken } from 'ebnf';
import { map } from 'lodash';

export class AlgebraicOperation {
  private readonly leftSource: Source;
  private readonly rightSource: Source;
  private readonly operator: string;

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

    try {
      this.leftSource = new Source(ast.children[0], table);
      this.rightSource = new Source(ast.children[2], table);
    } catch (error) {
      // Still in a constructor, so nothing we can do but throw again
      throw error;
    }
  }

  public getValue = (table: Table): Result<Value, Error> => {
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
        return err(Error('Invalid algbraic operator: ' + this.operator));
    }
  };

  /**
   * withCellAndRange aids in performing a numeric operation on cells in a
   * table where at least one of the two operands is a single cell. Optionally,
   * the two sides of the operation can be swapped, so the single cell is
   * always on the right.
   */
  private readonly withCellAndRange = (
    table: Table,
    name: string,
    canFlip: boolean,
    fn: (left: number, right: number) => number,
  ): Result<Value, Error> => {
    let leftValue = this.leftSource.getValue(table);
    if (leftValue.isErr()) {
      return err(leftValue.error);
    }
    let rightValue = this.rightSource.getValue(table);
    if (rightValue.isErr()) {
      return err(rightValue.error);
    }

    const leftArity = leftValue.value.getArity();
    const rightArity = rightValue.value.getArity();

    if (!rightArity.isCell()) {
      if (canFlip) {
        if (leftArity.isCell()) {
          [leftValue, rightValue] = [rightValue, leftValue];
        } else {
          return err(
            Error(
              `At least one operand in algebraic "${name}" must be a single cell.`,
            ),
          );
        }
      } else {
        return err(
          Error(`Right operand in algebraic "${name}" must be a single cell.`),
        );
      }
    }
    const rightCellValue = parseFloat(rightValue.value.get(0, 0));

    const result: string[][] = map(
      leftValue.value.val,
      (currentRow: string[]): string[] =>
        map(currentRow, (currentCell: string): string => {
          const leftCellValue = parseFloat(currentCell);
          return fn(leftCellValue, rightCellValue).toString();
        }),
    );
    return ok(new Value(result));
  };

  private readonly add = (table: Table): Result<Value, Error> =>
    this.withCellAndRange(
      table,
      'add',
      true,
      (left, right): number => left + right,
    );

  private readonly subtract = (table: Table): Result<Value, Error> =>
    this.withCellAndRange(
      table,
      'subtract',
      false,
      (left, right): number => left - right,
    );

  private readonly multiply = (table: Table): Result<Value, Error> =>
    this.withCellAndRange(
      table,
      'multiply',
      true,
      (left, right): number => left * right,
    );

  private readonly divide = (table: Table): Result<Value, Error> =>
    this.withCellAndRange(
      table,
      'divide',
      false,
      (left, right): number => left / right,
    );
}
