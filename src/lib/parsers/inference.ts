import { nope, Parjser, string, whitespace } from "parjs";
import {
  Matchable,
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "../types/matchable";
import { InferenceRule, ParseResult, SyntaxRule } from "../types/rules";
import { Multiset, NonTerminal, Or, Terminal, Token } from "../types/token";
import { between, flatten, later, manySepBy, map, maybe, or, then } from "parjs/combinators";
import { sanitiseDefinition } from "./syntax";
import { ors } from "../utils";

function sanitise(unsanitised: string) {
  return sanitiseDefinition(unsanitised)[0];
}

function getTokenParser(
  token: Token,
  index: number,
  syntax: SyntaxRule[],
  parsers: Parjser<Matchable[]>[],
): Parjser<Matchable[]> {
  if (token instanceof Terminal) {
    return string(token.value).pipe(
      between(whitespace()),
      map((x) => [new MatchableTerminal(x)]),
    );
  }

  let placeholderParser: Parjser<Name> = nope("The syntax has no placeholders");

  const placeholderIndex = token instanceof NonTerminal ? token.index : index;
  const placeholders = syntax[placeholderIndex].placeholders;

  if (placeholders.length > 0) {
    placeholderParser = ors(placeholders, (x) => string(x)).pipe(map((x) => new Name(placeholderIndex, x)));
  }

  if (token instanceof NonTerminal) {
    return parsers[token.index].pipe(
      map((x) => [new MatchableNonTerminal(token.index, x)]),
      or(placeholderParser.pipe(map((x) => [x]))),
      between(whitespace()),
    );
  }

  if (token instanceof Multiset) {
    // Multiset
    let termArrayParser = getTokenParser(token.tokens[0], index, syntax, parsers).pipe(map((x) => [x]));
    for (const subToken of token.tokens.slice(1)) {
      termArrayParser = termArrayParser.pipe(
        then(getTokenParser(subToken, index, syntax, parsers)),
        map(([x, y]) => [...x, y]),
      );
    }

    // TODO: perhaps verify whether the rule has at least one alternative that only consists of one multiset token?
    // e.g. given a rule A ::= { B } c, the formulation A, c should not be allowed
    const term = termArrayParser.pipe(
      flatten(),
      map((x) => new MultisetElement(x)),
      or(placeholderParser),
      between(whitespace()),
    );
    const nonempty = term.pipe(
      manySepBy(string(",").pipe(between(whitespace()))),
      map((x) => new MatchableMultiset(index, [...x])), // We need to spread to remove the intersection type for tests to pass
    );
    const empty = string("\\varnothing").pipe(map(() => new MatchableMultiset(index, [])));
    return empty.pipe(
      or(nonempty),
      map((x) => [x]),
      between(whitespace()),
    );
  }

  if (token instanceof Or) {
    const alternativeParsers = token.alternatives.map((x) => getAlternativeParser(x, index, syntax, parsers));
    let parser = alternativeParsers[0];
    for (const alternativeParser of alternativeParsers.slice(1)) {
      parser = parser.pipe(or(alternativeParser));
    }
    return parser;
  }

  // Maybe
  const alternativeParsers = token.alternatives.map((x) => getAlternativeParser(x, index, syntax, parsers));
  let parser = alternativeParsers[0];
  for (const alternativeParser of alternativeParsers.slice(1)) {
    parser = parser.pipe(or(alternativeParser));
  }
  return parser.pipe(maybe([]));
}

function getAlternativeParser(
  tokens: Token[],
  index: number,
  syntax: SyntaxRule[],
  parsers: Parjser<Matchable[]>[],
): Parjser<Matchable[]> {
  let parser = getTokenParser(tokens[0], index, syntax, parsers);
  for (const token of tokens.slice(1)) {
    parser = parser.pipe(
      then(getTokenParser(token, index, syntax, parsers)),
      map(([x, y]) => [...x, ...y]),
    );
  }
  return parser;
}

function buildInferenceRuleStatementParser(syntax: SyntaxRule[]): Parjser<Matchable[]> {
  const parsers = [...Array(syntax.length).keys()].map(() => later<Matchable[]>());
  for (let i = 0; i < syntax.length; i++) {
    const alternativeParsers = [];
    for (const alternative of syntax[i].definition) {
      let parser = getTokenParser(alternative[0], i, syntax, parsers);
      for (const token of alternative.slice(1)) {
        parser = parser.pipe(
          then(getTokenParser(token, i, syntax, parsers)),
          map(([x, y]) => [...x, ...y]),
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
  return parsers[0];
}

export function parseInferenceRules(rules: InferenceRule[], syntax: SyntaxRule[]): ParseResult<InferenceRule> {
  // Assume the syntax is well-formed and already parsed
  rules = structuredClone(rules);

  const parser = buildInferenceRuleStatementParser(syntax);

  for (const rule of rules) {
    for (const premise of rule.premises) {
      premise.sanitised = sanitise(premise.unsanitised);
      premise.structure = parser.parse(premise.sanitised).value;
    }
    rule.conclusion.sanitised = sanitise(rule.conclusion.unsanitised);
    rule.conclusion.structure = parser.parse(rule.conclusion.sanitised).value;
  }

  return { rules, warnings: [] };
}
