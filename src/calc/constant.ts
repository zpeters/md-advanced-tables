import { ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { Cell, checkType, ValueProvider } from './ast_utils';
import { Value } from './results';
import { IToken } from 'ebnf';

export class Constant implements ValueProvider {
  private readonly value: number;

  constructor(ast: IToken, table: Table) {
    const typeErr = checkType(ast, 'real');
    if (typeErr) {
      throw typeErr;
    }

    const multiplier = ast.text[0] === '-' ? -1 : 1;
    this.value = multiplier * parseInt(ast.children[0].text);
  }

  public getValue(table: Table, currentCell: Cell): Result<Value, Error> {
    return ok(new Value([[this.value.toString()]]));
  }
}
