import { ITextEditor } from "./text-editor";

/**
 * The `Insert` class represents an insertion of a line.
 *
 * @private
 */
export class Insert {
  /**
   * Row index, starts from `0`.
   */
  public readonly row: number;

  /**
   * A string to be inserted.
   */
  public readonly line: string;

  /**
   * Creats a new `Insert` object.
   *
   * @param row - Row index, starts from `0`.
   * @param line - A string to be inserted at the row.
   */
  constructor(row: number, line: string) {
    this.row = row;
    this.line = line;
  }
}

/**
 * The `Delete` class represents a deletion of a line.
 *
 * @private
 */
export class Delete {
  /**
   * Row index, starts from `0`.
   */
  public readonly row: number;

  /**
   * Creates a new `Delete` object.
   *
   * @param row - Row index, starts from `0`.
   */
  constructor(row: number) {
    this.row = row;
  }
}

/**
 * Applies a command to the text editor.
 *
 * @private
 * @param textEditor - An interface to the text editor.
 * @param command - A command.
 * @param rowOffset - Offset to the row index of the command.
 */
export function _applyCommand(
  textEditor: ITextEditor,
  command: Insert | Delete,
  rowOffset: number
): void {
  if (command instanceof Insert) {
    textEditor.insertLine(rowOffset + command.row, command.line);
  } else if (command instanceof Delete) {
    textEditor.deleteLine(rowOffset + command.row);
  } else {
    throw new Error("Unknown command");
  }
}

/**
 * Apply an edit script (array of commands) to the text editor.
 *
 * @private
 * @param textEditor - An interface to the text editor.
 * @param script - An array of commands.
 * The commands are applied sequentially in the order of the array.
 * @param rowOffset - Offset to the row index of the commands.
 */
export function applyEditScript(
  textEditor: ITextEditor,
  script: Insert[] | Delete[],
  rowOffset: number
): void {
  for (const command of script) {
    _applyCommand(textEditor, command, rowOffset);
  }
}

/**
 * Linked list used to remember edit script.
 *
 * @private
 */
class IList {
  get car() {
    throw new Error("Not implemented");
  }

  get cdr() {
    throw new Error("Not implemented");
  }

  isEmpty() {
    throw new Error("Not implemented");
  }

  unshift(value: any) {
    return new Cons(value, this);
  }

  toArray() {
    const arr = [];
    let rest = this;
    // @ts-expect-error ts-migrate(1345) FIXME: An expression of type 'void' cannot be tested for ... Remove this comment to see the full error message
    while (!rest.isEmpty()) {
      arr.push(rest.car);
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'void' is not assignable to type 'this'.
      rest = rest.cdr;
    }
    return arr;
  }
}

/**
 * @private
 */
class Nil extends IList {
  constructor() {
    super();
  }

  get car() {
    throw new Error("Empty list");
  }

  get cdr() {
    throw new Error("Empty list");
  }

  isEmpty() {
    return true;
  }
}

/**
 * @private
 */
class Cons extends IList {
  private _car: any;
  private _cdr: any;

  constructor(car: any, cdr: any) {
    super();
    this._car = car;
    this._cdr = cdr;
  }

  get car() {
    return this._car;
  }

  get cdr() {
    return this._cdr;
  }

  isEmpty() {
    return false;
  }
}

const nil = new Nil();

/**
 * Computes the shortest edit script between two arrays of strings.
 *
 * @private
 * @param from - An array of string the edit starts from.
 * @param to - An array of string the edit goes to.
 * @param [limit=-1] - Upper limit of edit distance to be searched.
 * If negative, there is no limit.
 * @returns The shortest edit script that turns `from` into `to`;
 * `undefined` if no edit script is found in the given range.
 */
export function shortestEditScript(
  from: string[],
  to: string[],
  limit = -1
): Insert[] | Delete[] | undefined {
  const fromLen = from.length;
  const toLen = to.length;
  const maxd = limit >= 0 ? Math.min(limit, fromLen + toLen) : fromLen + toLen;
  const mem = new Array(Math.min(maxd, fromLen) + Math.min(maxd, toLen) + 1);
  const offset = Math.min(maxd, fromLen);
  for (let d = 0; d <= maxd; d++) {
    const mink = d <= fromLen ? -d : d - 2 * fromLen;
    const maxk = d <= toLen ? d : -d + 2 * toLen;
    for (let k = mink; k <= maxk; k += 2) {
      let i;
      let script;
      if (d === 0) {
        i = 0;
        script = nil;
      } else if (k === -d) {
        i = mem[offset + k + 1].i + 1;
        script = mem[offset + k + 1].script.unshift(new Delete(i + k));
      } else if (k === d) {
        i = mem[offset + k - 1].i;
        script = mem[offset + k - 1].script.unshift(
          new Insert(i + k - 1, to[i + k - 1])
        );
      } else {
        const vi = mem[offset + k + 1].i + 1;
        const hi = mem[offset + k - 1].i;
        if (vi > hi) {
          i = vi;
          script = mem[offset + k + 1].script.unshift(new Delete(i + k));
        } else {
          i = hi;
          script = mem[offset + k - 1].script.unshift(
            new Insert(i + k - 1, to[i + k - 1])
          );
        }
      }
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      if (k === toLen - fromLen && i === fromLen) {
        return script.toArray().reverse();
      }
      mem[offset + k] = { i, script };
    }
  }
  return undefined;
}
