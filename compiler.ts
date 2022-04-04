import {Set} from "typescript";
import { Stmt, Expr, Op } from "./ast";
import { parse } from "./parser";

// https://learnxinyminutes.com/docs/wasm/

type LocalEnv = Map<string, boolean>;

type CompileResult = {
  wasmSource: string,
};

export function compile(source: string) : CompileResult {
  const ast = parse(source);

  checkUndefVariables(ast);

  const definedVars = new Set();
  ast.forEach(s => {
    switch(s.tag) {
      case "define":
        definedVars.add(s.name);
        break;
    }
  }); 
  const scratchVar : string = `(local $$last i32)`;
  const localDefines = [scratchVar];
  definedVars.forEach(v => {
    localDefines.push(`(local $${v} i32)`);
  })
  
  const commandGroups = ast.map((stmt) => codeGen(stmt));
  const commands = localDefines.concat([].concat.apply([], commandGroups));
  console.log("Generated: ", commands.join("\n"));
  return {
    wasmSource: commands.join("\n"),
  };
}

function checkUndefVariables(ast: Array<Stmt>) {
  const definedVars = new Set<string>();
  function checkUndefVariablesExpr(expr: Expr) {
    switch(expr.tag) {
      case "builtin1":
        checkUndefVariablesExpr(expr.arg);
      return;
      case "builtin2":
        checkUndefVariablesExpr(expr.arg1);
      checkUndefVariablesExpr(expr.arg2);
      return;
      case "op":
        checkUndefVariablesExpr(expr.lhs);
        checkUndefVariablesExpr(expr.rhs);
      return;
      case "id":
        if(!definedVars.has(expr.name)) {
        throw new Error("ReferenceError: Undefined variable:" + expr.name);
      }
      return;
    }
  }

  function checkUndefVariablesStmt(stmt: Stmt) {
    switch(stmt.tag) {
      case "define":
        checkUndefVariablesExpr(stmt.value);
        definedVars.add(stmt.name);
        return;
      case "expr":
        checkUndefVariablesExpr(stmt.expr);
        return;
    } 
  }

  ast.map(checkUndefVariablesStmt)
}

function codeGen(stmt: Stmt) : Array<string> {
  switch(stmt.tag) {
    case "define":
      var valStmts = codeGenExpr(stmt.value);
      return valStmts.concat([`(local.set $${stmt.name})`]);
    case "expr":
      var exprStmts = codeGenExpr(stmt.expr);
      return exprStmts.concat([`(local.set $$last)`]);
  }
}

function codeGenExpr(expr : Expr) : Array<string> {
  switch(expr.tag) {
    case "builtin1":
      const argStmts = codeGenExpr(expr.arg);
      return argStmts.concat([`(call $${expr.name})`]);
    case "builtin2":
      const arg1Stmts = codeGenExpr(expr.arg1);
      const arg2Stmts = codeGenExpr(expr.arg2);
      return arg1Stmts.concat(arg2Stmts, [`(call $${expr.name})`]);
    case "num":
      return ["(i32.const " + expr.value + ")"];
    case "id":
      return [`(local.get $${expr.name})`];
    case "op":
      const lhsStmts = codeGenExpr(expr.lhs);
      const rhsStmts = codeGenExpr(expr.rhs);
      const opStmts = codeGenOp(expr.op);
      return lhsStmts.concat(rhsStmts, opStmts);
  }
}

function codeGenOp(op: Op) : Array<string> {
  switch(op.tag) {
    case "add":
      return [`(i32.add)`];
    case "sub":
      return [`(i32.sub)`];
    case "mul":
      return [`(i32.mul)`];
  }
}
