import { parseSyntax } from "@/lib/parsers/syntax";
import { Maybe, Multiset, NonTerminal, Or, Terminal } from "@/lib/types/token";
import { SyntaxRule } from "@/lib/types/rules";
import { getDefaultSyntaxRule } from "@/lib/utils";

function getDefaultStatement(): SyntaxRule {
  return { ...getDefaultSyntaxRule(), definitionUnsanitised: "x" };
}

it("fails when no definition is provided", () => {
  const statement = { ...getDefaultSyntaxRule() };
  expect(parseSyntax([statement]).errors).toEmit(0, "definition");
});

it("fails when any of the definition alternatives is empty", () => {
  const statement: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "| a | b" };
  expect(parseSyntax([statement]).errors).toEmit(0, "alternative");
});

it("fails when a non-statement rule has no placeholders", () => {
  const statement: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "abc" };
  const rule: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "def" };
  expect(parseSyntax([statement, rule]).errors).toEmit(1, "placeholder");
});

it("parses placeholders", () => {
  const rule: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma, \\Alpha, a,b,c",
    definitionUnsanitised: "x",
  };
  const [_, parsed] = parseSyntax([getDefaultStatement(), rule]).rules;
  expect(parsed.placeholders).toEqual(["\\Gamma", "\\Alpha", "a", "b", "c"]);
});

it("assigns non-terminals to placeholders and terminals otherwise", () => {
  const rule1: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "A |zB|y",
  };
  const rule2: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A,B, C",
    definitionUnsanitised: "x",
  };
  const [_stmt, parsed1, _] = parseSyntax([getDefaultStatement(), rule1, rule2]).rules;
  expect(parsed1.definition).toEqual([
    [new Terminal("z"), new NonTerminal(2)],
    [new Terminal("y")],
    [new NonTerminal(2)],
  ]);
});

it("parses multisets of non-terminals", () => {
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{A}",
  };
  const type: SyntaxRule = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2)])]]);
});

it("parses multisets of non-terminals with spaces between curly braces", () => {
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
  const [_stmt, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2)])]]);
});

it("parses multisets consisting of a mix of terminals and non-terminals", () => {
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A: B + C }",
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A, B, C",
    definitionUnsanitised: "x",
  };
  const [_default, contextParsed, _type] = parseSyntax([getDefaultStatement(), context, type]).rules;
  expect(contextParsed.definition).toEqual([
    [new Multiset([new NonTerminal(2), new Terminal(":"), new NonTerminal(2), new Terminal("+"), new NonTerminal(2)])],
  ]);
});

it("warns when user defines multiset consisting only of terminals", () => {
  const context = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ abcde }" };
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
  const rule1 = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
  const rule2 = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
  expect(parseSyntax([getDefaultStatement(), rule1, rule2]).errors).toEmitOverall("multiple");
});

it("parses rules with alternatives beginning with the same terminal", () => {
  const statement: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "(a) | (b)" };
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
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "a | ab",
  };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([[new Terminal("a"), new Maybe([[new Terminal("b")]])]]);
});

it("parses rules where alternatives are (strict) prefixes of each other", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
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
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "a | ab | ad",
  };
  const [statementParsed] = parseSyntax([statement]).rules;
  expect(statementParsed.definition).toEqual([
    [new Terminal("a"), new Maybe([[new Terminal("b")], [new Terminal("d")]])],
  ]);
});

it("fails when a rule has alternatives beginning with different non-terminals that begin with the same terminal", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "A | B",
  };
  const a: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "(a)",
  };
  const b: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "B",
    definitionUnsanitised: "(b)",
  };
  expect(parseSyntax([statement, a, b]).errors).toEmitOverall("first set");
});

it("fails when multiple alternatives are exactly the same", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "Abc | Bbc",
  };
  const rule: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A, B",
    definitionUnsanitised: "x",
  };
  expect(parseSyntax([statement, rule]).errors).toEmit(0, "duplicate");
});

it("fails when the rule is left-recursive", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "dummy",
  };
  const rule: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "Abc",
  };
  expect(parseSyntax([statement, rule]).errors).toEmit(1, "recursive");
});

it("does not modify the arguments", () => {
  const rule = { ...getDefaultSyntaxRule(), placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "a" };
  const clone = structuredClone(rule);
  parseSyntax([rule]);
  expect(rule).toEqual(clone);
});

it("parses a LaTeX command on its own", () => {
  const rule: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "\\Gamma" };
  const [ruleParsed] = parseSyntax([rule]).rules;
  console.log(parseSyntax([rule]));
  expect(ruleParsed.definition).toEqual([[new Terminal("\\Gamma")]]);
});

it("parses a LaTeX command with arguments on its own", () => {
  const rule: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "\\mathbb{R}" };
  const [ruleParsed] = parseSyntax([rule]).rules;
  expect(ruleParsed.definition).toEqual([[new Terminal("\\mathbb{R}")]]);
});

it("parses a LaTeX command with arguments followed by something else", () => {
  const rule: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "\\mathbb{R} \\lambda" };
  const [ruleParsed] = parseSyntax([rule]).rules;
  expect(ruleParsed.definition).toEqual([[new Terminal("\\mathbb{R}"), new Terminal("\\lambda")]]);
});
