import { assert, expect } from "chai";

import {
  Insert,
  Delete,
  _applyCommand,
  applyEditScript,
  shortestEditScript,
} from "../lib/edit-script";

import { TextEditor } from "./text-editor-mock";

/**
 * @test {Insert}
 */
describe("Insert", () => {
  /**
   * @test {Insert.constructor}
   */
  describe("constructor(row, line)", () => {
    it("should create a new Insert object", () => {
      const command = new Insert(1, "foo");
      expect(command).to.be.an.instanceOf(Insert);
    });
  });

  /**
   * @test {Insert#row}
   */
  describe("#row", () => {
    it("should get the row index of the command", () => {
      const command = new Insert(1, "foo");
      expect(command.row).to.equal(1);
    });
  });

  /**
   * @test {Insert#line}
   */
  describe("#line", () => {
    it("should get the line to be inserted by the command", () => {
      const command = new Insert(1, "foo");
      expect(command.line).to.equal("foo");
    });
  });
});

/**
 * @test {Delete}
 */
describe("Delete", () => {
  /**
   * @test {Delete.constructor}
   */
  describe("constructor(row)", () => {
    it("should create a new Delete object", () => {
      const command = new Delete(1);
      expect(command).to.be.an.instanceOf(Delete);
    });
  });

  /**
   * @test {Delete#row}
   */
  describe("#row", () => {
    it("should get the row index of the command", () => {
      const command = new Delete(1);
      expect(command.row).to.equal(1);
    });
  });
});

/**
 * @test {_applyCommand}
 */
describe("_applyCommand(textEditor, command, rowOffset)", () => {
  it("should apply the command to the text editor", () => {
    {
      const textEditor = new TextEditor(["foo", "baz"]);
      _applyCommand(textEditor, new Insert(1, "bar"), 0);
      expect(textEditor.getLines()).to.deep.equal(["foo", "bar", "baz"]);
    }
    {
      const textEditor = new TextEditor(["foo", "baz"]);
      _applyCommand(textEditor, new Insert(0, "bar"), 1);
      expect(textEditor.getLines()).to.deep.equal(["foo", "bar", "baz"]);
    }
    {
      const textEditor = new TextEditor(["foo", "bar", "baz"]);
      _applyCommand(textEditor, new Delete(1), 0);
      expect(textEditor.getLines()).to.deep.equal(["foo", "baz"]);
    }
    {
      const textEditor = new TextEditor(["foo", "bar", "baz"]);
      _applyCommand(textEditor, new Delete(0), 1);
      expect(textEditor.getLines()).to.deep.equal(["foo", "baz"]);
    }
  });
});

/**
 * @test {applyEditScript}
 */
describe("applyEditScript(textEditor, script, rowOffset)", () => {
  it("should apply the commands in the script sequentially to the text editor", () => {
    {
      const textEditor = new TextEditor(["A", "C", "D"]);
      const script = [new Insert(1, "B"), new Delete(2)];
      applyEditScript(textEditor, script, 0);
      expect(textEditor.getLines()).to.deep.equal(["A", "B", "D"]);
    }
    {
      const textEditor = new TextEditor(["A", "C", "D"]);
      const script = [new Insert(0, "B"), new Delete(1)];
      applyEditScript(textEditor, script, 1);
      expect(textEditor.getLines()).to.deep.equal(["A", "B", "D"]);
    }
  });
});

/**
 * @test {shortestEditScript}
 */
describe("shortestEditScript(from, to, limit = -1)", () => {
  it("should compute the shortest edit script between two arrays of strings", () => {
    {
      const from = ["A", "B", "C"];
      const to = ["D", "E", "F"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(6);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["D", "E", "F"];
      const to = ["A", "B", "C"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(6);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "B", "C"];
      const to: string[] = [];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(3);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from: string[] = [];
      const to = ["A", "B", "C"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(3);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "B", "C"];
      const to = ["A", "B", "C", "D", "E"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(2);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "B", "C", "D", "E"];
      const to = ["A", "B", "C"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(2);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["C", "D", "E"];
      const to = ["A", "B", "C", "D", "E"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(2);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "B", "C", "D", "E"];
      const to = ["C", "D", "E"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(2);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "B", "C", "D", "E"];
      const to = ["A", "X", "B", "D", "Y"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(4);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = ["A", "X", "B", "D", "Y"];
      const to = ["A", "B", "C", "D", "E"];
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(4);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = "kitten".split("");
      const to = "sitting".split("");
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(5);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = "sitting".split("");
      const to = "kitten".split("");
      const ses = shortestEditScript(from, to);
      if (ses === undefined) {
        assert.fail(); // Appease the type checker
      }
      expect(ses).to.be.an("array").of.length(5);
      const textEditor = new TextEditor(from);
      applyEditScript(textEditor, ses, 0);
      expect(textEditor.getLines()).to.deep.equal(to);
    }
    {
      const from = "kitten".split("");
      const to = "sitting".split("");
      const ses = shortestEditScript(from, to, 4);
      expect(ses).to.be.undefined;
    }
    {
      const from = "sitting".split("");
      const to = "kitten".split("");
      const ses = shortestEditScript(from, to, 4);
      expect(ses).to.be.undefined;
    }
  });
});
