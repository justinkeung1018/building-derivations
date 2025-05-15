import { SyntaxRule, InferenceRule } from "./types/rules";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "./utils";

export const NATURAL_DEDUCTION_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- A" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "var | (A -> B)" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
];

export const NATURAL_DEDUCTION_INFERENCE_RULES: InferenceRule[] = [
  {
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\to I",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- B" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\to E",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A" },
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
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- var: A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\to I",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (\\lambda var. M): (A -> B)" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- M: B" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\to E",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (MN): B" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- M: (A -> B)" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- N: A" },
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
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta, A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\land L_1",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\land L_2",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, B |- \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\lor B) |- \\Delta" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, B |- \\Delta" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\to L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, \\Sigma, (A \\to B) |- \\Delta, \\Pi" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Sigma, B |- \\Pi" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\lnot L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (\\lnot A) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor R_1",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor R_2",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\land R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\land B), \\Delta" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B, \\Delta" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\to R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\to B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- B, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lnot R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (\\lnot A), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" }],
  },
];
