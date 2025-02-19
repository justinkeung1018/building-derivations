import { AST, MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import { anyChar, letter, Parjser, string, whitespace } from "parjs";
import { between, later, many, many1, manySepBy, map, or, qthen, then, thenq } from "parjs/combinators";
import { NonTerminal, Multiset, Token, Terminal } from "../types/token";
import { SyntaxRule } from "../types/rules";

function sanitisePlaceholders(placeholdersUnsanitised: string): string[] {
  return placeholdersUnsanitised
    .split(",")
    .filter((x) => x.length > 0)
    .map((placeholder) => placeholder.trim());
}

function sanitiseDefinition(definitionUnsanitised: string): string[] {
  const turnstile = definitionUnsanitised.replaceAll("|-", "\\vdash"); // Avoid split("|") breaking up the turnstile
  return turnstile.split("|").map((alternative) => alternative.trim().replaceAll("\\vdash", "|-"));
}

function getPlaceholderToRuleIndex(syntax: SyntaxRule[]): Record<string, number> {
  const placeholderToRuleIndex: Record<string, number> = {};
  for (let i = 0; i < syntax.length; i++) {
    syntax[i].placeholders = sanitisePlaceholders(syntax[i].placeholdersUnsanitised);
    for (const placeholder of syntax[i].placeholders) {
      if (Object.hasOwn(placeholderToRuleIndex, placeholder)) {
        throw new Error(`Placeholder ${placeholder} is used multiple times`);
      }
      placeholderToRuleIndex[placeholder] = i;
    }
  }
  return placeholderToRuleIndex;
}

function buildSyntaxRuleParser(syntax: SyntaxRule[]): Parjser<Token[]> {
  const placeholderToRuleIndex = getPlaceholderToRuleIndex(syntax);

  // Sort in descending order of length
  const placeholders = Object.keys(placeholderToRuleIndex).sort((a, b) => b.length - a.length);

  let parser;

  // Match a backslash followed by one or more letters
  const command = string("\\").pipe(
    then(
      letter().pipe(
        many1(),
        map((x) => x.join("")),
      ),
    ),
    map((x) => x.join("")),
  );
  const terminal = command.pipe(
    or(string("|-")),
    or(string("->")),
    or(string("→")),
    or(anyChar()),
    map((x) => new Terminal(x)),
  );

  if (placeholders.length > 0) {
    // We try to match nonterminals against the set of placeholders
    let nonTerminalStr = string(placeholders[0]);
    for (const placeholder of placeholders.slice(1)) {
      nonTerminalStr = nonTerminalStr.pipe(or(string(placeholder)));
    }
    const nonTerminal = nonTerminalStr.pipe(map((x) => new NonTerminal(placeholderToRuleIndex[x], x)));
    const multiset = string("{").pipe(
      between(whitespace()),
      qthen(nonTerminal),
      between(whitespace()),
      thenq(string("}")),
      map((x) => new Multiset(x)),
    );
    parser = nonTerminal.pipe(or(multiset), or(terminal), between(whitespace()), many());
  } else {
    // Treat everything as a terminal
    parser = terminal.pipe(between(whitespace()), many());
  }

  return parser;
}

function parseSyntax(syntax: SyntaxRule[]): SyntaxRule[] {
  const parser = buildSyntaxRuleParser(syntax);

  for (const rule of syntax) {
    rule.definitionSanitised = sanitiseDefinition(rule.definitionUnsanitised);
    rule.definition = rule.definitionSanitised.map((alternative) => parser.parse(alternative).value);
  }

  return syntax;
}

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
    const nonempty = parsers[token.nonTerminal.index].pipe(
      map((x) => new NonTerminalAST(token.nonTerminal.name, x)),
      manySepBy(string(",").pipe(between(whitespace()))),
      map((x) => new MultisetAST([...x])), // We need to spread to remove the intersection type for tests to pass
    );
    const empty = string("\\varnothing").pipe(map(() => new MultisetAST([])));
    return empty.pipe(or(nonempty));
  }
}

function buildParsers(syntax: SyntaxRule[]): Parjser<AST[]>[] {
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

export {
  buildSyntaxRuleParser,
  parseSyntax,
  getPlaceholderToRuleIndex,
  getTokenParser,
  buildParsers,
  sanitiseDefinition,
};
