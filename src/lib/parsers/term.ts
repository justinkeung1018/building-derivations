import { Parjser, string, whitespace } from "parjs/.";
import { between, map, then, manySepBy, or, later } from "parjs/combinators";
import { AST, TerminalAST, NonTerminalAST, MultisetAST } from "../types/ast";
import { SyntaxRule } from "../types/rules";
import { Token, NonTerminal, Terminal } from "../types/token";

function getTokenParser(token: Token, parsers: Parjser<AST[]>[]): Parjser<AST> {
  if (token instanceof Terminal) {
    return string(token.value).pipe(
      between(whitespace()),
      map((x) => new TerminalAST(x)),
    );
  } else if (token instanceof NonTerminal) {
    return parsers[token.index].pipe(map((x) => new NonTerminalAST(token.name, x)));
  } else {
    // Multiset
    let term = getTokenParser(token.tokens[0], parsers).pipe(map((x) => [x]));
    for (const subToken of token.tokens.slice(1)) {
      term = term.pipe(
        then(getTokenParser(subToken, parsers)),
        map(([x, y]) => [...x, y]),
      );
    }
    const nonempty = term.pipe(
      manySepBy(string(",").pipe(between(whitespace()))),
      map((x) => new MultisetAST([...x])), // We need to spread to remove the intersection type for tests to pass
    );
    const empty = string("\\varnothing").pipe(map(() => new MultisetAST([])));
    return empty.pipe(or(nonempty));
  }
}

export function buildParsers(syntax: SyntaxRule[]): Parjser<AST[]>[] {
  const parsers = [...Array(syntax.length).keys()].map(() => later<AST[]>());
  for (let i = 0; i < syntax.length; i++) {
    const alternativeParsers = [];
    for (const alternative of syntax[i].definition) {
      let parser = getTokenParser(alternative[0], parsers).pipe(map((x) => [x]));
      for (const token of alternative.slice(1)) {
        parser = parser.pipe(
          then(getTokenParser(token, parsers)),
          map(([x, y]) => [...x, y]),
        );
      }
      alternativeParsers.push(parser);
    }

    let parser = alternativeParsers[0];
    for (const alternativeParser of alternativeParsers.slice(1)) {
      parser = parser.pipe(or(alternativeParser));
    }

    parsers[i].init(parser);
  }
  return parsers;
}
