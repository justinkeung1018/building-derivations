import { Multiset, NonTerminal, SyntaxRule, Terminal } from "@/lib/types";
import { anyChar, letter, string, whitespace } from "parjs";
import { between, many, many1, map, or, qthen, then, thenq } from "parjs/combinators";

function sanitisePlaceholders(placeholdersUnsanitised: string): string[] {
  return placeholdersUnsanitised
    .split(",")
    .filter((x) => x.length > 0)
    .map((placeholder) => placeholder.trim());
}

function sanitiseDefinition(definitionUnsanitised: string): string[] {
  const turnstile = definitionUnsanitised.replaceAll("|-", "\\vdash");
  return turnstile.split("|").map((alternative) => alternative.trim().replaceAll("\\vdash", "|-"));
}

function parseSyntax(syntax: SyntaxRule[]): SyntaxRule[] {
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
      qthen(nonTerminal),
      thenq(string("}")),
      map((x) => new Multiset(x)),
    );
    parser = nonTerminal.pipe(or(multiset), or(terminal), between(whitespace()), many());
  } else {
    // Treat everything as a terminal
    parser = terminal.pipe(between(whitespace()), many());
  }

  for (const rule of syntax) {
    rule.definitionSanitised = sanitiseDefinition(rule.definitionUnsanitised);
    rule.definition = rule.definitionSanitised.map((alternative) => parser.parse(alternative).value);
  }

  return syntax;
}

export { parseSyntax };
