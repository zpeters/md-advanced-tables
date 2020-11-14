import { defaultOptions } from '../src/options';
import { Point } from '../src/point';
import {
  _computeNewOffset,
  _createIsTableRowRegex,
  TableEditor,
  _createIsTableFormulaRegex,
} from '../src/table-editor';
import { TextEditor } from './text-editor-mock';
import { assert, expect } from 'chai';

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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
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
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        if (!err) {
          assert.fail();
        }
        expect(err.message).to.equal(
          `Formula '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$I+1 -->' could not be parsed`,
        );
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '| 5 | 6 | 9 | 0 |',
          '<!-- TBLFM: @>$>..@>-1$>-1=@I+2$<..@I+1$I+1 -->',
        ]);
      }
    });

    it('should support inferred row or column values in the source', () => {
      // Destinations must always be well defined,
      // but the source can be ambiguous, requiring knowledge about the destination
    });

    it('should support single parameter function calls', () => {
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          // also, add a test for function arity!
          '<!-- TBLFM: @>$>=sum(@I+1..@>-1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '|     | 10  |',
          '<!-- TBLFM: @>$>=sum(@I+1..@>-1) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>=vsum(@I+1..@>-1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 4   | 6   |',
          '<!-- TBLFM: @>=vsum(@I+1..@>-1) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          // also, add a test for function arity!
          '<!-- TBLFM: @>$>=mean(@I+1..@>-1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '|     | 2.5 |',
          '<!-- TBLFM: @>$>=mean(@I+1..@>-1) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>=vmean(@I+1..@>-1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 2   | 3   |',
          '<!-- TBLFM: @>=vmean(@I+1..@>-1) -->',
        ]);
      }
    });

    it('should support conditional operators', () => {
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>$1=if(@3$1>@3$2, @4$1, @4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 4   |     |',
          '<!-- TBLFM: @>$1=if(@3$1>@3$2, @4$1, @4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>$1=if(@3$1<@3$2, @4$1, @4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 3   |     |',
          '<!-- TBLFM: @>$1=if(@3$1<@3$2, @4$1, @4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>=if(@3$1!=@3$2, vsum(@3..@4), @4) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 4   | 6   |',
          '<!-- TBLFM: @>=if(@3$1!=@3$2, vsum(@3..@4), @4) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B |',
          '| - | - |',
          '| 1 | 2 |',
          '| 3 | 4 |',
          '|   |   |',
          '<!-- TBLFM: @>=if(@3$1==@3$2, vsum(@3..@4), @4) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   |',
          '| --- | --- |',
          '| 1   | 2   |',
          '| 3   | 4   |',
          '| 3   | 4   |',
          '<!-- TBLFM: @>=if(@3$1==@3$2, vsum(@3..@4), @4) -->',
        ]);
      }
    });

    it('should support algebraic operations', () => {
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@4$2+@I+1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| 5   | 6   | 9   | 10  |',
          '<!-- TBLFM: @>=(@4$2+@I+1) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@I+1+@4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| 5   | 6   | 9   | 10  |',
          '<!-- TBLFM: @>=(@I+1+@4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@I+1-@4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| -3  | -2  | 1   | 2   |',
          '<!-- TBLFM: @>=(@I+1-@4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@I+1 * @4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| 4   | 8   | 20  | 24  |',
          '<!-- TBLFM: @>=(@I+1 * @4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@4$2*@I+1) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| 4   | 8   | 20  | 24  |',
          '<!-- TBLFM: @>=(@4$2*@I+1) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>=(@I+1 / @4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A    | B   | C    | D   |',
          '| ---- | --- | ---- | --- |',
          '| 1    | 2   | 5    | 6   |',
          '| 3    | 4   | 7    | 8   |',
          '| 0.25 | 0.5 | 1.25 | 1.5 |',
          '<!-- TBLFM: @>=(@I+1 / @4$2) -->',
        ]);
      }
      {
        const textEditor = new TextEditor([
          'foo',
          '| A | B | C | D |',
          '| - | - | - | - |',
          '| 1 | 2 | 5 | 6 |',
          '| 3 | 4 | 7 | 8 |',
          '|   |   |   |   |',
          '<!-- TBLFM: @>$1=(@I+1$3 * @4$2) -->',
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const err = tableEditor.evaluateFormulas(defaultOptions);
        const pos = textEditor.getCursorPosition();
        expect(err).to.be.undefined;
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.undefined;
        expect(textEditor.getLines()).to.deep.equal([
          'foo',
          '| A   | B   | C   | D   |',
          '| --- | --- | --- | --- |',
          '| 1   | 2   | 5   | 6   |',
          '| 3   | 4   | 7   | 8   |',
          '| 20  |     |     |     |',
          '<!-- TBLFM: @>$1=(@I+1$3 * @4$2) -->',
        ]);
      }
    });
  });
});
