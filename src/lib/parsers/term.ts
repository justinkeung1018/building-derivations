import { Parjser, string, whitespace } from "parjs";
import { between, map, then, manySepBy, or, later, flatten, maybe } from "parjs/combinators";
import { AST, TerminalAST, NonTerminalAST, MultisetAST } from "../types/ast";
import { SyntaxRule } from "../types/rules";
import { Token, NonTerminal, Terminal, Or, Multiset } from "../types/token";
import _ from "lodash";

function getTokenParser(token: Token, parsers: Parjser<AST[]>[]): Parjser<AST[]> {
  if (token instanceof Terminal) {
    return string(token.value).pipe(
      between(whitespace()),
      map((x) => [new TerminalAST(x)]),
    );
  }

  if (token instanceof NonTerminal) {
    return parsers[token.index].pipe(map((x) => [new NonTerminalAST(token.index, x)]));
  }

  if (token instanceof Multiset) {
    let term = getTokenParser(token.tokens[0], parsers).pipe(map((x) => [x]));
    for (const subToken of token.tokens.slice(1)) {
      term = term.pipe(
        then(getTokenParser(subToken, parsers)),
        map(([x, y]) => [...x, y]),
      );
    }
    const nonempty = term.pipe(
      flatten(),
      manySepBy(string(",").pipe(between(whitespace()))),
      map((x) => new MultisetAST([...x])), // We need to spread to remove the intersection type for tests to pass
    );
    const empty = string("\\varnothing").pipe(map(() => new MultisetAST([])));
    return empty.pipe(
      or(nonempty),
      map((x) => [x]),
    );
  }

  if (token instanceof Or) {
    const alternativeParsers = token.alternatives.map((x) => getAlternativeParser(x, parsers));
    let parser = alternativeParsers[0];
    for (const alternativeParser of alternativeParsers.slice(1)) {
      parser = parser.pipe(or(alternativeParser));
    }
    return parser;
  }

  // Maybe
  const alternativeParsers = token.alternatives.map((x) => getAlternativeParser(x, parsers));
  let parser = alternativeParsers[0];
  for (const alternativeParser of alternativeParsers.slice(1)) {
    parser = parser.pipe(or(alternativeParser));
  }
  return parser.pipe(maybe([]));
}

function getAlternativeParser(tokens: Token[], parsers: Parjser<AST[]>[]): Parjser<AST[]> {
  let parser = getTokenParser(tokens[0], parsers);
  for (const token of tokens.slice(1)) {
    parser = parser.pipe(
      then(getTokenParser(token, parsers)),
      map(([x, y]) => [...x, ...y]),
    );
  }
  return parser;
}

export function buildTermParser(syntax: SyntaxRule[]): Parjser<AST[]> {
  const parsers = [...Array(syntax.length).keys()].map(() => later<AST[]>());

  syntax.forEach((rule, index) => {
    const alternativeParsers = rule.definition.map((x) => getAlternativeParser(x, parsers));
    let parser = alternativeParsers[0];
    for (const alternativeParser of alternativeParsers.slice(1)) {
      parser = parser.pipe(or(alternativeParser));
    }
    parsers[index].init(parser);
  });

  return parsers[0];
}
