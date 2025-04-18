import { Multiset, NonTerminal, Or, Terminal } from "@/lib/types/token";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "../utils";
import { parseInferenceRules } from "@/lib/parsers/inference";
import {
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "@/lib/types/matchable";

const statementCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(5), new Terminal(":"), new NonTerminal(3)]],
};
const contextCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["\\Gamma"],
  definition: [[new Multiset([new NonTerminal(2), new Terminal(":"), new NonTerminal(3)])]],
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
    [new Terminal("("), new NonTerminal(3), new Terminal("->"), new NonTerminal(3), new Terminal(")")],
    [new NonTerminal(4)],
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
    [
      new Terminal("("),
      new Or([
        [new Terminal("\\lambda"), new NonTerminal(2), new Terminal("."), new NonTerminal(5), new Terminal(")")],
        [new NonTerminal(5), new NonTerminal(5), new Terminal(")")],
      ]),
    ],
    [new NonTerminal(2)],
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
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [
          new Name(1, "\\Gamma"),
          new MultisetElement([new Name(2, "var"), new MatchableTerminal(":"), new Name(3, "A")]),
        ]),
      ]),
      new MatchableTerminal("|-"),
      new MatchableNonTerminal(5, [new Name(2, "var")]),
      new MatchableTerminal(":"),
      new Name(3, "A"),
    ]);

    expect(arrowIntroductionParsed.premises[0].structure).toEqual([
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [
          new Name(1, "\\Gamma"),
          new MultisetElement([new Name(2, "var"), new MatchableTerminal(":"), new Name(3, "A")]),
        ]),
      ]),
      new MatchableTerminal("|-"),
      new Name(5, "M"),
      new MatchableTerminal(":"),
      new Name(3, "B"),
    ]);

    expect(arrowIntroductionParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]), // TODO: Should this just be new Name(1, "\\Gamma") instead?
      new MatchableTerminal("|-"),
      new MatchableNonTerminal(5, [
        new MatchableTerminal("("),
        new MatchableTerminal("\\lambda"),
        new Name(2, "var"),
        new MatchableTerminal("."),
        new Name(5, "M"),
        new MatchableTerminal(")"),
      ]),
      new MatchableTerminal(":"),
      new MatchableNonTerminal(3, [
        new MatchableTerminal("("),
        new Name(3, "A"),
        new MatchableTerminal("->"),
        new Name(3, "B"),
        new MatchableTerminal(")"),
      ]),
    ]);

    expect(arrowEliminationParsed.premises[0].structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new Name(5, "M"),
      new MatchableTerminal(":"),
      new MatchableNonTerminal(3, [
        new MatchableTerminal("("),
        new Name(3, "A"),
        new MatchableTerminal("->"),
        new Name(3, "B"),
        new MatchableTerminal(")"),
      ]),
    ]);

    expect(arrowEliminationParsed.premises[1].structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new Name(5, "N"),
      new MatchableTerminal(":"),
      new Name(3, "A"),
    ]);

    expect(arrowEliminationParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new MatchableNonTerminal(5, [
        new MatchableTerminal("("),
        new Name(5, "M"),
        new Name(5, "N"),
        new MatchableTerminal(")"),
      ]),
      new MatchableTerminal(":"),
      new Name(3, "B"),
    ]);
  });
});
