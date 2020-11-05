import { Options } from '../options';
import { Table } from '../table';
import { Grammars, IToken } from 'ebnf';
import { AbsoluteRow, newRow, RelativeRow } from './row';
import { AbsoluteColumn, RelativeColumn, newColumn } from './column';
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
single_param_function ::= "vmean" | "vsum" | "exp" | "tan" | "sin" | "cos"
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

export class Component {
  public readonly row: AbsoluteRow | RelativeRow | undefined;
  public readonly column: AbsoluteColumn | RelativeColumn | undefined;

  constructor(ast: IToken) {
    if (ast.type != 'component') {
      throw 'Invalid AST token type of ' + ast.type;
    }

    for (let i = 0; i < ast.children.length; i++) {
      const child = ast.children[i];
      switch (child.type) {
        case 'row':
          if (this.row != undefined) {
            throw 'Component may only have at most 1 row, more than 1 provided';
          }
          this.row = newRow(child);
          break;
        case 'column':
          if (this.column != undefined) {
            throw 'Component may only have at most 1 column, more than 1 provided';
          }
          this.column = newColumn(child);
          break;
      }
    }

    if (!this.row && !this.column) {
      throw 'Cannot create a component without a row, a column, or both';
    }
  }
  public readonly getValue = (): value => {
    throw 'Range.getValue not implement';
  };
}

enum Operator {
  plus = 'plus',
  minus = 'minus',
}

enum Func {
  vmean = 'vmean',
}

interface value {}

interface valueProvider {
  getValue(): value;
}

class Range {
  start: Component;
  end: Component;

  constructor(ast: IToken) {
    if (ast.type != 'range') {
      throw 'Invalid AST token type of ' + ast.type;
    }
    if (ast.children.length != 2) {
      throw 'Unexpected children length in Range';
    }
    this.start = new Component(ast.children[0]);
    this.end = new Component(ast.children[1]);
  }

  public readonly getValue = (): value => {
    throw 'Range.getValue not implement';
  };
}

export class Formula {
  public readonly source: Source;
  public readonly destination: Destination;

  constructor(ast: IToken) {
    this.destination = new Destination(ast.children[0]);
    this.source = new Source(ast.children[1]);
  }
}

export class Source {
  locationDescriptor: valueProvider;

  constructor(ast: IToken) {
    if (ast.type != 'source') {
      throw 'Invalid AST token type of ' + ast.type;
    }
    if (ast.children.length != 1) {
      throw 'Unexpected children length in Source';
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
        throw 'Source.single_param_function_call not implemented';
        break;
      case 'conditional_function_call':
        throw 'Source.conditional_function_call not implemented';
        break;
      case 'algebraic_operation':
        throw 'Source.algebraic_operation not implemented';
        break;
      default:
        throw 'Unrecognized source type ' + child.type;
    }
  }
}

export class Destination {
  public readonly locationDescriptor: Component | Range;

  constructor(ast: IToken) {
    if (ast.type != 'destination') {
      throw 'Invalid AST token type of ' + ast.type;
    }
    if (ast.children.length != 1) {
      throw 'Unexpected children length in Destination';
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
        throw 'Unrecognized destination type ' + child.type;
    }
  }
}

// TODO: Add tests
export const evaluateFormulas = (table: Table, options: Options): Table => {
  return table;
};

export const parseFormulaLines = (lines: string[]): Formula[] => {
  return flatMap(lines, (line) => parseFormula(line));
};

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

  if (ast.type != 'tblfm_line') {
    console.error('Unexpected root element of type ' + ast.type);
    return [];
  }

  if (ast.children.length != 1) {
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

function prettyPrintAST(token: IToken, level = 0) {
  console.log(
    '  '.repeat(level) +
      `|-${token.type}${token.children.length == 0 ? '=' + token.text : ''}`,
  );
  token.children &&
    token.children.forEach((c) => {
      prettyPrintAST(c, level + 1);
    });
}
