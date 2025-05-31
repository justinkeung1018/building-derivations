import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { parseInferenceRules } from "@/lib/parsers/inference";
import {
  MatchableMultiset,
  MatchableNonTerminal,
  MatchableTerminal,
  MultisetElement,
  Name,
} from "@/lib/types/matchable";
import { getDefaultSyntaxRule, getDefaultInferenceRule, getDefaultInferenceRuleStatement } from "@/lib/utils";

it("fails when empty rule name is supplied", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    name: "    ",
  };
  expect(parseInferenceRules([rule], [statement]).errors).toEmit(0, "name");
});

it("parses placeholders consisting of one character", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "A")]);
});

it("parses placeholders consisting of multiple characters", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["var"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "var",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "var")]);
});

it("parses statements with multiple tokens", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A |- B",
    },
  };
  const [ruleParsed] = parseInferenceRules([rule], [statement, type]).rules;
  expect(ruleParsed.conclusion.structure).toEqual([new Name(1, "A"), new MatchableTerminal("|-"), new Name(1, "B")]);
});

it("parses non-terminals where a placeholder name is same as the stringified definition", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B", "(A;B"],
    definition: [[new Terminal("x")], [new Terminal("("), new NonTerminal(1), new Terminal(";"), new NonTerminal(1)]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
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
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
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
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal(";")]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
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
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2), new Terminal(";"), new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };

  it("parses when the placeholder comes before elements", () => {
    const rule: InferenceRule = {
      ...getDefaultInferenceRule(),
      conclusion: {
        ...getDefaultInferenceRuleStatement(),
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
      ...getDefaultInferenceRule(),
      conclusion: {
        ...getDefaultInferenceRuleStatement(),
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

it("fails when the conclusion is empty", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "   ",
    },
  };
  expect(parseInferenceRules([rule], [statement]).errors).toEmit(0, "empty");
});

it("fails when the conclusion is not a valid statement", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "y",
    },
  };
  expect(parseInferenceRules([rule], [statement]).errors).toEmit(0, "statement");
});

it("fails when any of the premises is empty, and throws an error for every empty premise", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "x",
    },
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "x",
      },
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "",
      },
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "    ",
      },
    ],
  };
  const errors = parseInferenceRules([rule], [statement]).errors;
  expect(errors).toEmit(0, "Premise 2");
  expect(errors).toEmit(0, "Premise 3");
});

it("fails when any of the premises is not a valid statement, and throws an error for every invalid premise", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "x",
    },
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "x",
      },
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "y",
      },
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "z",
      },
    ],
  };
  const errors = parseInferenceRules([rule], [statement]).errors;
  expect(errors).toEmit(0, "Premise 2");
  expect(errors).toEmit(0, "Premise 3");
});

it("parses rules where two alternatives share the same leading terminal", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x"), new Terminal("y"), new Terminal("y")],
      [new Terminal("x"), new Terminal("z"), new Terminal("z")],
    ],
  };
  const rule1: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "xyy",
    },
  };
  const rule2: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "xzz",
    },
  };
  const [rule1Parsed, rule2Parsed] = parseInferenceRules([rule1, rule2], [statement]).rules;
  expect(rule1Parsed.conclusion.structure).toEqual([
    new MatchableTerminal("x"),
    new MatchableTerminal("y"),
    new MatchableTerminal("y"),
  ]);
  expect(rule2Parsed.conclusion.structure).toEqual([
    new MatchableTerminal("x"),
    new MatchableTerminal("z"),
    new MatchableTerminal("z"),
  ]);
});

it("parses rules with Maybe in the syntax", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("x"), new Terminal("y"), new Terminal("y")],
      [new Terminal("x"), new Terminal("z"), new Terminal("z")],
    ],
  };
  const rule1: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "x",
    },
  };
  const rule2: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "xyy",
    },
  };
  const rule3: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "xzz",
    },
  };
  const [rule1Parsed, rule2Parsed, rule3Parsed] = parseInferenceRules([rule1, rule2, rule3], [statement]).rules;
  expect(rule1Parsed.conclusion.structure).toEqual([new MatchableTerminal("x")]);
  expect(rule2Parsed.conclusion.structure).toEqual([
    new MatchableTerminal("x"),
    new MatchableTerminal("y"),
    new MatchableTerminal("y"),
  ]);
  expect(rule3Parsed.conclusion.structure).toEqual([
    new MatchableTerminal("x"),
    new MatchableTerminal("z"),
    new MatchableTerminal("z"),
  ]);
});

it("does not modify the arguments", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("a")]],
  };
  const inferenceRule: InferenceRule = {
    ...getDefaultInferenceRule(),
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "A" }],
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "B" },
  };
  const statementClone = structuredClone(statement);
  const typeClone = structuredClone(type);
  const inferenceRuleClone = structuredClone(inferenceRule);
  parseInferenceRules([inferenceRule], [statement, type]);
  expect(statement).toEqual(statementClone);
  expect(type).toEqual(typeClone);
  expect(inferenceRule).toEqual(inferenceRuleClone);
});

it("parses statements with alternative definitions where a leading multiset and a leading nonterminal coincide", () => {
  const statement1: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new NonTerminal(1), new Terminal("!")],
      [new NonTerminal(2), new Terminal("*")],
    ],
  };
  const statement2: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new NonTerminal(2), new Terminal("*")],
      [new NonTerminal(1), new Terminal("!")],
    ],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A, \\Gamma!",
    },
  };
  const [ruleParsed1] = parseInferenceRules([rule], [statement1, context, type]).rules;
  const [ruleParsed2] = parseInferenceRules([rule], [statement2, context, type]).rules;
  expect(ruleParsed1.conclusion.structure.length).toBeGreaterThan(0);
  expect(ruleParsed2.conclusion.structure.length).toBeGreaterThan(0);
  expect(ruleParsed1.conclusion.structure).toEqual(ruleParsed2.conclusion.structure);
});

it("parses statements with alternative definitions where one alternative is a prefix of another beginning with a multiset", () => {
  const statement1: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("!")], [new NonTerminal(2)]],
  };
  const statement2: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(2)], [new NonTerminal(1), new Terminal("!")]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("x")]],
  };
  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A, \\Gamma!",
    },
  };
  const [ruleParsed1] = parseInferenceRules([rule], [statement1, context, type]).rules;
  const [ruleParsed2] = parseInferenceRules([rule], [statement2, context, type]).rules;
  expect(ruleParsed1.conclusion.structure.length).toBeGreaterThan(0);
  expect(ruleParsed2.conclusion.structure.length).toBeGreaterThan(0);
  expect(ruleParsed1.conclusion.structure).toEqual(ruleParsed2.conclusion.structure);
});
