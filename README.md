# Markdown Advanced Tables

This library can be used by any text editor to enable formatting and
Excel-style navigation to Markdown tables.

**Note:** This was originally created by [@susisu](https://github.com/susisu).
This fork is intended to convert the project to Typescript and start adding
additional functionality such as table sorting, and possibly even basic
spreadsheet capabilities.

![demo](https://github.com/susisu/markdown-table-editor/wiki/images/demo.gif)

[You can try it on your browser!](https://susisu.github.io/mte-demo/)

## Installation

TBD

## Usage

Implement an [interface to the text editor][doc-ITextEditor].

``` javascript
interface ITextEditor {
  getCursorPosition(): Point;
  setCursorPosition(pos: Point): void;
  setSelectionRange(range: Range): void;
  getLastRow(): number;
  acceptsTableEdit(row: number): boolean;
  getLine(row: number): string;
  insertLine(row: number, line: string): void;
  deleteLine(row: number): void;
  replaceLines(startRow: number, endRow: number, lines: Array<string>): void;
  transact(func: Function): void;
}
```

And then you can execute [commands][doc-TableEditor] through a `TableEditor` object.

``` javascript
import { TableEditor, options } from "@susisu/mte-kernel";
const textEditor = ...; // interface to the text editor
const tableEditor = new TableEditor(textEditor);
tableEditor.formatAll(options({}));
```

See the [API reference][doc-API] for more information.
It is also good to look into [atom-markdown-table-editor][atom-mte-repo] as a reference implementation.

[doc-API]: https://doc.esdoc.org/github.com/susisu/mte-kernel/identifiers.html
[doc-ITextEditor]:  https://doc.esdoc.org/github.com/susisu/mte-kernel/class/lib/text-editor.js~ITextEditor.html
[doc-TableEditor]:  https://doc.esdoc.org/github.com/susisu/mte-kernel/class/lib/table-editor.js~TableEditor.html
[atom-mte]: https://atom.io/packages/markdown-table-editor
[atom-mte-repo]: https://github.com/susisu/atom-markdown-table-editor

## Pricing

This plugin library is provided to everyone for free, however if you would like to say thanks or help support continued development, feel free to send a little my way through one of the following methods:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/tgrosinger?style=social)](https://github.com/sponsors/tgrosinger)
[![Paypal](https://img.shields.io/badge/paypal-tgrosinger-yellow?style=social&logo=paypal)](https://paypal.me/tgrosinger)
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/tgrosinger)

## License

[MIT License](http://opensource.org/licenses/mit-license.php)

## Author

Current author: Tony Grosinger ([Github](https://github.com/tgrosinger))

Original author: Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
