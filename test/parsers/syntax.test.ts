import { parseSyntax } from "@/lib/parsers/syntax";
import { Maybe, Multiset, NonTerminal, Or, Terminal } from "@/lib/types/token";
import { SyntaxRule } from "@/lib/types/rules";
import { defaultSyntaxRule } from "@/lib/utils";

function getDefaultStatement(): SyntaxRule {
  return { ...defaultSyntaxRule, definitionUnsanitised: "x" };
}

it("fails when no definition is provided", () => {
  const statement = { ...defaultSyntaxRule };
  expect(parseSyntax([statement]).errors).toEmit(0, "definition");
});

it("fails when any of the definition alternatives is empty", () => {
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "| a | b" };
  expect(parseSyntax([statement]).errors).toEmit(0, "alternative");
});

it("fails when a non-statement rule has no placeholders", () => {
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "abc" };
  const rule: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "def" };
  expect(parseSyntax([statement, rule]).errors).toEmit(1, "placeholder");
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
    definitionUnsanitised: "A |zB|y",
  };
  const rule2: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A,B, C", definitionUnsanitised: "x" };
  const [_stmt, parsed1, _] = parseSyntax([getDefaultStatement(), rule1, rule2]).rules;
  expect(parsed1.definition).toEqual([
    [new Terminal("z"), new NonTerminal(2)],
    [new Terminal("y")],
    [new NonTerminal(2)],
  ]);
});

it("parses multisets of non-terminals", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{A}",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2)])]]);
});

it("parses multisets of non-terminals with spaces between curly braces", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2)])]]);
});

it("parses multisets consisting of a mix of terminals and non-terminals", () => {
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A: B + C }",
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "x" };
  const [_default, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([
    [new Multiset([new NonTerminal(2), new Terminal(":"), new NonTerminal(2), new Terminal("+"), new NonTerminal(2)])],
  ]);
});

it("warns when user defines multiset consisting only of terminals", () => {
  const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ abcde }" };
  const {
    rules: [_, contextParsed],
    warnings,
  } = parseSyntax([getDefaultStatement(), context]);
  expect(contextParsed.definition).toEqual([
    [new Multiset([new Terminal("a"), new Terminal("b"), new Terminal("c"), new Terminal("d"), new Terminal("e")])],
  ]);
  expect(warnings.size).toEqual(1);
  expect(warnings).toEmit(1, "terminal");
});

it("fails when there are duplicate placeholders", () => {
  const rule1 = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
  const rule2 = { ...defaultSyntaxRule, placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
  expect(parseSyntax([getDefaultStatement(), rule1, rule2]).errors).toEmitOverall("multiple");
});

it("parses rules with alternatives beginning with the same terminal", () => {
  const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "(a) | (b)" };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([
    [
      new Terminal("("),
      new Or([
        [new Terminal("a"), new Terminal(")")],
        [new Terminal("b"), new Terminal(")")],
      ]),
    ],
  ]);
});

it("parses rules where one alternative is a (strict) prefix of another alternative", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "a | ab",
  };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([[new Terminal("a"), new Maybe([[new Terminal("b")]])]]);
});

it("parses rules where alternatives are (strict) prefixes of each other", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "abc | abcd | abcde | abcdef",
  };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([
    [
      new Terminal("a"),
      new Terminal("b"),
      new Terminal("c"),
      new Maybe([[new Terminal("d"), new Maybe([[new Terminal("e"), new Maybe([[new Terminal("f")]])]])]]),
    ],
  ]);
});

it("parses rules with multiple alternatives within a Maybe", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "a | ab | ad",
  };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([
    [new Terminal("a"), new Maybe([[new Terminal("b")], [new Terminal("d")]])],
  ]);
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
  expect(parseSyntax([statement, a, b]).errors).toEmitOverall("first set");
});

it("fails when multiple alternatives are exactly the same", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "Abc | Bbc",
  };
  const rule: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A, B",
    definitionUnsanitised: "x",
  };
  expect(parseSyntax([statement, rule]).errors).toEmit(0, "duplicate");
});

it("fails when the rule is left-recursive", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "dummy",
  };
  const rule: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "Abc",
  };
  expect(parseSyntax([statement, rule]).errors).toEmit(1, "recursive");
});

it("does not modify the arguments", () => {
  const rule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "a" };
  const clone = structuredClone(rule);
  parseSyntax([rule]);
  expect(rule).toEqual(clone);
});
