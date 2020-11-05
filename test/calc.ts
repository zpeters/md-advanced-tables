import { assert, expect } from 'chai';
import { Component, Formula, parseFormula } from '../src/calc/calc';

/**
 * @test {Formula}
 */
describe('Formula', () => {
  /**
   * @test {Formula.constructor}
   */
  describe('constructor(source, destination)', () => {
    it('should create a Formua object', () => {
      /*
      {
        const formulaStr = '<!-- TBFM: $1=$2 -->';
        const formulas = parseFormula(formulaStr);
        expect(formulas).to.be.an('array').of.length(1);
        const formula = formulas[0];
        expect(formula).to.be.an.instanceOf(Formula);
        expect(formula.source).to.be.an('array').of.length(1);
        expect(formula.source[0]).to.be.an.instanceOf(Component);
        const sourceComponent = formula.source[0] as Component;
        expect(sourceComponent.row).to.be.undefined;
        expect(sourceComponent.rowOffset).to.equal(0);
        expect(sourceComponent.column).to.equal(2);
        expect(sourceComponent.columnOffset).to.equal(0);
        expect(formula.destination).to.be.an.instanceOf(Component);
        const destinationComponent = formula.destination
          .locationDescriptor as Component;
        expect(destinationComponent.row).to.be.undefined;
        expect(destinationComponent.rowOffset).to.equal(0);
        expect(destinationComponent.column).to.equal(1);
        expect(destinationComponent.columnOffset).to.equal(0);
      }
      {
        const formulaStr = '<!-- TBFM: @2$1=@2$2 -->';
        const formulas = parseFormula(formulaStr);
        expect(formulas).to.be.an('array').of.length(1);
        const formula = formulas[0];
        expect(formula).to.be.an.instanceOf(Formula);
        expect(formula.source).to.be.an('array').of.length(1);
        expect(formula.source[0]).to.be.an.instanceOf(Component);
        const sourceComponent = formula.source[0] as Component;
        expect(sourceComponent.row).to.equal(2);
        expect(sourceComponent.rowOffset).to.equal(0);
        expect(sourceComponent.column).to.equal(2);
        expect(sourceComponent.columnOffset).to.equal(0);
        expect(formula.destination).to.be.an.instanceOf(Component);
        const destinationComponent = formula.destination
          .locationDescriptor as Component;
        expect(destinationComponent.row).to.equal(2);
        expect(destinationComponent.rowOffset).to.equal(0);
        expect(destinationComponent.column).to.equal(1);
        expect(destinationComponent.columnOffset).to.equal(0);
      }
      */
    });
  });
});
