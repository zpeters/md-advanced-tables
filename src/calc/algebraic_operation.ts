import { IToken } from 'ebnf';
import { map } from 'lodash';
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

  /**
   * withCellAndRange aids in performing a numeric operation on cells in a
   * table where at least one of the two operands is a single cell. Optionally,
   * the two sides of the operation can be swapped, so the single cell is
   * always on the right.
   */
  private withCellAndRange = (
    table: Table,
    name: string,
    canFlip: boolean,
    fn: (left: number, right: number) => number,
  ): Value => {
    let leftValue = this.leftSource.getValue(table);
    let rightValue = this.rightSource.getValue(table);

    const leftArity = leftValue.getArity();
    const rightArity = rightValue.getArity();

    if (!rightArity.isCell()) {
      if (canFlip) {
        if (leftArity.isCell()) {
          [leftValue, rightValue] = [rightValue, leftValue];
        } else {
          throw Error(
            `At least one operand in algebraic "${name}" must be a single cell.`,
          );
        }
      } else {
        throw Error(
          `Right operand in algebraic "${name}" must be a single cell.`,
        );
      }
    }
    const rightCellValue = parseFloat(rightValue.get(0, 0));

    const result: string[][] = map(
      leftValue.val,
      (currentRow: string[]): string[] => {
        return map(currentRow, (currentCell: string): string => {
          const leftCellValue = parseFloat(currentCell);
          return fn(leftCellValue, rightCellValue).toString();
        });
      },
    );
    return new Value(result);
  };

  private add = (table: Table): Value => {
    return this.withCellAndRange(
      table,
      'add',
      true,
      (left, right): number => left + right,
    );
  };

  private subtract = (table: Table): Value => {
    return this.withCellAndRange(
      table,
      'subtract',
      false,
      (left, right): number => left - right,
    );
  };

  private multiply = (table: Table): Value => {
    return this.withCellAndRange(
      table,
      'multiply',
      true,
      (left, right): number => left * right,
    );
  };

  private divide = (table: Table): Value => {
    return this.withCellAndRange(
      table,
      'divide',
      false,
      (left, right): number => left / right,
    );
  };
}
