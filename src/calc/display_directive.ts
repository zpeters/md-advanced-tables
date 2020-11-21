import { IToken } from 'ebnf';
import { checkChildLength, checkType } from './ast_utils';

export interface Formatter {
  format(num: number | string): string;
}

export class DefaultFormatter {
  public format = (num: number | string): string => {
    if (typeof num === 'string') {
      return num;
    }
    return num.toString();
  };
}

export class DisplayDirective {
  private decimalLength: number;

  constructor(ast: IToken) {
    let typeError = checkType(ast, 'display_directive');
    if (typeError) {
      throw typeError;
    }

    let lengthError = checkChildLength(ast, 1);
    if (lengthError) {
      throw lengthError;
    }

    const displayDirectiveOption = ast.children[0];

    typeError = checkType(displayDirectiveOption, 'display_directive_option');
    if (typeError) {
      throw typeError;
    }

    lengthError = checkChildLength(displayDirectiveOption, 1);
    if (lengthError) {
      throw lengthError;
    }

    const formattingDirective = displayDirectiveOption.children[0];

    typeError = checkType(formattingDirective, 'formatting_directive');
    if (typeError) {
      throw typeError;
    }

    lengthError = checkChildLength(formattingDirective, 1);
    if (lengthError) {
      throw lengthError;
    }

    const formattingDirectiveLength = formattingDirective.children[0];

    typeError = checkType(formattingDirectiveLength, 'int');
    if (typeError) {
      throw typeError;
    }

    this.decimalLength = parseInt(formattingDirectiveLength.text);
  }

  public format = (num: number | string): string => {
    if (typeof num === 'string') {
      const parsedNum = parseFloat(num);
      return parsedNum.toFixed(this.decimalLength);
    }
    return num.toFixed(this.decimalLength);
  };
}
