import { anyChar, Parjser, regexp, string, whitespace } from "parjs";
import { between, many, manyBetween, manyTill, map, not, or, then } from "parjs/combinators";
import { NonTerminal, Multiset, Token, Terminal } from "../types/token";
import { ParseResult, SyntaxRule } from "../types/rules";
import { ErrorMap, MessageMap } from "../types/messagemap";
import { normalise } from "../latexify";

function sanitisePlaceholders(placeholdersUnsanitised: string): string[] {
  if (placeholdersUnsanitised.trim().length === 0) {
    throw new Error("Every non-statement rule must have at least one placeholder");
  }
  const split = placeholdersUnsanitised.split(",").map((x) => x.trim());
  if (split.some((x) => x.length === 0)) {
    throw new Error("Empty placeholder supplied");
  }
  return split.sort((a, b) => b.length - a.length).map(normalise);
}

function sanitiseDefinition(definitionUnsanitised: string): string[] {
  if (definitionUnsanitised.trim().length === 0) {
    throw new Error("Rule definition cannot be empty");
  }
  const turnstile = definitionUnsanitised.replaceAll("|-", "\\vdash"); // Avoid split("|") breaking up the turnstile
  const result = turnstile.split("|").map((x) => normalise(x));
  if (result.some((x) => x.length === 0)) {
    throw new Error(`All alternative definitions must be non-empty`);
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
      regexp(/[a-zA-Z{}]/).pipe(
        manyTill(regexp(/[a-zA-Z{}]/).pipe(not())),
        map((x) => x.join("")),
      ),
    ),
    map((x) => x.join("")),
  );
  const terminal = command.pipe(
    or("|-"),
    or("->"),
    or(anyChar()),
    map((x) => new Terminal(x)),
  );

  if (placeholders.length > 0) {
    // We try to match nonterminals against the set of placeholders
    let nonTerminalStr = string(placeholders[0]);
    for (const placeholder of placeholders.slice(1)) {
      nonTerminalStr = nonTerminalStr.pipe(or(string(placeholder)));
    }
    const nonTerminal = nonTerminalStr.pipe(map((x) => new NonTerminal(placeholderToRuleIndex[x])));
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

function addAlternativeFirstSet(firstSet: Set<string>, index: number, alternative: Token[], syntax: SyntaxRule[]) {
  if (alternative[0] instanceof Terminal) {
    firstSet.add(alternative[0].value);
  } else if (alternative[0] instanceof NonTerminal) {
    if (index === alternative[0].index) {
      throw new Error("Left-recursive definitions are not allowed");
    }
    for (const token of getFirstSet(alternative[0].index, syntax)) {
      firstSet.add(token);
    }
  } else {
    // Multiset
    firstSet.add("\\varnothing");
    addAlternativeFirstSet(firstSet, index, alternative[0].tokens, syntax);
  }
}

function getFirstSet(index: number, syntax: SyntaxRule[]): Set<string> {
  const firstSet = new Set<string>();
  for (const alternative of syntax[index].definition) {
    addAlternativeFirstSet(firstSet, index, alternative, syntax);
  }
  return firstSet;
}

export function parseSyntax(syntax: SyntaxRule[]): ParseResult<SyntaxRule> {
  syntax = structuredClone(syntax);
  const warnings = new MessageMap();
  const errors = new ErrorMap();

  syntax.forEach((rule, index) => {
    if (index === 0) {
      return;
    }
    try {
      rule.placeholders = sanitisePlaceholders(rule.placeholdersUnsanitised);
    } catch (error) {
      errors.pushError(index, error);
    }
  });

  let parser: Parjser<Token[]>;
  try {
    parser = buildSyntaxRuleParser(syntax);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    errors.pushOverall(error.message);
    return { rules: syntax, warnings, errors };
  }

  syntax.forEach((rule, index) => {
    try {
      rule.definitionSanitised = sanitiseDefinition(rule.definitionUnsanitised);
      rule.definition = [];

      for (const alternative of rule.definitionSanitised) {
        const tokens = parser.parse(alternative).value;

        for (const token of tokens) {
          if (token instanceof Multiset) {
            const elements = token.tokens;
            if (elements.every((element) => element instanceof Terminal)) {
              warnings.push(index, "Multiset contains terminals only");
            }
          }
        }

        rule.definition.push(tokens);
      }
    } catch (error) {
      errors.pushError(index, error);
    }
  });

  syntax.forEach((_, index) => {
    try {
      getFirstSet(index, syntax);
    } catch {
      errors.pushError(index, new Error("Left-recursive rules are not allowed"));
    }
  });

  return { rules: syntax, warnings, errors };
}
