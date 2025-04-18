import { AST, MultisetAST, NonTerminalAST, TerminalAST } from "../types/ast";
import { SyntaxRule } from "../types/rules";
import _ from "lodash";
import {
  Matchable,
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "../types/matchable";
import { buildTermParser } from "../parsers/term";
import { astToString, multisetElementToString } from "../utils";

function matchTerminal(ast: TerminalAST, token: Matchable) {
  if (!(token instanceof MatchableTerminal)) {
    throw new Error("Malformed input");
  }
  if (ast.value !== token.value) {
    throw new Error(`Cannot match terminals ${ast.value} and ${token.value}`);
  }
}

function matchNonTerminal(ast: NonTerminalAST, token: Matchable, names: Record<string, AST>, conservative: boolean) {
  if (token instanceof Name) {
    if (token.name in names && !_.isEqual(names[token.name], ast)) {
      throw new Error(
        `Incompatible names: cannot assign ${astToString(names[token.name])} and ${astToString(ast)} to ${token.name}`,
      );
    } else if (!(token.name in names)) {
      if (conservative) {
        throw new Error("Cannot assign new names when matching conservatively");
      }
      names[token.name] = ast;
    }
  } else if (token instanceof MatchableNonTerminal) {
    if (ast.index !== token.index) {
      throw new Error(`Cannot match non-terminals corresponding to different rules: ${ast.index} and ${token.index}`);
    }
    if (ast.children.length !== token.children.length) {
      throw new Error("Malformed non-terminal children structure");
    }
    ast.children.forEach((child, index) => {
      matchASTWithToken(child, token.children[index], names, conservative);
    });
  } else {
    throw new Error("Malformed input");
  }
}

function matchMultiset(ast: MultisetAST, token: Matchable, names: Record<string, AST>) {
  if (!(token instanceof MatchableMultiset)) {
    throw new Error("Cannot match a multiset against a non-multiset");
  }
  const matched: boolean[] = Array<boolean>(ast.elements.length).fill(false);

  const namesToMatch: string[] = token.elements.filter((x) => x instanceof Name).map((x) => x.name);
  const multisetElementsToMatch: MultisetElement[] = token.elements.filter((x) => x instanceof MultisetElement);

  const unmatchedNames: string[] = [];
  for (const name of namesToMatch) {
    if (name in names) {
      const matchedMultiset = names[name];
      if (!(matchedMultiset instanceof MultisetAST)) {
        throw new Error("Cannot match a multiset against a non-multiset");
      }
      for (const element of matchedMultiset.elements) {
        if (!markAsMatched(ast, element, matched)) {
          throw new Error(`Element not found in multiset: ${element.map(astToString).join(" ")}`);
        }
      }
    } else {
      unmatchedNames.push(name);
    }
  }

  let numUnmatchedMultisetElements = 0;
  for (const multisetElement of multisetElementsToMatch) {
    const conservative = unmatchedNames.length > 0;
    if (!matchMultisetElement(ast, multisetElement, names, matched, conservative)) {
      numUnmatchedMultisetElements++;
    }
  }

  if (unmatchedNames.length === 0 && numUnmatchedMultisetElements === 0 && !matched.every((x) => x)) {
    throw new Error(
      `Unmatched multiset elements leftover: ${ast.elements
        .filter((_, i) => !matched[i])
        .map((x) => x.map(astToString).join(" "))
        .join(", ")}`,
    );
  }

  if (unmatchedNames.length === 1 && numUnmatchedMultisetElements === 0) {
    names[unmatchedNames[0]] = new MultisetAST(ast.elements.filter((_, i) => !matched[i]));
  }
}

function matchMultisetElement(
  ast: MultisetAST,
  element: MultisetElement,
  names: Record<string, AST>,
  matched: boolean[],
  conservative: boolean,
): boolean {
  if (matched.every((x) => x)) {
    throw new Error(`There is nothing to match ${multisetElementToString(element)} against`);
  }

  for (let i = 0; i < ast.elements.length; i++) {
    const elementAST = ast.elements[i];
    if (elementAST.length !== element.tokens.length || matched[i]) {
      continue;
    }
    try {
      elementAST.forEach((x, i) => {
        matchASTWithToken(x, element.tokens[i], names, conservative);
      });
      matched[i] = true;
      return true;
    } catch {
      // elementAST failed to match with element, move on to the next elementAST
    }
  }
  return false;
}

function markAsMatched(ast: MultisetAST, element: AST[], matched: boolean[]): boolean {
  for (let i = 0; i < ast.elements.length; i++) {
    if (!matched[i] && _.isEqual(ast.elements[i], element)) {
      matched[i] = true;
      return true;
    }
  }
  return false;
}

function matchASTWithToken(ast: AST, token: Matchable, names: Record<string, AST>, conservative: boolean) {
  if (ast instanceof TerminalAST) {
    matchTerminal(ast, token);
  } else if (ast instanceof NonTerminalAST) {
    matchNonTerminal(ast, token, names, conservative);
  } else {
    matchMultiset(ast, token, names);
  }
}

export function match(
  input: string,
  structure: Matchable[],
  syntax: SyntaxRule[],
  names: Record<string, AST>,
): Record<string, AST> {
  const parser = buildTermParser(syntax);
  const parseResult = parser.parse(input);

  if (!parseResult.isOk || parseResult.value.length !== structure.length) {
    throw new Error("Malformed input");
  }

  let numNames;
  do {
    numNames = Object.keys(names).length;
    parseResult.value.forEach((ast, index) => {
      matchASTWithToken(ast, structure[index], names, false);
    });
  } while (numNames !== Object.keys(names).length);

  return names;
}
