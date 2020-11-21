# Formulas in Markdown Tables

One of the most exciting features this library adds (in my opinion) are
formulas. The format for these fomulas is very similar to that used in
[org-mode](https://orgmode.org/), though not quite as powerful.

A brief overview of the features:

- Copy values from one cell, row, column, or range to another
- Sum values from a column or range
- Average (mean) values from a column or range
- Value comparisons
- Algebraic operations

## The Fomula Structure - An Overview

Let's write an example formula, and become familiar with the structure before
learning the details of any specific feature.

```md
| Item              | Grams |
| ----------------- | ----- |
| Whole Wheat Flour | 110   |
| Bread Flour       | 748   |
| Warm Water        | 691   |
| Salt              | 18    |
| Starter           | 40    |
| **Total Grams**   |       |
<!-- TBLFM: @>$2=vsum(@I+1$>..@>-1$>) -->
```

Formulas are added to tables as an HTML comment directly following the table.
The format is `<!-- ` to start the comment, and ` -->` to finish. Note that
there is a space between the dashes and the internals of the formula.

Next, we signify that this comment contains a formula with `TBLFM: `. Again
note the trailing space. The components thus far will exist unchanged for
every formula you write.

### Source and Destination

Now we get into the dynamic part of the formula. You can break any formula
down into two halves: where to retrieve data, and where to store the result.

```md
<!-- TBLFM: DESTINATION=SOURCE -->
```

So in this formula, we are retrieving data from `vsum(@I+1$>..@>-1$>)` and
storing it in `@>$2`.

### Rows and Columns

Just like in org-mode, formulas use symbols to denote rows and columns. In
the above formula, the destination for our calculated value is `@>$2`. We can
break this down into `@>` and `$2`, meaning "last row" and "column 2". We'll
dive into what "last row" means in a minute.

Let's look at the source: `vsum(@I+1$>..@>-1$>)`. Again, if we ignore some of
the concepts we haven't learned yet, we can identify a few rows and columns
here.

- `@I` and `@>-1` are both rows
- `$>` and `$>` are both columns

In addition to using number to refer to specific rows and columns (referred
to as absolute rows, or absolute columns), symbols can be used to dynamically
refer to parts of the table (referred to as relative rows, and relative
columns)

- `@<` and `$<` mean the first row and first column, respectively.
- `@>` and `$>` mean the last row and last column, respectively.
- `@I` referrs to the line separating the table header from the table body.

Finally, a relative row or column reference can be used with an offset.
Putting it all together we can read `@I+1` to mean "one row below the
dividing line" and `@>-1` to mean "one row above the last row".

### Ranges

When writing `@2` by itself it means literally "row 2", as in, the entire
row. Similarly, `@2$4` means the single cell in row 2, column 4. However what
if you want to reference only a few cells in one column, or perhaps, a few
cells in several consecutive columns?

Ranges allow for doing just that. A range is denoted by two periods in a row
between two row and/or columns.

```md
@I+1$>..@>-1$>
```

Our example from the top says "From the row after the header in the last
column, to the second to last row in the last column."

### Functions

The last piece to our example is the function call.

```md
<!-- TBLFM: @>$2=vsum(@I+1$>..@>-1$>) -->
```

In this example we are using the `vsum` function, and passing it the range
described above as the input data. The details of how `vsum` operates will be
discussed later in this document, but for now we can say it sums the provided
input data, providing a single cell as the output.

### The result

With that we understand all the components of the example formula. It adds
the numbers from the second column, excluding the header and the final row,
and places the result in the final row.

## Arity

In formulas, many operations require that there be a matching arity between
the source and the destination. Arity is a description of how many rows and
columns are in particular value. Take for example the following table:

```md
| Item      | Count |
| --------- | ----- |
| Apples    | 1     |
| Oranges   | 3     |
| Bananas   | 5     |
| **Total** | 9     |
```

In this table, if I wrote a selector for the first two rows (`@3..@4` or
`@3$1..@4$2`), then I am selecting two rows and two columns. This could be
described as having an arity of `2x2`. If I instead selected a single cell
(`@3$1`), then the arity would be `1x1`.

In the formula components described below, they will often state what arity
their result, or output is. When using the output as the input to another
formula component, or when putting into a formula destination, it is
necessary that the arity matches. For example, a formula such as `@2$3=@4` is
invalid, because a full row (`@4`) can not be put in a single column
(`@2$3`).

## Formula Components

This section will go into further detail about the different components which
can be used in a formula. Some details will be repeats from the overview
section above.

### Cell and Row References

Rows are always denoted by `@` and columns by `$`. Rows and columns can be
specified as absolute values, or relative.

- `@1` means the first row, and `@5` means the 5th row from the top.
- `$1` means the first column, and `$5` means the 5th column from the left.
- `@<` and `$<` mean the first row and first column, respectively.
- `@>` and `$>` mean the last row and last column, respectively.
- `@I` refers to the line separating the table header from the table body.

A row or column can be specified by themselves, or together in a combination.
For example, `@5` means the entire 5th row. The arity will be 1 row by the
table width (`1xN`). Similarly, `$5` will have an arity of the table height
by 1 row (`Nx1`). When used together, they indicate a single cell. `@3$4` has
an arity of `1x1`.

When used together, the row should always preceed the column.

### Cell and Row Offsets

Relative column and row values (for example, `@I` or `$>`) may optionally
include an offset. Offsets, if provided, must include a `+` or `-` followed
by a number.

- `@>-1` - The second to last row
- `@I+1` - The row after the header
- `$<+2` - Equivalent to `$3`

### Ranges

With just rows and columns, the formula is limited to selecting cells with an
arity of `1xN`, `Nx1`, or `1x1`. Using a range, a formula can select anywhere
from a single cell to the entire table.

Ranges are created with a row and/or column, two dots, and another row and/or
column. For example `@1..@3`. Note however, that the components on both sides
must match. A range can not be from a row to a column, or a cell to a row.

- `@2..$4` - Invalid, can not range from a row to a column.
- `@2$3..@5` - Invalid, can not range from a cell to a row.
- `@2$3..@5$5` - Valid, from one cell to another cell.
- `$4..$6` - Valid, from one column to another column.

Ranges can be used to select portions of a row or column.

- `@2$>..@5$>` - The last column, from row 2 to row 5. Arity `4x1`
- `@3$<..@3$5` - The third row, from the first column to the 5th. Arity `1x5`

Ranges can also be used to select more than a row or column.

- `@<..@>` - The entire row from the first row, to the last (the whole table).
- `@3$1..@4$3` - From row 3 to row 4, from column 1 to 3. Arity `2x3`

### Algebraic Operations

Formulas can be used to add, subtract, multiply, and divide values in a
table. All algebraic operations must be contained in parenthesis.

#### Add

When adding, at least one of the specified values must be a single cell. A
formula may not add one range to another range.

- `(@2$3+@3$4)` - Valid, adding two cells. Arity `1x1`
- `(@2+@3$4)` - Valid, add a single cell to each value in the row. Outputs a row.
- `(@2$3+$4)` - Valid, add a single cell to each value in the column. Outputs a column.
- `(@2+@3)` - Invalid, both operands are ranges.
- `(@2+$3)` - Invalid, both operands are ranges.
- `@2$3+$4` - Invalid, missing parenthesis

It does not matter which operand is a cell and which is a range.

#### Subtract

Subtraction requires that the second operand be a single cell. The first
operand may be a range or cell.

- `(@2$3-@3$4)` - Valid, subtract two cells. Arity `1x1`
- `(@2-@3$4)` - Valid, subtract a single cell from each value in the row. Outputs a row.
- `(@3$4-@2)` - Invalid, may not subtract a range from a single cell.
- `@2-@3$4` - Invalid, missing parenthesis

#### Multiply

Multiplication requires at least one value be a single cell. A formula may
not multiply one range with another range.

- `(@2$3*@3$4)` - Valid, multiplying two cells. Arity `1x1`
- `(@2*@3$4)` - Valid, multiply a single cell with each value in the row. Outputs a row.
- `(@2$3*$4)` - Valid, multiply a single cell with each value in the column. Outputs a column.
- `(@2*@3)` - Invalid, both operands are ranges.
- `(@2*$3)` - Invalid, both operands are ranges.
- `@2$3*$4` - Invalid, missing parenthesis

#### Divide

Division requires that the second operand be a single cell. The first operand
may be a range or a cell.

- `(@2$3/@3$4)` - Valid, divide two cells. Arity `1x1`
- `(@2/@3$4)` - Valid, divide each value in the row by s single cell. Outputs a row.
- `(@3$4/@2)` - Invalid, may not divide a single cell by a range.
- `@2/@3$4` - Invalid, missing parenthesis

### Conditional Operations

Conditionals allow choosing a value based on the comparison of two inputs.
For example:

```md
if(@3$4<@4$5, @2, @3)
```

In this example, we are comparing the values located in cell `@3$4` against
cell `@4$5`. If the first is less than (`<`) the second, then the result will
be the first parameter (`@2`), otherwise the result will be the second
parameter (`@3`).

Comparisons can only be made between cells, not ranges.

#### Comparison Operators

- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal to
- `>=` - Greater than or equal to
- `==` - Equal
- `!=` - Not equal

### Functions

Functions look very similar to conditional operations. A keyword followed by
parenthesis with values inside. For example, `vmean(@3$<..@3$4)`. A function
call passes in the data from the provided range, cell, row, or column, then
performs a caculation and provides back the result.

There are four functions that can be used:

#### sum

`sum` is very similar to the addiition algebraic operation above, but it will
add all the cells in the provided range, row, or column together and output a
single cell result. This means you can use `sum` anywhere that a `1x1` arity
is expected, such as in a comparison operation or assigning to a cell.

```md
<!-- TBLFM: @5$3=sum(@3..@4) -->
```

#### vsum

`vsum` is the "vertical" variant of `sum`. It will only sum values in a
column, producing a row of output. For example, `vsum` could be used for the
"Totals" row at the bottom of a table, to add each of the individual columns
in the table.

#### mean

`mean` calculates the average of the provided range, row, or column. Like
`sum` it will output a single cell result.

#### vmean

`vmean` is the "vertical" variant of `mean`. It will only average values in a
column, producing a row of output.

## Nesting

The different building blocks of a function can be nested, as long as their
arity matches. For example, the output from `sum` can be used as an input for
a conditional operation. Here are a few examples of valid nesting:

- `<!-- TBLFM: @>=vsum(@3..@4)+@3$1 -->` - Add `@3$1` to each column output by `vsum`
- `<!-- TBLFM: @3$3=if(@2$4+@2$5==@2$6, @3$3, @4$3) -->` - Add two cells in the comparison

## Chaining and Multiple Formulas

A table may have multiple formulas defined. This can be done in two ways. In
a single formula line, multiple formulas may be "chained" together, separated
by `::`. For example:

```md
<!-- TBLFM: @2=@4::$1=$2 -->
```

When chained, formulas will be evaluated from left to right. The resulting
table after applying the first formula, will be used as the input for the
second formula. This means that the second formula may operated on calculated
values from the first formula.

The second method is with multiple formula lines.

```md
<!-- TBLFM: @2=@4 -->
<!-- TBLFM: $1=$2 -->
```

This method is equivalent to chaining. Formula lines will be evaluated from
the top to the bottom. Just like when chaining, the output table after one
formula, is passed as the input to the next.

These methods can be mixed.

```md
<!-- TBLFM: @2=@4::$1=$2 -->
<!-- TBLFM: @5$3=sum(@2) -->
```

## Formatting Options

You can optionally request the result be output with a certain number of
decimal points by using a formatting directive. For example:

```md
| A   | B   | C   | D   |
| --- | --- | --- | --- |
| 1   | 2   | 5   | 6   |
| 3   | 4   | 7   | 8   |
|     |     |     |     |
<!-- TBLFM: @>=(@I+1 / @4$3);%.2f -->
```

In this example, the formatting directive is the `;%.2f` at the end. Without
that, the results would be values such as `0.14285714285714285`, but because
we have requested `2` decimal points, the results will instead be `0.14`.

## Conclusion

This documentation is a work in progress, and I am not a technical writer.
Please help improve this documentation by sending your questions or
suggestions to <https://github.com/tgrosinger/md-advanced-tables/issues>.
