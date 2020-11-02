import { Alignment } from "./alignment";

/**
 * A `TableCell` object represents a table cell.
 *
 * @private
 */
export class TableCell {
  /**
   * Raw content of the cell.
   */
  public readonly rawContent: string;

  /**
   * Trimmed content of the cell.
   */
  public readonly content: string;

  private _paddingLeft: number;
  private _paddingRight: number;

  /**
   * Creates a new `TableCell` object.
   *
   * @param rawContent - Raw content of the cell.
   */
  constructor(rawContent: string) {
    this.rawContent = rawContent;
    this.content = rawContent.trim();
    this._paddingLeft =
      this.content === ""
        ? this.rawContent === ""
          ? 0
          : 1
        : this.rawContent.length - this.rawContent.trimLeft().length;
    this._paddingRight =
      this.rawContent.length - this.content.length - this._paddingLeft;
  }

  /**
   * Width of the left padding of the cell.
   */
  get paddingLeft(): number {
    return this._paddingLeft;
  }

  /**
   * Width of the right padding of the cell.
   */
  get paddingRight(): number {
    return this._paddingRight;
  }

  /**
   * Convers the cell to a text representation.
   *
   * @returns The raw content of the cell.
   */
  toText(): string {
    return this.rawContent;
  }

  /**
   * Checks if the cell is a delimiter i.e. it only contains hyphens `-` with optional one
   * leading and trailing colons `:`.
   *
   * @returns `true` if the cell is a delimiter.
   */
  isDelimiter(): boolean {
    return /^\s*:?-+:?\s*$/.test(this.rawContent);
  }

  /**
   * Returns the alignment the cell represents.
   *
   * @returns The alignment the cell represents; `undefined` if the cell is not a delimiter.
   */
  getAlignment(): Alignment | undefined {
    if (!this.isDelimiter()) {
      return undefined;
    }
    if (this.content[0] === ":") {
      if (this.content[this.content.length - 1] === ":") {
        return Alignment.CENTER;
      } else {
        return Alignment.LEFT;
      }
    } else {
      if (this.content[this.content.length - 1] === ":") {
        return Alignment.RIGHT;
      } else {
        return Alignment.NONE;
      }
    }
  }

  /**
   * Computes a relative position in the trimmed content from that in the raw content.
   *
   * @param rawOffset - Relative position in the raw content.
   * @returns - Relative position in the trimmed content.
   */
  computeContentOffset(rawOffset: number): number {
    if (this.content === "") {
      return 0;
    }
    if (rawOffset < this.paddingLeft) {
      return 0;
    }
    if (rawOffset < this.paddingLeft + this.content.length) {
      return rawOffset - this.paddingLeft;
    } else {
      return this.content.length;
    }
  }

  /**
   * Computes a relative position in the raw content from that in the trimmed content.
   *
   * @param contentOffset - Relative position in the trimmed content.
   * @returns - Relative position in the raw content.
   */
  computeRawOffset(contentOffset: number): number {
    return contentOffset + this.paddingLeft;
  }
}
