import * as mocha from 'mocha';
import {expect} from 'chai';
import { parser } from 'lezer-python';
import { traverseExpr, traverseStmt, traverse, parse, traverseOp } from '../parser';

// We write tests for each function in parser.ts here. Each function gets its 
// own describe statement. Each it statement represents a single test. You
// should write enough unit tests for each function until you are confident
// the parser works as expected. 
describe('traverseExpr(c, s) function', () => {
  it('parses a number in the beginning', () => {
    const source = "987";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(parsedExpr).to.deep.equal({tag: "num", value: 987});
  })

  it('fails to parse floating point number', () => {
    const source = "3.14";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('fails to parse out of i32 range positive number', () => {
    const source = "2147483648";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('parses a negative number in the beginning', () => {
    const source = "-987";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(parsedExpr).to.deep.equal({tag: "num", value: -987});
  })

  it('fails to parse negative floating point number', () => {
    const source = "-3.14";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('fails to parse out of i32 range negative number', () => {
    const source = "-2147483649";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('parses an identifier in the beginning', () => {
    const source = "x";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);
    expect(parsedExpr).to.deep.equal({tag: "id", name: "x"});
  })

  it('parses a binary expression in the beginning', () => {
    const source = "1 + 2";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);
    expect(parsedExpr).to.deep.equal({tag: "op", lhs: {tag: "num", value: 1}, rhs: {tag: "num", value: 2}, op: {tag: "add"}});
  })

  it('parses builtin1 print expression in the beginning', () => {
    const source = "print(1)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);
    expect(parsedExpr).to.deep.equal({tag: "builtin1", name: "print", arg: {tag: "num", value: 1}});
  })

  it('parses builtin1 abs expression in the beginning', () => {
    const source = "abs(1)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);
    expect(parsedExpr).to.deep.equal({tag: "builtin1", name: "abs", arg: {tag: "num", value: 1}});
  })

  it('fails to parse invalid builtin1 expression', () => {
    const source = "invalid(1)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('fails to parse invalid builtin1 expression with insufficient arguments', () => {
    const source = "print()";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('parses builtin2 expression in the beginning', () => {
    const source = "max(1, 2)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);
    expect(parsedExpr).to.deep.equal({tag: "builtin2", name: "max", arg1: {tag: "num", value: 1}, arg2: {tag: "num", value: 2}});
  })

  it('fails to parse invalid builtin2 expression', () => {
    const source = "invalid(1, 2)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })

  it('fails to parse invalid builtin2 expression with insufficient arguments', () => {
    const source = "min(1,)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    expect(() => traverseExpr(cursor, source)).to.throw();
  })
  // TODO: add additional tests here to ensure traverseExpr works as expected
});

describe('traverseOp(c, s) function', () => {
  it('parses operator "+"', () => {
    const source = "x + y";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();
    // go to binary expression
    cursor.firstChild();
    // go to operator
    cursor.nextSibling();

    const parsedOp = traverseOp(cursor, source);
    expect(parsedOp).to.deep.equal({tag: "add"});
  })
  
  it('parses operator "-"', () => {
    const source = "x - y";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();
    // go to binary expression
    cursor.firstChild();
    // go to operator
    cursor.nextSibling();

    const parsedOp = traverseOp(cursor, source);
    expect(parsedOp).to.deep.equal({tag: "sub"});
  })

  it('parses operator "*"', () => {
    const source = "x * y";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();
    // go to binary expression
    cursor.firstChild();
    // go to operator
    cursor.nextSibling();

    const parsedOp = traverseOp(cursor, source);
    expect(parsedOp).to.deep.equal({tag: "mul"});
  })
})

describe('traverseStmt(c, s) function', () => {
  // TODO: add tests here to ensure traverseStmt works as expected
});

describe('traverse(c, s) function', () => {
  // TODO: add tests here to ensure traverse works as expected
});

describe('parse(source) function', () => {
  it('parse a number', () => {
    const parsed = parse("987");
    expect(parsed).to.deep.equal([{tag: "expr", expr: {tag: "num", value: 987}}]);
  });  

  it('parse sequence of binary expression statements', () => {
    const parsed = parse("1 + 5\n3 * 4");
    expect(parsed).to.deep.equal([
      {tag: "expr", expr: {tag: "op", lhs: {tag: "num", value: 1}, rhs: {tag: "num", value: 5}, op: {tag: "add"}}},
      {tag: "expr", expr: {tag: "op", lhs: {tag: "num", value: 3}, rhs: {tag: "num", value: 4}, op: {tag: "mul"}}}
    ]);
  })

  // TODO: add additional tests here to ensure parse works as expected
});
