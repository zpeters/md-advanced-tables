import { ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { Cell, checkType, ValueProvider } from './ast_utils';
import { Value } from './results';
import { IToken } from 'ebnf';

export class Constant implements ValueProvider {
  private readonly value: number;

  constructor(ast: IToken, table: Table) {
    const typeErr = checkType(ast, 'real', 'float');
    if (typeErr) {
      throw typeErr;
    }

    const multiplier = ast.text[0] === '-' ? -1 : 1;
    if (ast.type === 'real') {
      this.value = multiplier * parseInt(ast.children[0].text);
    } else {
      this.value =
        multiplier *
        parseFloat(ast.children[0].text + '.' + ast.children[1].text);
    }
  }

  public getValue(table: Table, currentCell: Cell): Result<Value, Error> {
    return ok(new Value([[this.value.toString()]]));
  }
}
