import { IToken } from 'ebnf';

export const checkType = (
  ast: IToken,
  expectedType: string,
): Error | undefined => {
  if (ast.type === expectedType) {
    return;
  }

  return new Error(
    `Formula element '${ast.text}' is a ${ast.type} but expected ` +
      `a ${expectedType} in this position.`,
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
