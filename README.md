# CSE231 Assignment 1

## Differing behaviors between standard Python and this PA

### Print Built-in

The `print` builtin in standard Python programs can take multiple arguments
allowing code like this:

```python
>>> print(x, y, 1 + 2)
<x> , <y>, 3
```

The print builtin from this PA is restricted to a single argument at the
grammar level. This could be changed by modifying the AST to allow for an
arbitrary number of comma-separated expressions for the `print` builtin
and appropriately modifying the external function that handles the printing.

The `print` builtin in Python also returns `NoneType` so its result cannot
usually be meaningfully used. In this PA the `print` built in returns the
value of of its argument expression, making it valid to use as part of other
expressions.

```python
>>> 1 + print(1)
2
```

This is because all the imported builtins are setup to have the
type `i32 -> i32`. We could change this so that the `print` builtin does not
have any result by omitting the `result` part of the type declaration of the
`$print` import and appropriately account for this in the grammar.

### Integer Precision Limitations

Integers in python have arbitrary precision so even if an operation results
in a very large integral value the result remains correct:

```python
>>> 2 ** 31
2147483648
```

The integers in this PA are compiled to i32s in WebAssembly and so the results
of all the operations are truncated to 32 bits integers in 2s complement.

```python
>>> 2 ** 31
-2147483648
```

We could use a larger integer type or build some higher level abstraction of
arbitrary precision integers on top of the built-in WebAssembly types to get
around this.

Another place where this is visible is in the implementation of the `pow` builtin
which in this PA is done using a TypeScript function that is added as an import
to the compiled code. TypeScript (and JavaScript) use 64-bit floats to represent
all Number values so when the value goes out of range it becomes Infinity/-Infinity
which when returned back to WebAssembly becomes 0.

```python
>>> pow(pow(3, 33), 3)
0
```

### Integer Operation Rounding

Since we use only i32 values, any operations that could result in fractional results
are truncated down to integers. We could get around this by also adding floating
point types.

```python
>>> pow(2, -1)
0
```

## Helpful Resources/References

I already had some level of familiarity with JavaScript and WebAssembly from before
so the most useful reference for me was the Lezer documentation and the existing
starter code.

## Collaborators

I discussed some of my approach with respect to handling overflows and parsing
integer literals with Venkat Krishnamohan.
