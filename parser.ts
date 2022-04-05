import {parser} from "lezer-python";
import {TreeCursor} from "lezer-tree";
import {Expr, Stmt, Op} from "./ast";

function parseInt32(c : TreeCursor, s : string) : number {
  let numberStr = s.substring(c.from, c.to);
  let numberValue = Number(numberStr);
  let integerValue = parseInt(numberStr, 10);

  if(numberValue !== integerValue) {
    throw new Error("ParseError: Could not parse float as i32 at " + c.from + " " + c.to + ": " + numberStr);
  }

  if(numberValue > 4294967295 || numberValue < -2147483648) {
    throw new Error("ParseError: Could not parse out of range i32 at " + c.from + " " + c.to + ": " + numberStr);
  }

  return integerValue;
}

function assertType(actual : string, expected : string) : boolean {
  return actual === expected
}

export function traverseExpr(c : TreeCursor, s : string) : Expr {
  switch(c.type.name) {
    case "Number":
      return {
        tag: "num",
        value: parseInt32(c, s)
      }
    case "UnaryExpression":
      c.firstChild();
      if(!assertType(c.type.name, "ArithOp") || !(s.substring(c.from, c.to) == "+" || s.substring(c.from, c.to) == "-")) {
        c.parent();
        throw new Error("ParseError: Could not parse i32 at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
      }

      c.nextSibling();
      if(!assertType(c.type.name, "Number")) {
        c.parent();
        throw new Error("ParseError: Could not parse i32 at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
      }

      c.parent();
      return {
        tag: "num",
        value: parseInt32(c, s)
      }
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "BinaryExpression":
      c.firstChild(); // go to lhs
      const lhs = traverseExpr(c, s);
      c.nextSibling(); // go to op
      const op = traverseOp(c, s);
      c.nextSibling(); // go to rhs
      const rhs = traverseExpr(c, s);
      c.parent(); // pop BinaryExpression
      return {
        tag: "op",
        lhs: lhs,
        op: op,
        rhs: rhs
      }
    case "CallExpression":
      c.firstChild();
      const callName = s.substring(c.from, c.to);

      if(callName == "print" || callName == "abs") {
        c.nextSibling(); // go to arglist
        c.firstChild(); // go into arglist
        c.nextSibling(); // find single argument in arglist
        const arg = traverseExpr(c, s);

        c.nextSibling();
        if(s.substring(c.from, c.to) !== ")") {
          c.parent();
          throw new Error("ParseError: Invalid arguments to builtin1 " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
        }

        c.parent(); // pop arglist
        c.parent(); // pop CallExpression
        return {
          tag: "builtin1",
          name: callName,
          arg: arg
        };
      } else if(callName == "min" || callName == "max" || callName == "pow") {
        c.nextSibling(); // go to arglist
        c.firstChild(); // go into arglist
        c.nextSibling(); // find first argument in arglist
        const arg1 = traverseExpr(c, s);
        c.nextSibling(); // skip comma
        c.nextSibling(); // find second argument in arglist
        const arg2 = traverseExpr(c, s);

        c.nextSibling();
        if(s.substring(c.from, c.to) !== ")") {
          c.parent();
          throw new Error("ParseError: Invalid arguments to builtin2 " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
        }

        c.parent(); // pop arglist
        c.parent(); // pop CallExpression
        return {
          tag: "builtin2",
          name: callName,
          arg1: arg1,
          arg2: arg2
        };
      } else {
        throw new Error("ParseError: Could not parse builtin name at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
      }

    default:
      throw new Error("ParseError: Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverseOp(c : TreeCursor, s : string) : Op {
  switch(c.type.name) {
    case "ArithOp":
      const opStr = s.substring(c.from, c.to);
      switch(opStr) {
        case "+":
          return {
            tag: "add"
          };
        case "-":
          return {
            tag: "sub"
          };
        case "*":
          return {
            tag: "mul"
          }
        default:
          throw new Error("ParseError: Could not parse arithmetic operator at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
      }
    default:
      throw new Error("ParseError: Could not parse binary operator at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  switch(c.node.type.name) {
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals
      c.nextSibling(); // go to value
      const value = traverseExpr(c, s);
      c.parent();
      return {
        tag: "define",
        name: name,
        value: value
      }
    case "ExpressionStatement":
      c.firstChild();
      const expr = traverseExpr(c, s);
      c.parent(); // pop going into stmt
      return { tag: "expr", expr: expr }
    default:
      throw new Error("ParseError: Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts = [];
      c.firstChild();
      do {
        stmts.push(traverseStmt(c, s));
      } while(c.nextSibling())
      console.log("traversed " + stmts.length + " statements ", stmts, "stopped at " , c.node);
      return stmts;
    default:
      throw new Error("ParseError: Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  if(source.trim() === "") {
    return [];
  }
  const t = parser.parse(source);
  return traverse(t.cursor(), source);
}
