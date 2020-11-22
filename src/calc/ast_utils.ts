import { IToken } from 'ebnf';
import { Result } from '../neverthrow/neverthrow';
import { Table } from '../table';
import { Value } from './results';

export const errIndex0 = new Error('Index 0 used to create a reference');
export const errRelativeReferenceIndex = new Error(
  'Can not use relative reference where absolute reference is required',
);

export const checkType = (
  ast: IToken,
  ...expectedTypes: string[]
): Error | undefined => {
  if (expectedTypes.indexOf(ast.type) >= 0) {
    return;
  }

  return new Error(
    `Formula element '${ast.text}' is a ${ast.type} but expected ` +
      `one of ${expectedTypes} in this position.`,
  );
};

export const checkChildLength = (
  ast: IToken,
  len: number,
): Error | undefined => {
  if (ast.children.length === len) {
    return;
  }

  return new Error(
    `Formula element '${ast.text}' was expected to have ${len} ` +
      `elements, but had ${ast.children.length}`,
  );
};

export interface ValueProvider {
  getValue(table: Table, currentCell: Cell): Result<Value, Error>;
}

export interface Cell {
  row: number;
  column: number;
}

export const prettyPrintAST = (token: IToken, level = 0): void => {
  console.log(
    '  '.repeat(level) +
      `|-${token.type}${token.children.length === 0 ? '=' + token.text : ''}`,
  );
  if (token.children) {
    token.children.forEach((c) => {
      prettyPrintAST(c, level + 1);
    });
  }
};
