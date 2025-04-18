import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { parseSyntax } from "@/lib/parsers/syntax";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "../utils";
import { parseInferenceRules } from "@/lib/parsers/inference";
import { SyntaxRule } from "@/lib/types/rules";
import {
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "@/lib/types/matchable";

const statementCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
};
const contextCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["\\Gamma"],
  definition: [[new Multiset([new NonTerminal(2)])]],
};
const typeCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["A", "B"],
  definition: [
    [new Terminal("("), new NonTerminal(2), new Terminal("->"), new NonTerminal(2), new Terminal(")")],
    [new NonTerminal(3)],
  ],
};
const typevarCorrect: SyntaxRule = {
  ...defaultSyntaxRule,
  placeholders: ["\\varphi"],
  definition: [[new Terminal("1")], [new Terminal("2")], [new Terminal("3")], [new Terminal("4")], [new Terminal("5")]],
};

describe("Parses natural deduction rules", () => {
  it("parses syntax rules", () => {
    const statement = { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- A" };
    const context = { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{A}" };
    const type = { ...defaultSyntaxRule, placeholdersUnsanitised: "A,B", definitionUnsanitised: "\\varphi | (A -> B)" };
    const typevar = {
      ...defaultSyntaxRule,
      placeholdersUnsanitised: "\\varphi",
      definitionUnsanitised: "1 | 2 | 3 | 4 | 5",
    };
    const [statementParsed, contextParsed, typeParsed, typevarParsed] = parseSyntax([
      statement,
      context,
      type,
      typevar,
    ]).rules;
    expect(statementParsed.definition).toEqual(statementCorrect.definition);
    expect(contextParsed.placeholders).toEqual(contextCorrect.placeholders);
    expect(contextParsed.definition).toEqual(contextCorrect.definition);
    expect(typeParsed.placeholders).toEqual(typeCorrect.placeholders);
    expect(typeParsed.definition).toEqual(typeCorrect.definition);
    expect(typevarParsed.placeholders).toEqual(typevarCorrect.placeholders);
    expect(typevarParsed.definition).toEqual(typevarCorrect.definition);
  });

  it("parses inference rules", () => {
    const syntax = [statementCorrect, contextCorrect, typeCorrect, typevarCorrect];
    const action = {
      ...defaultInferenceRule,
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- A" },
    };
    const arrowIntroduction = {
      ...defaultInferenceRule,
      premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- B" }],
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
    };
    const arrowElimination = {
      ...defaultInferenceRule,
      premises: [
        { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
        { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A" },
      ],
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B" },
    };
    const [actionParsed, arrowIntroductionParsed, arrowEliminationParsed] = parseInferenceRules(
      [action, arrowIntroduction, arrowElimination],
      syntax,
    ).rules;
    expect(actionParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
      ]),
      new MatchableTerminal("|-"),
      new Name(2, "A"),
    ]);
    expect(arrowIntroductionParsed.premises[0].structure).toEqual([
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
      ]),
      new MatchableTerminal("|-"),
      new Name(2, "B"),
    ]);
    expect(arrowIntroductionParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new MatchableNonTerminal(2, [
        new MatchableTerminal("("),
        new Name(2, "A"),
        new MatchableTerminal("->"),
        new Name(2, "B"),
        new MatchableTerminal(")"),
      ]),
    ]);
    expect(arrowEliminationParsed.premises[0].structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new MatchableNonTerminal(2, [
        new MatchableTerminal("("),
        new Name(2, "A"),
        new MatchableTerminal("->"),
        new Name(2, "B"),
        new MatchableTerminal(")"),
      ]),
    ]);
    expect(arrowEliminationParsed.premises[1].structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new Name(2, "A"),
    ]);
    expect(arrowEliminationParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])]),
      new MatchableTerminal("|-"),
      new Name(2, "B"),
    ]);
  });
});
