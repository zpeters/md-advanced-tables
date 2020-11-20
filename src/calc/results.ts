export class Arity {
  public rows: number;
  public cols: number;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.cols = columns;
  }

  public isRow = (): boolean => this.rows > 1 && this.cols === 1;

  public isColumn = (): boolean => this.rows === 1 && this.cols > 1;

  public isCell = (): boolean => this.rows === 1 && this.cols === 1;
}

export class Value {
  public readonly val: string[][];

  constructor(val: string[][]) {
    this.val = val;
  }

  public get(row: number, column: number): string {
    return this.val[row][column];
  }

  /**
   * getArity returns the dimensions of the contained value, in rows and columns
   */
  public getArity = (): Arity => {
    const maxCols = this.val.reduce<number>(
      (max: number, currentRow: string[]): number =>
        Math.max(max, currentRow.length),
      0,
    );
    return new Arity(this.val.length, maxCols);
  };
}
