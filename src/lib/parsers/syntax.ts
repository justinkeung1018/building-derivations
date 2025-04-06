import { anyChar, letter, Parjser, string, whitespace } from "parjs";
import { between, many, many1, manyBetween, map, or, then } from "parjs/combinators";
import { NonTerminal, Multiset, Token, Terminal } from "../types/token";
import { ParseResult, SyntaxRule, Warning } from "../types/rules";

function sanitisePlaceholders(placeholdersUnsanitised: string): string[] {
  if (placeholdersUnsanitised.trim().length === 0) {
    throw new Error("Every non-statement rule must have at least one placeholder");
  }
  const split = placeholdersUnsanitised.split(",").map((x) => x.trim());
  if (split.some((x) => x.length === 0)) {
    throw new Error("Empty placeholder supplied");
  }
  return split.sort((a, b) => b.length - a.length);
}

export function sanitiseDefinition(definitionUnsanitised: string): string[] {
  if (definitionUnsanitised.trim().length === 0) {
    throw new Error("Every rule must have a definition");
  }
  const turnstile = definitionUnsanitised.replaceAll("|-", "\\vdash"); // Avoid split("|") breaking up the turnstile
  const result = turnstile.split("|").map((x) => x.trim().replaceAll("\\vdash", "|-"));
  if (result.some((x) => x.length === 0)) {
    throw new Error("Empty alternative definition supplied");
  }
  return result;
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

function addAlternativeFirstSet(firstSet: Set<string>, alternative: Token[], syntax: SyntaxRule[]) {
  if (alternative[0] instanceof Terminal) {
    firstSet.add(alternative[0].value);
  } else if (alternative[0] instanceof NonTerminal) {
    for (const token of getFirstSet(alternative[0].index, syntax)) {
      firstSet.add(token);
    }
  } else {
    firstSet.add("\\varnothing");
    addAlternativeFirstSet(firstSet, alternative[0].tokens, syntax);
  }
}

function getFirstSet(index: number, syntax: SyntaxRule[]): Set<string> {
  const definition = syntax[index].definition;
  const firstSet = new Set<string>();
  for (const alternative of definition) {
    addAlternativeFirstSet(firstSet, alternative, syntax);
  }
  return firstSet;
}

export function parseSyntax(syntax: SyntaxRule[]): ParseResult<SyntaxRule> {
  syntax = structuredClone(syntax);

  for (const rule of syntax.slice(1)) {
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

  const firstSets: Set<string>[] = syntax.map((_, index) => getFirstSet(index, syntax));
  for (const rule of syntax) {
    // We can handle different alternatives beginning with the same terminal
    // and different alternatives beginnning with the same non-terminal (i.e. they refer to the same rule)
    const firstTokens = rule.definition.map((x) => x[0]);
    const firstNonTerminalIndices = [
      ...new Set(firstTokens.filter((x) => x instanceof NonTerminal).map((x) => x.index)),
    ];
    const relevantFirstSets = firstNonTerminalIndices.map((x) => firstSets[x]);

    const unique = new Set();
    for (const firstSet of relevantFirstSets) {
      for (const token of firstSet) {
        if (unique.has(token)) {
          throw new Error("Alternatives beginning with different non-terminals have the same first set");
        }
        unique.add(token);
      }
    }
  }

  return { rules: syntax, warnings };
}
