import { parseInferenceRules } from "@/lib/parsers/inference";
import { parseSyntax } from "@/lib/parsers/syntax";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "@/lib/utils";
import { verify } from "@/lib/verifier/verify";

// it("fails when the value assigned to a name by a premise is incompatible with the conclusion", () => {
//   const conclusion = "x, y |- y";
//   const premises = ["x |- x", "z |- z"];

//   const rule: InferenceRule = {
//     ...defaultInferenceRule,
//     premises: [
//       {
//         ...defaultInferenceRuleStatement,
//         unsanitised: "\\Gamma |- A",
//       },
//       {
//         ...defaultInferenceRuleStatement,
//         unsanitised: "\\Sigma |- B",
//       },
//     ],
//     conclusion: {
//       ...defaultInferenceRuleStatement,
//       unsanitised: "\\Gamma, \\Sigma, A |- B",
//     },
//   };

//   // Syntax
//   const statement: SyntaxRule = {
//     ...defaultSyntaxRule,
//     definitionUnsanitised: "\\Gamma |- A",
//   };
//   const context: SyntaxRule = {
//     ...defaultSyntaxRule,
//     placeholdersUnsanitised: "\\Gamma, \\Sigma",
//     definitionUnsanitised: "{ A }",
//   };
//   const type: SyntaxRule = {
//     ...defaultSyntaxRule,
//     placeholdersUnsanitised: "A, B",
//     definitionUnsanitised: "x | y | z",
//   };

//   const parsedSyntax = parseSyntax([statement, context, type]).rules;
//   const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

//   expect(verify(conclusion, premises, parsedRule, parsedSyntax).conclusionErrors).toContainSubstring("not found");
// });

it("verifies the CL rule in the system LK", () => {
  const conclusion = "x, y |- y";
  const premises = ["x, y, y |- y"];

  const rule: InferenceRule = {
    ...defaultInferenceRule,
    premises: [
      {
        ...defaultInferenceRuleStatement,
        unsanitised: "\\Gamma, A, A |- \\Delta",
      },
    ],
    conclusion: {
      ...defaultInferenceRuleStatement,
      unsanitised: "\\Gamma, A |- \\Delta",
    },
  };

  // Syntax
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definitionUnsanitised: "\\Gamma |- \\Delta",
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "\\Gamma, \\Delta",
    definitionUnsanitised: "{ A }",
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A",
    definitionUnsanitised: "x | y | z",
  };

  const parsedSyntax = parseSyntax([statement, context, type]).rules;
  const parsedRule = parseInferenceRules([rule], parsedSyntax).rules[0];

  expect(verify(conclusion, premises, parsedRule, parsedSyntax).ruleErrors).toHaveLength(0);
});
