import { anyChar, letter, Parjser, string, whitespace } from "parjs";
import { between, many, many1, manyBetween, map, or, then } from "parjs/combinators";
import { NonTerminal, Multiset, Token, Terminal } from "../types/token";
import { ParseResult, SyntaxRule, Warning } from "../types/rules";

function sanitisePlaceholders(placeholdersUnsanitised: string): string[] {
  return placeholdersUnsanitised
    .split(",")
    .filter((x) => x.length > 0)
    .map((placeholder) => placeholder.trim())
    .sort((a, b) => b.length - a.length); // Sort in descending order of length
}

export function sanitiseDefinition(definitionUnsanitised: string): string[] {
  const turnstile = definitionUnsanitised.replaceAll("|-", "\\vdash"); // Avoid split("|") breaking up the turnstile
  return turnstile.split("|").map((alternative) => alternative.trim().replaceAll("\\vdash", "|-"));
}

export function getPlaceholderToRuleIndex(syntax: SyntaxRule[]): Record<string, number> {
  const placeholderToRuleIndex: Record<string, number> = {};
  for (let i = 0; i < syntax.length; i++) {
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

export function parseSyntax(syntax: SyntaxRule[]): ParseResult<SyntaxRule> {
  syntax = structuredClone(syntax);

  for (const rule of syntax) {
    rule.placeholders = sanitisePlaceholders(rule.placeholdersUnsanitised);
  }

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
