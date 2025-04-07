import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "./utils";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { parseInferenceRules } from "@/lib/parsers/inference";
import {
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "@/lib/types/matchable";

it("parses placeholders consisting of one character", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "A",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "A")]);
});

it("parses placeholders consisting of multiple characters", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["var"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "var",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "var")]);
});

it("parses statements with multiple tokens", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "A |- B",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "A"), new MatchableTerminal("|-"), new Name(1, "B")]);
});

it("fails to parse left-recursive non-terminal rules", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")], [new NonTerminal(1), new Terminal(";"), new NonTerminal(1)]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "A;B",
    },
  };
  expect(() => parseInferenceRules([rule], [statement, type])).toThrow(Error);
});

it("parses non-terminals where a placeholder name is same as the stringified definition", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B", "(A;B"],
    definition: [[new Terminal("x")], [new Terminal("("), new NonTerminal(1), new Terminal(";"), new NonTerminal(1)]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "(A;B",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([
    new MatchableNonTerminal(1, [
      new MatchableTerminal("("),
      new Name(1, "A"),
      new MatchableTerminal(";"),
      new Name(1, "B"),
    ]),
  ]);
});

it("parses multisets where each element consists of one non-terminal", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "\\Gamma, A",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, context, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
    ]),
  ]);
});

it("parses rules consisting of a non-terminal representing a multiset, followed by something else", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1), new Terminal(";")]],
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...defaultInferenceRule,
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "\\Gamma, A;",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, context, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
    ]),
    new MatchableTerminal(";"),
  ]);
});

describe("multisets where each element consists of multiple tokens", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2), new Terminal(";"), new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };

  it("parses when the placeholder comes before elements", () => {
    const rule: InferenceRule = {
      ...defaultInferenceRule,
      conclusion: {
        ...defaultInferenceRuleStatement,
        unsanitised: "\\Gamma, A;B",
      },
    };
    const [ruleParsed] = parseInferenceRules([rule], [statement, context, type]).rules;
    expect(ruleParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [
          new Name(1, "\\Gamma"),
          new MultisetElement([new Name(2, "A"), new MatchableTerminal(";"), new Name(2, "B")]),
        ]),
      ]),
    ]);
  });

  it("parses when the placeholder comes after elements", () => {
    const rule: InferenceRule = {
      ...defaultInferenceRule,
      conclusion: {
        ...defaultInferenceRuleStatement,
        unsanitised: "A;B, \\Gamma",
      },
    };
    const [ruleParsed] = parseInferenceRules([rule], [statement, context, type]).rules;
    expect(ruleParsed.conclusion.structure).toEqual([
      new MatchableNonTerminal(1, [
        new MatchableMultiset(1, [
          new MultisetElement([new Name(2, "A"), new MatchableTerminal(";"), new Name(2, "B")]),
          new Name(1, "\\Gamma"),
        ]),
      ]),
    ]);
  });
});

it("does not modify the arguments", () => {
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B"],
    definition: [[new Terminal("a")]],
  };
  const inferenceRule: InferenceRule = {
    ...defaultInferenceRule,
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "A" }],
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "B" },
  };
  const statementClone = structuredClone(statement);
  const typeClone = structuredClone(type);
  const inferenceRuleClone = structuredClone(inferenceRule);
  parseInferenceRules([inferenceRule], [statement, type]);
  expect(statement).toEqual(statementClone);
  expect(type).toEqual(typeClone);
  expect(inferenceRule).toEqual(inferenceRuleClone);
});
