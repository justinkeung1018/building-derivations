import { parseInferenceRules } from "@/lib/parsers/inference";
import { parseSyntax } from "@/lib/parsers/syntax";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { getDefaultInferenceRule, getDefaultInferenceRuleStatement, getDefaultSyntaxRule } from "@/lib/utils";
import { verify } from "@/lib/verifier/verify";

it("fails when the value assigned to a name by a premise is incompatible with the conclusion", () => {
  const conclusion = "x, y |- y";
  const premises = ["x |- x", "z |- z"];

  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "\\Gamma |- A",
      },
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "\\Sigma |- B",
      },
    ],
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "\\Gamma, \\Sigma, A |- B",
    },
  };

  // Syntax
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "\\Gamma |- A",
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma, \\Sigma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A, B",
    definitionUnsanitised: "x | y | z",
  };

  const parsedSyntax = parseSyntax([statement, context, type]).rules;
  const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

  expect(verify(conclusion, premises, parsedRule, parsedSyntax).conclusionErrors).toContainSubstring("not found");
});

it("verifies the CL rule in the system LK", () => {
  const conclusion = "x, y |- y";
  const premises = ["x, y, y |- y"];

  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "\\Gamma, A, A |- \\Delta",
      },
    ],
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "\\Gamma, A |- \\Delta",
    },
  };

  // Syntax
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "\\Gamma |- \\Delta",
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma, \\Delta",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "x | y",
  };

  const parsedSyntax = parseSyntax([statement, context, type]).rules;
  const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

  expect(verify(conclusion, premises, parsedRule, parsedSyntax).ruleErrors).toHaveLength(0);
});

it("verifies a rule with three uncertain name assignments", () => {
  const conclusion = "x, x, y";
  const premises = ["x, x, y"];

  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "A, B, C",
      },
    ],
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A, B, C",
    },
  };

  // Syntax
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "\\Gamma",
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A, B, C",
    definitionUnsanitised: "x | y",
  };

  const parsedSyntax = parseSyntax([statement, context, type]).rules;
  const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

  expect(verify(conclusion, premises, parsedRule, parsedSyntax).ruleErrors).toHaveLength(0);
});

it("fails to verify a rule with three uncertain name assignments when no assignment combination is possible", () => {
  const conclusion = "x, y, y";
  const premises = ["x, x, y"];

  const rule: InferenceRule = {
    ...getDefaultInferenceRule(),
    premises: [
      {
        ...getDefaultInferenceRuleStatement(),
        unsanitised: "A, B, C",
      },
    ],
    conclusion: {
      ...getDefaultInferenceRuleStatement(),
      unsanitised: "A, B, C",
    },
  };

  // Syntax
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definitionUnsanitised: "\\Gamma",
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "\\Gamma",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholdersUnsanitised: "A, B, C",
    definitionUnsanitised: "x | y",
  };

  const parsedSyntax = parseSyntax([statement, context, type]).rules;
  const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

  expect(verify(conclusion, premises, parsedRule, parsedSyntax).ruleErrors).toContainSubstring("unify");
});
