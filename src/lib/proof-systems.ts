import { parseInferenceRules } from "./parsers/inference";
import { parseSyntax } from "./parsers/syntax";
import { SyntaxRule, InferenceRule } from "./types/rules";
import { defaultSyntaxRule, getDefaultInferenceRule, getDefaultInferenceRuleStatement } from "./utils";

export const NATURAL_DEDUCTION_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- A" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "var | (A -> B)" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
];

export const NATURAL_DEDUCTION_INFERENCE_RULES: InferenceRule[] = [
  {
    ...getDefaultInferenceRule(),
    name: "Ax",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- A" },
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to I",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A -> B)" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- B" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to E",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- B" },
    premises: [
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A -> B)" },
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A" },
    ],
  },
];

export const LAMBDA_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- M: A" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ var: A }" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "\\varphi | (A -> B)" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\varphi", definitionUnsanitised: "1 | 2 | 3" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "M, N", definitionUnsanitised: "var | (\\lambda var. M) | (MN)" },
];

export const LAMBDA_INFERENCE_RULES: InferenceRule[] = [
  {
    ...getDefaultInferenceRule(),
    name: "Ax",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, var: A |- var: A" },
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to I",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (\\lambda var. M): (A -> B)" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, var: A |- M: B" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to E",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (MN): B" },
    premises: [
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- M: (A -> B)" },
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- N: A" },
    ],
  },
];

export const SEQUENT_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- \\Delta" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma, \\Delta, \\Sigma, \\Pi", definitionUnsanitised: "{ A }" },
  {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A, B",
    definitionUnsanitised: "var | (A \\to B) | (A \\land B) | (A \\lor B) | (\\lnot A)",
  },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
];

export const SEQUENT_INFERENCE_RULES: InferenceRule[] = [
  {
    ...getDefaultInferenceRule(),
    name: "Ax",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta, A" },
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\land L_1",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\land L_2",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, B |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\lor L",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, (A \\lor B) |- \\Delta" },
    premises: [
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta" },
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, B |- \\Delta" },
    ],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to L",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, \\Sigma, (A \\to B) |- \\Delta, \\Pi" },
    premises: [
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" },
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Sigma, B |- \\Pi" },
    ],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\lnot L",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, (\\lnot A) |- \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\lor R_1",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\lor R_2",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- B, \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\land R",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A \\land B), \\Delta" },
    premises: [
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" },
      { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- B, \\Delta" },
    ],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\to R",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (A \\to B), \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- B, \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "\\lnot R",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- (\\lnot A), \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "WL",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "CL",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A |- \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma, A, A |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "WR",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- \\Delta" }],
  },
  {
    ...getDefaultInferenceRule(),
    name: "CR",
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, \\Delta" },
    premises: [{ ...getDefaultInferenceRuleStatement(), unsanitised: "\\Gamma |- A, A, \\Delta" }],
  },
];

export function getParsedSystem(system: string) {
  let syntaxUnsanitised: SyntaxRule[] | undefined = undefined;
  let inferenceRulesUnsanitised: InferenceRule[] | undefined = undefined;

  if (system === "natural-deduction") {
    syntaxUnsanitised = NATURAL_DEDUCTION_SYNTAX;
    inferenceRulesUnsanitised = NATURAL_DEDUCTION_INFERENCE_RULES;
  } else if (system === "lambda") {
    syntaxUnsanitised = LAMBDA_SYNTAX;
    inferenceRulesUnsanitised = LAMBDA_INFERENCE_RULES;
  } else if (system === "sequent") {
    syntaxUnsanitised = SEQUENT_SYNTAX;
    inferenceRulesUnsanitised = SEQUENT_INFERENCE_RULES;
  } else if (system === "") {
    syntaxUnsanitised = [{ ...defaultSyntaxRule }];
    inferenceRulesUnsanitised = [];
  }

  if (syntaxUnsanitised === undefined || inferenceRulesUnsanitised === undefined) {
    throw new Error(`Invalid proof system: ${system}`);
  }

  const syntax = parseSyntax(syntaxUnsanitised).rules;
  const inferenceRules = parseInferenceRules(inferenceRulesUnsanitised, syntax).rules;

  return { syntax, inferenceRules };
}
