import { buildParsers, getTokenParser } from "./parsers/syntax";
import { AST, MultisetAST, NonTerminalAST, TerminalAST } from "./types/ast";
import { map, then } from "parjs/combinators";
import { NonTerminal, Terminal, Token } from "./types/token";
import { SyntaxRule } from "./types/rules";
import _ from "lodash";

function astToString(ast: AST): string {
  if (ast instanceof TerminalAST) {
    return ast.value;
  } else if (ast instanceof NonTerminalAST) {
    return ast.children.map(astToString).join(" ");
  }
  return ast.elements.map(astToString).join(", ");
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
      if (Object.hasOwn(names, ast.name)) {
        throw new Error("Duplicate name");
      }
      names[ast.name] = ast;
    }
  }

  return names;
}

function isMultiset(ast: AST): boolean {
  return ast instanceof NonTerminalAST && ast.children[0] instanceof MultisetAST;
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

function removeCommas(tokens: Token[]): Token[] {
  return tokens.filter((x) => !_.isEqual(x, new Terminal(",")));
}

function removeFromMultiset(elements: NonTerminalAST[], toRemove: AST): NonTerminalAST[] {
  if (!(toRemove instanceof NonTerminalAST)) {
    throw new Error("Can only remove a non-terminal from a multiset of non-terminals");
  }
  for (let i = 0; i < elements.length; i++) {
    if (_.isEqual(elements[i].children, toRemove.children)) {
      // Only remove one instance from multiset, if multiset contains multiple instances of the same element
      return [...elements.splice(0, i), ...elements.splice(i + 1)];
    }
  }
  throw new Error("Element does not exist in multiset");
}

function matchMultiset(multiset: NonTerminalAST, toMatch: Token[], names: Record<string, AST>): Record<string, AST> {
  // TODO: clean
  let elements = (multiset.children[0] as MultisetAST).elements;

  // Since we only allow multisets of non-terminals, we do not care about matching terminals
  const namesToMatch = toMatch.filter((x) => x instanceof NonTerminal).map((x) => x.name);
  const unmatchedNames = [];

  for (const name of namesToMatch) {
    if (Object.hasOwn(names, name)) {
      elements = removeFromMultiset(elements, names[name]);
    } else {
      unmatchedNames.push(name);
    }
  }

  const matchedNames: Record<string, AST> = {};

  if (unmatchedNames.length === 1) {
    // We matched everything except the multiset, so we match the multiset now
    matchedNames[unmatchedNames[0]] = new NonTerminalAST(multiset.name, [new MultisetAST(elements)]);
  }

  return matchedNames;
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
  if (!isMultiset(leftInput[0])) {
    const leftNames = matchOneSide(leftInput[0], leftStructure, syntax);
    names = union([names, leftNames]);
  }

  if (!isMultiset(rightInput[0])) {
    const rightNames = matchOneSide(rightInput[0], rightStructure, syntax);
    names = union([names, rightNames]);
  }

  if (isMultiset(leftInput[0])) {
    const toMatch = removeCommas(leftStructure);
    const multisetNames = matchMultiset(leftInput[0] as NonTerminalAST, toMatch, names);
    names = union([names, multisetNames]);
  }

  if (isMultiset(rightInput[0])) {
    const toMatch = removeCommas(rightStructure);
    const multisetNames = matchMultiset(rightInput[0] as NonTerminalAST, toMatch, names);
    names = union([names, multisetNames]);
  }

  return names;
}

export { match };
