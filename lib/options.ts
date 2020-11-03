import { DefaultAlignment, HeaderAlignment } from './alignment';
import { FormatType, TextWidthOptions } from './formatter';

const DEFAULT_TEXT_WIDTH_OPTIONS = {
  normalize: true,
  wideChars: new Set<string>(),
  narrowChars: new Set<string>(),
  ambiguousAsWide: false,
};

const DEFAULT_OPTIONS = {
  leftMarginChars: new Set<string>(),
  formatType: FormatType.NORMAL,
  minDelimiterWidth: 3,
  defaultAlignment: DefaultAlignment.LEFT,
  headerAlignment: HeaderAlignment.FOLLOW,
  smartCursor: false,
};

/**
 * Create an Options object for the formatter.
 * The default values are used for options that are not specified.
 *
 * The available options and default values are listed below.
 *
 * | property name       | type                              | description                                             | default value            |
 * | ------------------- | --------------------------------- | ------------------------------------------------------- | ------------------------ |
 * | `leftMarginChars`   | {@link Set}&lt;{@link string}&gt; | A set of additional left margin characters.             | `new Set()`              |
 * | `formatType`        | {@link FormatType}                | Format type, normal or weak.                            | `FormatType.NORMAL`      |
 * | `minDelimiterWidth` | {@link number}                    | Minimum width of delimiters.                            | `3`                      |
 * | `defaultAlignment`  | {@link DefaultAlignment}          | Default alignment of columns.                           | `DefaultAlignment.LEFT`  |
 * | `headerAlignment`   | {@link HeaderAlignment}           | Alignment of header cells.                              | `HeaderAlignment.FOLLOW` |
 * | `textWidthOptions`  | {@link TextWidthOptions}          | An object containing options for computing text widths. |                          |
 * | `smartCursor`       | {@link boolean}                   | Enables "Smart Cursor" feature.                         | `false`                  |
 *
 * The available options for `textWidthOptions` are the following ones.
 *
 * | property name     | type                              | description                                           | default value |
 * | ----------------- | --------------------------------- | ----------------------------------------------------- | ------------- |
 * | `normalize`       | {@link boolean}                   | Normalizes texts before computing text widths.        | `true`        |
 * | `wideChars`       | {@link Set}&lt;{@link string}&gt; | A set of characters that should be treated as wide.   | `new Set()`   |
 * | `narrowChars`     | {@link Set}&lt;{@link string}&gt; | A set of characters that should be treated as narrow. | `new Set()`   |
 * | `ambiguousAsWide` | {@link boolean}                   | Treats East Asian Ambiguous characters as wide.       | `false`       |
 *
 */
export const optionsWithDefaults = (options: Partial<Options>): Options => ({
  ...DEFAULT_OPTIONS,
  ...options,
  textWidthOptions: options.textWidthOptions
    ? { ...DEFAULT_TEXT_WIDTH_OPTIONS, ...options.textWidthOptions }
    : DEFAULT_TEXT_WIDTH_OPTIONS,
});

export const defaultOptions: Options = optionsWithDefaults({});

/**
 * An object containing options.
 */
export interface Options {
  /**
   * A set of additional left margin characters
   * @public
   */
  leftMarginChars: Set<string>;

  /**
   * Format type, normal or weak.
   * @public
   */
  formatType: FormatType;

  /**
   * Minimum width of delimiters.
   * @public
   */
  minDelimiterWidth: number;

  /**
   * Default alignment of columns.
   * @public
   */
  defaultAlignment: DefaultAlignment;

  /**
   * Alignment of header cells.
   * @public
   */
  headerAlignment: HeaderAlignment;

  /**
   * Contains options for computing text widths.
   * @public
   */
  textWidthOptions: TextWidthOptions;

  /**
   * Enables "Smart Cursor" feature.
   * @public
   */
  smartCursor: boolean;
}
