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

function matchNonTerminal(ast: NonTerminalAST, token: Matchable, names: Record<string, AST>) {
  if (token instanceof Name) {
    if (token.name in names && !_.isEqual(names[token.name], ast)) {
      throw new Error(
        `Incompatible names: cannot assign ${astToString(names[token.name])} and ${astToString(ast)} to ${token.name}`,
      );
    } else if (!(token.name in names)) {
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
      matchASTWithToken(child, token.children[index], names);
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

  const unmatchedNames: string[] = [];
  for (const name of namesToMatch) {
    if (name in names) {
      // Compute the set difference: ast.elements - name.elements
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

  let multisetElementsToMatch: MultisetElement[] = token.elements.filter((x) => x instanceof MultisetElement);
  let matchedNewElements;

  do {
    matchedNewElements = false;
    const unmatched: MultisetElement[] = [];
    for (const element of multisetElementsToMatch) {
      const matches = getMultisetElementMatches(ast.elements, element, names, matched);
      if (matches.length === 0) {
        throw new Error(`Failed to match placeholder for multiset element: ${multisetElementToString(element)}`);
      } else if (matches.length === 1) {
        const match = ast.elements[matches[0]];
        for (let i = 0; i < element.tokens.length; i++) {
          matchASTWithToken(match[i], element.tokens[i], names);
        }
        matchedNewElements = true;
        matched[matches[0]] = true;
      } else {
        // There are multiple possible matches, postpone the matching
        unmatched.push(element);
      }
    }
    multisetElementsToMatch = unmatched;
  } while (matchedNewElements);

  if (unmatchedNames.length === 0 && multisetElementsToMatch.length === 0 && !matched.every((x) => x)) {
    throw new Error(
      `Unmatched multiset elements leftover: ${ast.elements
        .filter((_, i) => !matched[i])
        .map((x) => x.map(astToString).join(" "))
        .join(", ")}`,
    );
  }

  if (unmatchedNames.length === 1 && multisetElementsToMatch.length === 0) {
    names[unmatchedNames[0]] = new MultisetAST(ast.elements.filter((_, i) => !matched[i]));
  }
}

function addUnmatchedNames(token: Matchable, namesToMatch: Set<string>, names: Record<string, AST>) {
  if (token instanceof Name) {
    if (!Object.hasOwn(names, token.name)) {
      namesToMatch.add(token.name);
    }
  } else if (token instanceof MatchableNonTerminal) {
    for (const child of token.children) {
      addUnmatchedNames(child, namesToMatch, names);
    }
  } else if (token instanceof MatchableMultiset) {
    for (const element of token.elements) {
      if (element instanceof Name) {
        addUnmatchedNames(element, namesToMatch, names);
      } else {
        for (const subToken of element.tokens) {
          addUnmatchedNames(subToken, namesToMatch, names);
        }
      }
    }
  }
}

function hasUnmatchedNames(element: MultisetElement, names: Record<string, AST>) {
  const namesToMatch = new Set<string>();

  for (const token of element.tokens) {
    addUnmatchedNames(token, namesToMatch, names);
  }

  return namesToMatch.size > 0;
}

function getMultisetElementMatches(
  actualElements: AST[][],
  multisetElement: MultisetElement,
  names: Record<string, AST>,
  matched: boolean[],
): number[] {
  const matches: number[] = [];

  if (matched.every((x) => x)) {
    return matches;
  }

  for (let i = 0; i < actualElements.length; i++) {
    const actualElement = actualElements[i];
    if (actualElement.length !== multisetElement.tokens.length || matched[i]) {
      continue;
    }
    try {
      const namesClone: Record<string, AST> = {};
      for (const [name, ast] of Object.entries(names)) {
        // matchASTWithToken should not alter existing entries in its names argument,
        // so a shallow clone suffices
        namesClone[name] = ast;
      }

      actualElement.forEach((x, i) => {
        matchASTWithToken(x, multisetElement.tokens[i], namesClone);
      });

      matches.push(i);
      if (!hasUnmatchedNames(multisetElement, names)) {
        // As there are no unmatched names in the multisetElement, its actual value is fully determined.
        // If there are multiple identical matches in the multiset, we want to only return one of them
        // so we can try to match other multiset elements or names. It doesn't matter which one we match,
        // but we can and must match multisetElement against one of the identical matches.
        return matches;
      }
    } catch {
      // actualElement failed to match with multisetElement, move on to the next actualElement
    }
  }

  return matches;
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

function matchASTWithToken(ast: AST, token: Matchable, names: Record<string, AST>) {
  if (ast instanceof TerminalAST) {
    matchTerminal(ast, token);
  } else if (ast instanceof NonTerminalAST) {
    matchNonTerminal(ast, token, names);
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
      matchASTWithToken(ast, structure[index], names);
    });
  } while (numNames !== Object.keys(names).length);

  return names;
}
