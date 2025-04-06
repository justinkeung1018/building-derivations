import { parseSyntax } from "@/lib/parsers/syntax";
import { Multiset, NonTerminal, Or, Terminal } from "@/lib/types/token";
import { defaultSyntaxRule } from "./utils";
import { SyntaxRule } from "@/lib/types/rules";

function getDefaultStatement(): SyntaxRule {
  return { ...defaultSyntaxRule, definitionUnsanitised: "x" };
}

it("fails when no definition is provided", () => {
  const statement = { ...defaultSyntaxRule };
  expect(() => parseSyntax([statement])).toThrow("definition");
});

it("fails when any of the definition alternatives is empty", () => {
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "| a | b" };
  expect(() => parseSyntax([statement])).toThrow("alternative");
});

it("fails when a non-statement rule has no placeholders", () => {
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "abc" };
  const rule: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "def" };
  expect(() => parseSyntax([statement, rule])).toThrow("placeholder");
});

it("parses placeholders", () => {
  const rule: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma, \\Alpha, a,b,c",
    definitionUnsanitised: "x",
  };
  const [_, parsed] = parseSyntax([getDefaultStatement(), rule]).rules;
  expect(parsed.placeholders).toEqual(["\\Gamma", "\\Alpha", "a", "b", "c"]);
});

it("assigns non-terminals to placeholders and terminals otherwise", () => {
  const rule1: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "A | B|y",
  };
  const rule2: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A,B, C", definitionUnsanitised: "x" };
  const [_stmt, parsed1, _] = parseSyntax([getDefaultStatement(), rule1, rule2]).rules;
  expect(parsed1.definition).toEqual(
    new Or([[new NonTerminal(2, "A")], [new NonTerminal(2, "B")], [new Terminal("y")]]),
  );
});

it("parses multisets of non-terminals", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{A}",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual(new Or([[new Multiset([new NonTerminal(2, "A")])]]));
});

it("parses multisets of non-terminals with spaces between curly braces", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual(new Or([[new Multiset([new NonTerminal(2, "A")])]]));
});

it("parses multisets consisting of a mix of terminals and non-terminals", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A: B + C }",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "x" };
  const [_default, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual(
    new Or([
      [
        new Multiset([
          new NonTerminal(2, "A"),
          new Terminal(":"),
          new NonTerminal(2, "B"),
          new Terminal("+"),
          new NonTerminal(2, "C"),
        ]),
      ],
    ]),
  );
});

it("warns when user defines multiset consisting only of terminals", () => {
  const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ abcde }" };
  const {
    rules: [_, contextParsed],
    warnings,
  } = parseSyntax([getDefaultStatement(), context]);
  expect(contextParsed.definition).toEqual(
    new Or([
      [new Multiset([new Terminal("a"), new Terminal("b"), new Terminal("c"), new Terminal("d"), new Terminal("e")])],
    ]),
  );
  expect(warnings).toHaveLength(1);
  expect(warnings[0].message).toContain("terminal");
});

it("fails when there are duplicate placeholders", () => {
  const rule1 = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
  const rule2 = { ...defaultSyntaxRule, placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
  expect(() => parseSyntax([getDefaultStatement(), rule1, rule2])).toThrow("multiple");
});

it("parses rules with alternatives beginning with the same terminal", () => {
  // This is handled when building the term parser, not when parsing the syntax rules
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "(a) | (b)" };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual(
    new Or([
      [new Terminal("("), new Terminal("a"), new Terminal(")")],
      [new Terminal("("), new Terminal("b"), new Terminal(")")],
    ]),
  );
});

it("fails when a rule has alternatives beginning with different non-terminals that begin with the same terminal", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "A | B",
  };
  const a: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "(a)",
  };
  const b: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "B",
    definitionUnsanitised: "(b)",
  };
  expect(() => parseSyntax([statement, a, b])).toThrow("first set");
});

it("does not modify the arguments", () => {
  const rule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "a" };
  const clone = structuredClone(rule);
  parseSyntax([rule]);
  expect(rule).toEqual(clone);
});
