import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "../utils";
import { parseInferenceRules } from "@/lib/parsers/inference";

const statementCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  definition: [
    [
      new NonTerminal(1, "\\Gamma"),
      new Terminal("|-"),
      new NonTerminal(5, "M"),
      new Terminal(":"),
      new NonTerminal(3, "A"),
    ],
  ],
};
const contextCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["\\Gamma"],
  definition: [[new Multiset([new NonTerminal(2, "var"), new Terminal(":"), new NonTerminal(3, "A")])]],
};
const variableCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["var"],
  definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
};
const typeCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["A", "B"],
  definition: [
    [new NonTerminal(4, "\\varphi")],
    [new Terminal("("), new NonTerminal(3, "A"), new Terminal("->"), new NonTerminal(3, "B"), new Terminal(")")],
  ],
};
const typevarCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["\\varphi"],
  definition: [[new Terminal("1")], [new Terminal("2")], [new Terminal("3")], [new Terminal("4")], [new Terminal("5")]],
};
const termCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["M", "N"],
  definition: [
    [new NonTerminal(2, "var")],
    [
      new Terminal("("),
      new Terminal("\\lambda"),
      new NonTerminal(2, "var"),
      new Terminal("."),
      new NonTerminal(5, "M"),
      new Terminal(")"),
    ],
    [new Terminal("("), new NonTerminal(5, "M"), new NonTerminal(5, "N"), new Terminal(")")],
  ],
};

describe("Parses lambda calculus rules", () => {
  it("parses syntax rules", () => {
    const statement: SyntaxRule = { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- M: A" };
    const context: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "\\Gamma",
      definitionUnsanitised: "{ var: A }",
    };
    const variable: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "var",
      definitionUnsanitised: "x | y | z",
    };
    const type: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "A, B",
      definitionUnsanitised: "\\varphi | (A -> B)",
    };
    const typevar: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "\\varphi",
      definitionUnsanitised: "1 | 2 | 3 | 4 | 5",
    };
    const term: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "M, N",
      definitionUnsanitised: "var | (\\lambda var. M) | (MN)",
    };
    const [statementParsed, contextParsed, variableParsed, typeParsed, typevarParsed, termParsed] = parseSyntax([
      statement,
      context,
      variable,
      type,
      typevar,
      term,
    ]).rules;

    expect(statementParsed.definition).toEqual(statementCorrect.definition);
    expect(contextParsed.definition).toEqual(contextCorrect.definition);
    expect(variableParsed.definition).toEqual(variableCorrect.definition);
    expect(typeParsed.definition).toEqual(typeCorrect.definition);
    expect(typevarParsed.definition).toEqual(typevarCorrect.definition);
    expect(termParsed.definition).toEqual(termCorrect.definition);
  });

  it("parses inference rules", () => {
    const syntax = [statementCorrect, contextCorrect, variableCorrect, typeCorrect, typevarCorrect, termCorrect];
    const action = {
      ...defaultInferenceRule,
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- var: A" },
    };
    const arrowIntroduction = {
      ...defaultInferenceRule,
      premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- M: B" }],
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (\\lambda var. M): (A -> B)" },
    };
    const arrowElimination = {
      ...defaultInferenceRule,
      premises: [
        { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- M: (A -> B)" },
        { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- N: A" },
      ],
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (MN): B" },
    };
    const [actionParsed, arrowIntroductionParsed, arrowEliminationParsed] = parseInferenceRules(
      [action, arrowIntroduction, arrowElimination],
      syntax,
    ).rules;

    expect(actionParsed.conclusion.structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal(","),
      new NonTerminal(2, "var"),
      new Terminal(":"),
      new NonTerminal(3, "A"),
      new Terminal("|-"),
      new NonTerminal(2, "var"),
      new Terminal(":"),
      new NonTerminal(3, "A"),
    ]);

    expect(arrowIntroductionParsed.premises[0].structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal(","),
      new NonTerminal(2, "var"),
      new Terminal(":"),
      new NonTerminal(3, "A"),
      new Terminal("|-"),
      new NonTerminal(5, "M"),
      new Terminal(":"),
      new NonTerminal(3, "B"),
    ]);

    expect(arrowIntroductionParsed.conclusion.structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal("|-"),
      new Terminal("("),
      new Terminal("\\lambda"),
      new NonTerminal(2, "var"),
      new Terminal("."),
      new NonTerminal(5, "M"),
      new Terminal(")"),
      new Terminal(":"),
      new Terminal("("),
      new NonTerminal(3, "A"),
      new Terminal("->"),
      new NonTerminal(3, "B"),
      new Terminal(")"),
    ]);

    expect(arrowEliminationParsed.premises[0].structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal("|-"),
      new NonTerminal(5, "M"),
      new Terminal(":"),
      new Terminal("("),
      new NonTerminal(3, "A"),
      new Terminal("->"),
      new NonTerminal(3, "B"),
      new Terminal(")"),
    ]);

    expect(arrowEliminationParsed.premises[1].structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal("|-"),
      new NonTerminal(5, "N"),
      new Terminal(":"),
      new NonTerminal(3, "A"),
    ]);

    expect(arrowEliminationParsed.conclusion.structure).toEqual([
      new NonTerminal(1, "\\Gamma"),
      new Terminal("|-"),
      new Terminal("("),
      new NonTerminal(5, "M"),
      new NonTerminal(5, "N"),
      new Terminal(")"),
      new Terminal(":"),
      new NonTerminal(3, "B"),
    ]);
  });
});
