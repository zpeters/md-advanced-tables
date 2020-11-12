import { IToken } from 'ebnf';
import { fill, zipWith } from 'lodash';
import { Table } from '../table';
import { Source, Value } from './calc';

export class SingleParamFunctionCall {
  private readonly param: Source;
  private readonly op;

  constructor(ast: IToken, table: Table) {
    if (ast.type !== 'single_param_function_call') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 2) {
      throw Error('Unexpected children length in SingleParamFunctionCall');
    }

    if (ast.children[0].type !== 'single_param_function') {
      throw Error('Unexpected AST token type of ' + ast.children[0].type);
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

    if (ast.children[1].type !== 'source') {
      throw Error('Unexpected AST token type of ' + ast.children[0].type);
    }
    this.param = new Source(ast.children[1], table);
  }

  public getValue = (table: Table): Value => {
    return this.op(this.param.getValue(table));
  };
}

/**
 * Sum all the cells in the input value, producing a single cell output.
 */
const sum = (value: Value): Value => {
  const total = value.val.reduce<number>(
    (total, currentRow): number =>
      currentRow.reduce<number>((rowTotal, currentCell): number => {
        return rowTotal + parseFloat(currentCell);
      }, total),
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

interface counter {
  total: number;
  count: number;
}

/**
 * Mean of all the cells in the input value, producing a single cell output.
 */
const mean = (value: Value): Value => {
  const { total, count } = value.val.reduce(
    ({ total, count }, currentRow): counter =>
      currentRow.reduce(
        ({ total, count }, currentCell): counter => {
          return { total: total + +currentCell, count: count + 1 };
        },
        { total, count },
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
  const counterRow: counter[] = value.val.reduce<counter[]>(
    (counters, currentRow): counter[] => {
      const currentAsNum = currentRow.map((val) => +val);
      return zipWith(counters, currentAsNum, (currentCounter, cell) => {
        return {
          total: currentCounter.total + cell,
          count: currentCounter.count + 1,
        };
      });
    },
    fill(Array(numCols), { total: 0, count: 0 }),
  );

  const meansRow = counterRow.map(({ total, count }) =>
    (total / count).toString(),
  );
  return new Value([meansRow]);
};
