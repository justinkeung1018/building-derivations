import { parseSyntax } from "@/lib/parsers/syntax";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { defaultSyntaxRule } from "./utils";

describe("Parses syntax rules", () => {
  const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{A}" };

  it("parses placeholders", () => {
    const rule = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma, \\Alpha, a,b,c" };
    const [parsed] = parseSyntax([rule]).rules;
    expect(parsed.placeholders).toEqual(["\\Gamma", "\\Alpha", "a", "b", "c"]);
  });

  it("assigns non-terminals to placeholders and terminals otherwise", () => {
    const rule1 = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "A | B|y" };
    const rule2 = { ...defaultSyntaxRule, placeholdersUnsanitised: "A,B, C", defintiionUnsanitised: "x" };
    const [parsed1, _] = parseSyntax([rule1, rule2]).rules;
    expect(parsed1.definition).toEqual([[new NonTerminal(1, "A")], [new NonTerminal(1, "B")], [new Terminal("y")]]);
  });

  it("parses multisets of non-terminals", () => {
    const type = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]).rules;
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(1, "A")])]]);
  });

  it("parses multisets of non-terminals with spaces between curly braces", () => {
    const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" };
    const type = { ...defaultSyntaxRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]).rules;
    expect(contextParsed.definition).toEqual([[new Multiset([new NonTerminal(1, "A")])]]);
  });

  it("parses multisets consisting of a mix of terminals and non-terminals", () => {
    const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A: B + C }" };
    const type = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "x" };
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
    const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ abcde }" };
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
    const rule1 = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
    const rule2 = { ...defaultSyntaxRule, placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
    expect(() => parseSyntax([rule1, rule2])).toThrow(Error);
  });

  it("does not modify the arguments", () => {
    const rule = { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B, C", definitionUnsanitised: "a" };
    const clone = structuredClone(rule);
    parseSyntax([rule]);
    expect(rule).toEqual(clone);
  });
});
