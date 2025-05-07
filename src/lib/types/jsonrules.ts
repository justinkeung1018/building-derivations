export interface JSONSyntaxRule {
  placeholders: string[];
  definition: string; // Equivalent to definitionUnsanitised in SyntaxRule
}

export interface JSONInferenceRule {
  name: string;
  premises: string[];
  conclusion: string;
}

export interface JSONFormat {
  syntax: JSONSyntaxRule[];
  inferenceRules: JSONInferenceRule[];
}
