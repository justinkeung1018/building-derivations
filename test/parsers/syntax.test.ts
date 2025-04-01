import { parseSyntax } from "@/lib/parsers/syntax";
import { SyntaxRule } from "@/lib/types/rules";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";

const defaultRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};

describe("Parses syntax rules", () => {
  const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{A}" };

  it("parses placeholders", () => {
    const rule = { ...defaultRule, placeholdersUnsanitised: "\\Gamma, \\Alpha, a,b,c" };
    const [parsed] = parseSyntax([rule]).rules;
    expect(parsed.placeholders).toEqual(["\\Gamma", "\\Alpha", "a", "b", "c"]);
  });

  it("assigns non-terminals to placeholders and terminals otherwise", () => {
    const rule1 = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "A | B|y" };
    const rule2 = { ...defaultRule, placeholdersUnsanitised: "A,B, C", defintiionUnsanitised: "x" };
    const [parsed1, _] = parseSyntax([rule1, rule2]).rules;
    expect(parsed1.definition).toEqual([[new NonTerminal(1, "A")], [new NonTerminal(1, "B")], [new Terminal("y")]]);
  });

  it("parses multisets of non-terminals", () => {
    const type = { ...defaultRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]).rules;
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(1, "A")])]]);
  });

  it("parses multisets of non-terminals with spaces between curly braces", () => {
    const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" };
    const type = { ...defaultRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]).rules;
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(1, "A")])]]);
  });

  it("parses multisets consisting of a mix of terminals and non-terminals", () => {
    const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A: B + C }" };
    const type = { ...defaultRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]).rules;
    expect(contextParsed.definition).toEqual([
      [
        new Multiset([
          new NonTerminal(1, "A"),
          new Terminal(":"),
          new NonTerminal(1, "B"),
          new Terminal("+"),
          new NonTerminal(1, "C"),
        ]),
      ],
    ]);
  });

  it("warns when user defines multiset consisting only of terminals", () => {
    const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ abcde }" };
    const {
      rules: [contextParsed],
      warnings,
    } = parseSyntax([context]);
    expect(contextParsed.definition).toEqual([
      [new Multiset([new Terminal("a"), new Terminal("b"), new Terminal("c"), new Terminal("d"), new Terminal("e")])],
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain("terminal");
  });

  it("fails when there are duplicate placeholders", () => {
    const rule1 = { ...defaultRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
    const rule2 = { ...defaultRule, placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
    expect(() => parseSyntax([rule1, rule2])).toThrow(Error);
  });

  it("parses logic syntax", () => {
    const statement = { ...defaultRule, definitionUnsanitised: "\\Gamma |- A" };
    const type = { ...defaultRule, placeholdersUnsanitised: "A,B", definitionUnsanitised: "\\varphi | (A -> B)" };
    const typevar = { ...defaultRule, placeholdersUnsanitised: "\\varphi", definitionUnsanitised: "1 | 2 | 3 | 4 | 5" };
    const [statementParsed, contextParsed, typeParsed, typevarParsed] = parseSyntax([
      statement,
      context,
      type,
      typevar,
    ]).rules;
    expect(statementParsed.definition).toEqual([
      [new NonTerminal(1, "\\Gamma"), new Terminal("|-"), new NonTerminal(2, "A")],
    ]);
    expect(contextParsed.placeholders).toEqual(["\\Gamma"]);
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2, "A")])]]);
    expect(typeParsed.placeholders).toEqual(["A", "B"]);
    expect(typeParsed.definition).toEqual([
      [new NonTerminal(3, "\\varphi")],
      [new Terminal("("), new NonTerminal(2, "A"), new Terminal("->"), new NonTerminal(2, "B"), new Terminal(")")],
    ]);
    expect(typevarParsed.placeholders).toEqual(["\\varphi"]);
    expect(typevarParsed.definition).toEqual([
      [new Terminal("1")],
      [new Terminal("2")],
      [new Terminal("3")],
      [new Terminal("4")],
      [new Terminal("5")],
    ]);
  });

  it("parses lambda calculus with type assignment syntax", () => {
    const statement: SyntaxRule = { ...defaultRule, definitionUnsanitised: "\\Gamma |- M: A" };
    const context: SyntaxRule = {
      ...defaultRule,
      placeholdersUnsanitised: "\\Gamma",
      definitionUnsanitised: "{ varasmt }",
    };
    const varasmt: SyntaxRule = { ...defaultRule, placeholdersUnsanitised: "varasmt", definitionUnsanitised: "var: A" };
    const variable: SyntaxRule = { ...defaultRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" };
    const type: SyntaxRule = {
      ...defaultRule,
      placeholdersUnsanitised: "A, B",
      definitionUnsanitised: "\\varphi | (A -> B)",
    };
    const typevar: SyntaxRule = {
      ...defaultRule,
      placeholdersUnsanitised: "\\varphi",
      definitionUnsanitised: "1 | 2 | 3 | 4 | 5",
    };
    const lambda: SyntaxRule = {
      ...defaultRule,
      placeholdersUnsanitised: "M, N",
      definitionUnsanitised: "var | (\\lambda var. M) | (MN)",
    };
    const [statementParsed, contextParsed, varasmtParsed, variableParsed, typeParsed, typevarParsed, lambdaParsed] =
      parseSyntax([statement, context, varasmt, variable, type, typevar, lambda]).rules;

    expect(statementParsed.definition).toEqual([
      [
        new NonTerminal(1, "\\Gamma"),
        new Terminal("|-"),
        new NonTerminal(6, "M"),
        new Terminal(":"),
        new NonTerminal(4, "A"),
      ],
    ]);
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(2, "varasmt")])]]);
    expect(varasmtParsed.definition).toEqual([[new NonTerminal(3, "var"), new Terminal(":"), new NonTerminal(4, "A")]]);
    expect(variableParsed.definition).toEqual([[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]]);
    expect(typeParsed.definition).toEqual([
      [new NonTerminal(5, "\\varphi")],
      [new Terminal("("), new NonTerminal(4, "A"), new Terminal("->"), new NonTerminal(4, "B"), new Terminal(")")],
    ]);
    expect(typevarParsed.definition).toEqual([
      [new Terminal("1")],
      [new Terminal("2")],
      [new Terminal("3")],
      [new Terminal("4")],
      [new Terminal("5")],
    ]);
    expect(lambdaParsed.definition).toEqual([
      [new NonTerminal(3, "var")],
      [
        new Terminal("("),
        new Terminal("\\lambda"),
        new NonTerminal(3, "var"),
        new Terminal("."),
        new NonTerminal(6, "M"),
        new Terminal(")"),
      ],
      [new Terminal("("), new NonTerminal(6, "M"), new NonTerminal(6, "N"), new Terminal(")")],
    ]);
  });
});
