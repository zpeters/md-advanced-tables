import { Table } from '../table';
import { Component } from './component';
import { Grammars, IToken } from 'ebnf';
import { flatMap } from 'lodash';

/*
import {parseFormula} from './src/calc';
parseFormula("<!-- TBLFM: @2$1=@>-1$1 -->", true);
 */

/**
 * W3C grammar describing a valid formula at the bottom of a table.
 *
 * The library being used to parse the formula does not suport EBNF, only BNF,
 * so W3C syntax was used in order to get access to extended features.
 *
 * The parser generates a PEG parser, whic is not able to handle ambiguity. The
 * order of constructions is significant.
 * See https://github.com/lys-lang/node-ebnf/issues/34
 */
export const parserGrammar = `
tblfm_line ::= "<!-- TBLFM: " formula_list " -->"
formula_list ::= formula ( "::" formula_list )?
formula ::= destination "=" source display_directive?
destination ::=  range | component
source ::= range | component | single_param_function_call | conditional_function_call | algebraic_operation

range ::= component ".." component
component ::= row column | row | column
row ::= "@" ( real | relative_row )
column ::= "$" ( real | relative_column )
relative_row ::= ( "<" | ">" | "I" ) offset?
relative_column ::= ( "<" | ">" ) offset?
offset ::= ( "-" | "+" ) int

single_param_function_call ::= single_param_function "(" parameter ")"
single_param_function ::= "mean" | "sum" | "exp" | "tan" | "sin" | "cos" 
parameter ::= range | component

conditional_function_call ::= "if(" predicate ", " source ", " source ")"
predicate ::= source conditional_operator source
conditional_operator ::= ">" | "<" | ">=" | "<=" | "==" | "!="

algebraic_operation ::= algebraic_operand " "? algebraic_operator " "? algebraic_operand
algebraic_operator ::= "+" | "-" | "*" | "/"
algebraic_operand ::= component | single_param_function_call | conditional_function_call | ( "(" algebraic_operation ")" )

display_directive ::= ";" display_directive_option
display_directive_option ::= formatting_directive
formatting_directive ::= "%." int "f"

real ::= '-'? int
int ::= [0-9]+
`;

enum Operator {
  Plus = 'plus',
  Minus = 'minus',
}

enum Func {
  Mean = 'mean',
  Sum = 'sum',
  Exp = 'exp',
  Tan = 'tan',
  Sin = 'sin',
  Cos = 'cos',
}

export type Value = number[][];

export interface ValueProvider {
  getValue(table: Table): Value;
}

class Range {
  private readonly start: Component;
  private readonly end: Component;

  constructor(ast: IToken) {
    if (ast.type !== 'range') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 2) {
      throw Error('Unexpected children length in Range');
    }
    this.start = new Component(ast.children[0]);
    this.end = new Component(ast.children[1]);
  }

  public readonly getValue = (): Value => {
    throw Error('Range.getValue not implement');
  };
}

export class Formula {
  private readonly source: Source;
  private readonly destination: Destination;

  constructor(ast: IToken) {
    this.destination = new Destination(ast.children[0]);
    this.source = new Source(ast.children[1]);
  }
}

export class Source {
  private readonly locationDescriptor: ValueProvider;

  constructor(ast: IToken) {
    if (ast.type !== 'source') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 1) {
      throw Error('Unexpected children length in Source');
    }

    const child = ast.children[0];
    switch (child.type) {
      case 'range':
        this.locationDescriptor = new Range(child);
        break;
      case 'component':
        this.locationDescriptor = new Component(child);
        break;
      case 'single_param_function_call':
        this.locationDescriptor = new SingleParamFunctionCall(child);
        break;
      case 'conditional_function_call':
        throw Error('Source.conditional_function_call not implemented');
        break;
      case 'algebraic_operation':
        throw Error('Source.algebraic_operation not implemented');
        break;
      default:
        throw Error('Unrecognized source type ' + child.type);
    }
  }
}

export class Destination {
  private readonly locationDescriptor: Component | Range;

  constructor(ast: IToken) {
    if (ast.type !== 'destination') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 1) {
      throw Error('Unexpected children length in Destination');
    }

    const child = ast.children[0];
    switch (ast.children[0].type) {
      case 'range':
        this.locationDescriptor = new Range(child);
        break;
      case 'component':
        this.locationDescriptor = new Component(child);
        break;
      default:
        throw Error('Unrecognized destination type ' + child.type);
    }
  }
}

export class SingleParamFunctionCall {
  private readonly locationDescriptor: ValueProvider;

  constructor(ast: IToken) {
    if (ast.type !== 'destination') {
      throw Error('Invalid AST token type of ' + ast.type);
    }
    if (ast.children.length !== 2) {
      throw Error('Unexpected children length in SingleParamFunctionCall');
    }

    const functionChild = ast.children[0];
    console.log(functionChild.text);
    // "mean" | "sum" | "exp" | "tan" | "sin" | "cos"

    // TODO: Parse the function

    const paramChild = ast.children[0];
    this.locationDescriptor = newValueProvider(paramChild);
  }

  public readonly getValue = (table: Table): Value => {
    const inputData = this.locationDescriptor.getValue(table);

    // TODO: Now operate on this input data

    throw Error('Not implemented');
  };
}

const newValueProvider = (ast: IToken): ValueProvider => {
  switch (ast.type) {
    case 'range':
      return new Range(ast);
    case 'component':
      return new Component(ast);
    default:
      throw Error('Unrecognized valueProvider type ' + ast.type);
  }
};

export const parseFormulaLines = (lines: string[]): Formula[] =>
  flatMap(lines, (line) => parseFormula(line));

/**
 * Parse the provided line, returning any found formulas. A single line may
 * contain zero or more formulas.
 *
 * @param line A line of the form `<!-- TBFM: {FORMULA}::{FORMULA} -->`
 */
export const parseFormula = (line: string, printAST = false): Formula[] => {
  const parser = new Grammars.W3C.Parser(parserGrammar);
  const ast = parser.getAST(line);

  if (printAST) {
    prettyPrintAST(ast);
  }

  if (ast.type !== 'tblfm_line') {
    console.error('Unexpected root element of type ' + ast.type);
    return [];
  }

  if (ast.children.length !== 1) {
    console.error(
      'Unexpected number of formula_list element in root: ' +
        ast.children.length,
    );
    return [];
  }

  const formulas = ast.children[0].children;
  console.debug(`Parsing ${formulas.length} formulas...`);

  return formulas.map((formula) => new Formula(formula));
};

const prettyPrintAST = (token: IToken, level = 0): void => {
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
