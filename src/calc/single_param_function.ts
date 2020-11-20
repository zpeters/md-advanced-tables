import { ok, Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { checkChildLength, checkType } from './ast_utils';
import { Source } from './calc';
import { Value } from './results';
import { IToken } from 'ebnf';
import { fill, zipWith } from 'lodash';

export class SingleParamFunctionCall {
  private readonly param: Source;
  private readonly op;

  constructor(ast: IToken, table: Table) {
    const typeError = checkType(ast, 'single_param_function_call');
    if (typeError) {
      throw typeError;
    }

    const lengthError = checkChildLength(ast, 2);
    if (lengthError) {
      throw lengthError;
    }

    let childTypeError = checkType(ast.children[0], 'single_param_function');
    if (childTypeError) {
      throw childTypeError;
    }

    const functionName = ast.children[0].text;
    switch (functionName) {
      case 'sum':
        this.op = sum;
        break;
      case 'vsum':
        this.op = vsum;
        break;
      case 'mean':
        this.op = mean;
        break;
      case 'vmean':
        this.op = vmean;
        break;
      default:
        throw Error('Unknown single param function call: ' + functionName);
    }

    childTypeError = checkType(ast.children[1], 'source');
    if (childTypeError) {
      throw childTypeError;
    }

    this.param = new Source(ast.children[1], table);
  }

  public getValue = (table: Table): Result<Value, Error> =>
    this.param.getValue(table).andThen((sourceData) =>
      // The operation functions do not throw errors because data arity has
      // already been validated.
      ok(this.op(sourceData)),
    );
}

/**
 * Sum all the cells in the input value, producing a single cell output.
 */
const sum = (value: Value): Value => {
  const total = value.val.reduce<number>(
    (runningTotal, currentRow): number =>
      currentRow.reduce<number>(
        (rowTotal, currentCell): number => rowTotal + parseFloat(currentCell),
        runningTotal,
      ),
    0,
  );

  return new Value([[total.toString()]]);
};

/**
 * Returns a row of values where each value is the sum of the corresponding
 * column in the source data.
 */
const vsum = (value: Value): Value => {
  if (value.val.length === 0) {
    return new Value([[]]);
  }

  const numCols = value.val[0].length;
  const totalRow: number[] = value.val.reduce<number[]>(
    (totals, currentRow): number[] => {
      const currentAsNum = currentRow.map((val) => +val);
      return zipWith(totals, currentAsNum, (a, b) => a + b);
    },
    fill(Array(numCols), 0),
  );

  const totalRowAsStr = totalRow.map((val) => val.toString());
  return new Value([totalRowAsStr]);
};

interface Counter {
  total: number;
  count: number;
}

/**
 * Mean of all the cells in the input value, producing a single cell output.
 */
const mean = (value: Value): Value => {
  const { total, count } = value.val.reduce(
    ({ total: runningTotal1, count: currentCount1 }, currentRow): Counter =>
      currentRow.reduce(
        (
          { total: runningTotal2, count: currentCount2 },
          currentCell,
        ): Counter => ({
          total: runningTotal2 + +currentCell,
          count: currentCount2 + 1,
        }),
        { total: runningTotal1, count: currentCount1 },
      ),
    { total: 0, count: 0 },
  );

  return new Value([[(total / count).toString()]]);
};

/**
 * Returns a row of values where each value is the mean of the corresponding
 * column in the source data.
 */
const vmean = (value: Value): Value => {
  if (value.val.length === 0) {
    return new Value([[]]);
  }

  const numCols = value.val[0].length;
  const counterRow: Counter[] = value.val.reduce<Counter[]>(
    (counters, currentRow): Counter[] => {
      const currentAsNum = currentRow.map((val) => +val);
      return zipWith(counters, currentAsNum, (currentCounter, cell) => ({
        total: currentCounter.total + cell,
        count: currentCounter.count + 1,
      }));
    },
    fill(Array(numCols), { total: 0, count: 0 }),
  );

  const meansRow = counterRow.map(({ total, count }) =>
    (total / count).toString(),
  );
  return new Value([meansRow]);
};
