import { Multiset, NonTerminal, Or, Terminal } from "@/lib/types/token";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { parseInferenceRules } from "@/lib/parsers/inference";
import {
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "@/lib/types/matchable";
import { getDefaultInferenceRule, getDefaultInferenceRuleStatement, getDefaultSyntaxRule } from "@/lib/utils";

const statementCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
  definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(5), new Terminal(":"), new NonTerminal(3)]],
};
const contextCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
  placeholders: ["\\Gamma"],
  definition: [[new Multiset([new NonTerminal(2), new Terminal(":"), new NonTerminal(3)])]],
};
const variableCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
  placeholders: ["var"],
  definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
};
const typeCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
  placeholders: ["A", "B"],
  definition: [
    [new Terminal("("), new NonTerminal(3), new Terminal("->"), new NonTerminal(3), new Terminal(")")],
    [new NonTerminal(4)],
  ],
};
const typevarCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
  placeholders: ["\\varphi"],
  definition: [[new Terminal("1")], [new Terminal("2")], [new Terminal("3")], [new Terminal("4")], [new Terminal("5")]],
};
const termCorrect: SyntaxRule = {
  ...getDefaultSyntaxRule(),
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
    const statement: SyntaxRule = { ...getDefaultSyntaxRule(), definitionUnsanitised: "\\Gamma |- M: A" };
    const context: SyntaxRule = {
      ...getDefaultSyntaxRule(),
      placeholdersUnsanitised: "\\Gamma",
      definitionUnsanitised: "{ var: A }",
    };
    const variable: SyntaxRule = {
      ...getDefaultSyntaxRule(),
      placeholdersUnsanitised: "var",
      definitionUnsanitised: "x | y | z",
    };
    const type: SyntaxRule = {
      ...getDefaultSyntaxRule(),
      placeholdersUnsanitised: "A, B",
      definitionUnsanitised: "\\varphi | (A -> B)",
    };
    const typevar: SyntaxRule = {
      ...getDefaultSyntaxRule(),
      placeholdersUnsanitised: "\\varphi",
      definitionUnsanitised: "1 | 2 | 3 | 4 | 5",
    };
    const term: SyntaxRule = {
      ...getDefaultSyntaxRule(),
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
      ...getDefaultInferenceRule(),
      conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, var: A |- var: A" },
    };
    const arrowIntroduction = {
      ...getDefaultInferenceRule(),
      premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, var: A |- M: B" }],
      conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (\\lambda var. M): (A -> B)" },
    };
    const arrowElimination = {
      ...getDefaultInferenceRule(),
      premises: [
        { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- M: (A -> B)" },
        { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- N: A" },
      ],
      conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (MN): B" },
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
