import { defaultOptions } from '../src/options';
import { Point } from '../src/point';
import {
  _computeNewOffset,
  _createIsTableRowRegex,
  TableEditor,
  _createIsTableFormulaRegex,
} from '../src/table-editor';
import { TextEditor } from './text-editor-mock';
import { expect } from 'chai';

/**
 * @test Formulas
 */
describe('Formulas', () => {
  /**
   * @test {TableEditor#evaluateFormulas}
   */
  describe('#evaluateFormulas(options)', () => {
    it('should apply absolute simple cell, column, and row replacement formulas', () => {
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | |',
          '<!-- TBLFM: @4=@3 -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 1   | 2   |',
          '<!-- TBLFM: @4=@3 -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '<!-- TBLFM: $1=$2 -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| B   | B   |',
          '| --- | --- |',
          '| 2   | 2   |',
          '| 4   | 4   |',
          '<!-- TBLFM: $1=$2 -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '<!-- TBLFM: @3$1=@4$2 -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 4   | 2   |',
          '| 3   | 4   |',
          '<!-- TBLFM: @3$1=@4$2 -->',
        ]);
      }
    });

    it('should apply absolute simple range replacement fomulas', () => {
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '<!-- TBLFM: @3$1..@4$2=@3$3..@4$4 -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 5   | 6   | 5   | 6   |',
          '| 7   | 8   | 7   | 8   |',
          '<!-- TBLFM: @3$1..@4$2=@3$3..@4$4 -->',
        ]);
      }
    });
  });

  it('should work with relative cell and row references', () => {
    {
      const textEditor = new TextEditor([
        'foo',
        '| A | B | C | D |',
        '| - | - | - | - |',
        '| 1 | 2 | 5 | 6 |',
        '| 3 | 4 | 7 | 8 |',
        '| 5 | 6 | 9 | 0 |',
        '<!-- TBLFM: @I+1=@> -->',
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      tableEditor.evaluateFormulas(defaultOptions);
      const pos = textEditor.getCursorPosition();
      expect(pos.row).to.equal(1);
      expect(pos.column).to.equal(0);
      expect(textEditor.getSelectionRange()).to.be.undefined;
      expect(textEditor.getLines()).to.deep.equal([
        'foo',
        '| A   | B   | C   | D   |',
        '| --- | --- | --- | --- |',
        '| 5   | 6   | 9   | 0   |',
        '| 3   | 4   | 7   | 8   |',
        '| 5   | 6   | 9   | 0   |',
        '<!-- TBLFM: @I+1=@> -->',
      ]);
    }
    {
      const textEditor = new TextEditor([
        'foo',
        '| A | B | C | D |',
        '| - | - | - | - |',
        '| 1 | 2 | 5 | 6 |',
        '| 3 | 4 | 7 | 8 |',
        '| 5 | 6 | 9 | 0 |',
        '<!-- TBLFM: @>$>=@<+2$< -->',
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      tableEditor.evaluateFormulas(defaultOptions);
      const pos = textEditor.getCursorPosition();
      expect(pos.row).to.equal(1);
      expect(pos.column).to.equal(0);
      expect(textEditor.getSelectionRange()).to.be.undefined;
      expect(textEditor.getLines()).to.deep.equal([
        'foo',
        '| A   | B   | C   | D   |',
        '| --- | --- | --- | --- |',
        '| 1   | 2   | 5   | 6   |',
        '| 3   | 4   | 7   | 8   |',
        '| 5   | 6   | 9   | 1   |',
        '<!-- TBLFM: @>$>=@<+2$< -->',
      ]);
    }
    {
      const textEditor = new TextEditor([
        'foo',
        '| A | B | C | D |',
        '| - | - | - | - |',
        '| 1 | 2 | 5 | 6 |',
        '| 3 | 4 | 7 | 8 |',
        '| 5 | 6 | 9 | 0 |',
        '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$<+1 -->',
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      tableEditor.evaluateFormulas(defaultOptions);
      const pos = textEditor.getCursorPosition();
      expect(pos.row).to.equal(1);
      expect(pos.column).to.equal(0);
      expect(textEditor.getSelectionRange()).to.be.undefined;
      expect(textEditor.getLines()).to.deep.equal([
        'foo',
        '| A   | B   | C   | D   |',
        '| --- | --- | --- | --- |',
        '| 1   | 2   | 5   | 6   |',
        '| 3   | 4   | 1   | 2   |',
        '| 5   | 6   | 3   | 4   |',
        '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$<+1 -->',
      ]);
    }
  });

  it('should return an error if the formula is invalid', () => {
    {
      const textEditor = new TextEditor([
        'foo',
        '| A | B | C | D |',
        '| - | - | - | - |',
        '| 1 | 2 | 5 | 6 |',
        '| 3 | 4 | 7 | 8 |',
        '| 5 | 6 | 9 | 0 |',
        '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$I+1 -->',
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      tableEditor.evaluateFormulas(defaultOptions);
      const pos = textEditor.getCursorPosition();
      expect(pos.row).to.equal(1);
      expect(pos.column).to.equal(0);
      expect(textEditor.getSelectionRange()).to.be.undefined;
      expect(textEditor.getLines()).to.deep.equal([
        'foo',
        '| A   | B   | C   | D   |',
        '| --- | --- | --- | --- |',
        '| 1   | 2   | 5   | 6   |',
        '| 3   | 4   | 7   | 8   |',
        '| 5   | 6   | 9   | 0   |',
        '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$I+1 -->',
      ]);
    }
  });
});
