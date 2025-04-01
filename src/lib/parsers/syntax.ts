import { AST, MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import { anyChar, eof, letter, Parjser, string, whitespace } from "parjs";
import {
  backtrack,
  between,
  later,
  many,
  many1,
  manyBetween,
  manySepBy,
  manyTill,
  map,
  or,
  qthen,
  recover,
  then,
  thenq,
} from "parjs/combinators";
import { NonTerminal, Multiset, Token, Terminal } from "../types/token";
import { ParseResult, SyntaxRule, Warning } from "../types/rules";

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
    const multiset = nonTerminal.pipe(
      or(terminal),
      between(whitespace()),
      manyBetween(string("{"), string("}")),
      map((x) => new Multiset(x)),
    );
    parser = nonTerminal.pipe(or(multiset), or(terminal), between(whitespace()), many());
  } else {
    // Treat everything as a terminal
    parser = terminal.pipe(between(whitespace()), many());
  }

  return parser;
}

function parseSyntax(syntax: SyntaxRule[]): ParseResult<SyntaxRule> {
  const parser = buildSyntaxRuleParser(syntax);
  const warnings: Warning[] = [];

  syntax.forEach((rule, index) => {
    rule.definitionSanitised = sanitiseDefinition(rule.definitionUnsanitised);
    rule.definition = [];

    for (const alternative of rule.definitionSanitised) {
      const tokens = parser.parse(alternative).value;

      for (const token of tokens) {
        if (token instanceof Multiset) {
          const elements = token.tokens;
          if (elements.every((element) => element instanceof Terminal)) {
            warnings.push({ index, message: "Multiset contains terminals only" });
          }
        }
      }

      rule.definition.push(tokens);
    }
  });

  return { rules: syntax, warnings };
}

function getTokenParser(token: Token, parsers: Parjser<AST[]>[], suffixParser: Parjser<AST[]> | null): Parjser<AST> {
  if (token instanceof Terminal) {
    return string(token.value).pipe(
      between(whitespace()),
      map((x) => new TerminalAST(x)),
    );
  } else if (token instanceof NonTerminal) {
    return parsers[token.index].pipe(map((x) => new NonTerminalAST(token.name, x)));
  } else {
    // Multiset
    let term = getTokenParser(token.tokens[0], parsers, suffixParser).pipe(map((x) => [x]));
    for (const subToken of token.tokens.slice(1)) {
      term = term.pipe(
        then(getTokenParser(subToken, parsers, suffixParser)),
        map(([x, y]) => [...x, y]),
      );
    }
    let nonempty;
    if (suffixParser === null) {
      // The multiset token is the last token
      nonempty = term.pipe(
        manySepBy(string(",").pipe(between(whitespace()))),
        map((x) => new MultisetAST([...x])), // We need to spread to remove the intersection type for tests to pass
      );
    } else {
      // We need eof() because manyTill() internally calls apply() (but not parse()) which succeeds even when not all input is consumed.
      // We need backtrack() because the internal call to apply() in manyTill() will advance the position of the parser without consuming the input,
      // but we want to consume the input to construct the AST in the final parser.
      // We need recover() because manyTill() will produce hard failure if the till parser (i.e. its argument) produces hard failure,
      // e.g. when the till parser succeeds until it fails on a then(). This is stupid.
      const rest = string(",").pipe(
        qthen(term),
        manyTill(
          suffixParser.pipe(
            thenq(eof()),
            backtrack(),
            recover(() => ({ kind: "Soft" })),
          ),
        ),
      );
      nonempty = term.pipe(
        then(rest),
        map(([x, y]) => new MultisetAST([x, ...y])),
      );
    }
    const empty = string("\\varnothing").pipe(map(() => new MultisetAST([])));
    return empty.pipe(or(nonempty));
  }
}

function buildParsers(syntax: SyntaxRule[]): Parjser<AST[]>[] {
  const parsers = [...Array(syntax.length).keys()].map(() => later<AST[]>());
  for (let i = 0; i < syntax.length; i++) {
    const alternativeParsers = [];
    for (const alternative of syntax[i].definition) {
      let parser = getTokenParser(alternative[alternative.length - 1], parsers, null).pipe(map((x) => [x]));
      for (let j = alternative.length - 2; j >= 0; j--) {
        parser = getTokenParser(alternative[j], parsers, parser).pipe(
          then(parser),
          map(([x, y]) => [x, ...y]),
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
