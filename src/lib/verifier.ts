import { buildParsers, getTokenParser } from "./parsers/syntax";
import { AST, NonTerminalAST, TerminalAST } from "./types/ast";
import { map, then } from "parjs/combinators";
import { Terminal, Token } from "./types/token";
import { SyntaxRule } from "./types/types";
import _ from "lodash";

function astToString(ast: AST): string {
  if (ast instanceof TerminalAST) {
    return ast.value;
  }
  return ast.children.map(astToString).join(" ");
}

function union(namesMaps: Record<string, AST>[]): Record<string, AST> {
  let union: Record<string, AST> = {};
  const duplicates: string[] = [];
  for (const names of namesMaps) {
    for (const name of Object.keys(names)) {
      if (Object.hasOwn(union, name) && !_.isEqual(union[name], names[name])) {
        duplicates.push(name);
      }
    }
    union = { ...union, ...names };
  }
  if (duplicates.length !== 0) {
    throw new Error(`Duplicate names: ${duplicates.join(", ")}`);
  }
  return union;
}

function matchOneSide(inputAST: AST, sideStructure: Token[], syntax: SyntaxRule[]): Record<string, AST> {
  const input = astToString(inputAST);
  const parsers = buildParsers(syntax);

  let matcher = getTokenParser(sideStructure[0], parsers).pipe(map((x) => [x]));
  for (const token of sideStructure.slice(1)) {
    matcher = matcher.pipe(
      then(getTokenParser(token, parsers)),
      map(([x, y]) => [...x, y]),
    );
  }

  const matchResult = matcher.parse(input).value;
  const names: Record<string, AST> = {};
  for (const ast of matchResult) {
    if (ast instanceof NonTerminalAST) {
      if (Object.hasOwn(names, ast.value)) {
        throw new Error("Duplicate name");
      }
      names[ast.value] = ast;
    }
  }

  return names;
}

function isMultiset(ast: AST): boolean {
  return ast instanceof NonTerminalAST && ast.children.every((child) => child.value === "");
}

function splitInputASTByTurnstile(input: AST[]): [AST[], AST[]] {
  const left = [];
  const right = [];
  let addToLeft = true;

  for (const node of input) {
    if (node instanceof TerminalAST && node.value === "|-") {
      addToLeft = false;
    } else if (addToLeft) {
      left.push(node);
    } else {
      right.push(node);
    }
  }

  if (addToLeft) {
    throw new Error("Input has no turnstile");
  }

  return [left, right];
}

function splitTokensByTurnstile(tokens: Token[]): [Token[], Token[]] {
  const left = [];
  const right = [];
  let addToLeft = true;

  for (const token of tokens) {
    if (token instanceof Terminal && token.value === "|-") {
      addToLeft = false;
    } else if (addToLeft) {
      left.push(token);
    } else {
      right.push(token);
    }
  }

  return [left, right];
}

function match(input: string, structure: Token[], syntax: SyntaxRule[]): Record<string, AST> {
  const parser = buildParsers(syntax)[0];
  const parseResult = parser.parse(input);

  if (!parseResult.isOk) {
    throw new Error("Malformed input");
  }

  const [leftInput, rightInput] = splitInputASTByTurnstile(parseResult.value);
  const [leftStructure, rightStructure] = splitTokensByTurnstile(structure);

  let names: Record<string, AST> = {};

  // Assume there's only one node on both the left and the right, for now
  if (!isMultiset(rightInput[0])) {
    const rightNames = matchOneSide(rightInput[0], rightStructure, syntax);
    names = union([names, rightNames]);
  }

  if (!isMultiset(leftInput[0])) {
    const leftNames = matchOneSide(leftInput[0], leftStructure, syntax);
    names = union([names, leftNames]);
  }

  return names;
}

export { match };
