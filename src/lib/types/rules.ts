import { Token } from "./token";

interface SyntaxRule {
  definition: Token[][];
  placeholders: string[];
  definitionSanitised: string[];
  placeholdersUnsanitised: string;
  definitionUnsanitised: string;
}

// Statements as part of an inference rule should not have multiple alternatives
interface InferenceRuleStatement {
  structure: Token[];
  sanitised: string;
  unsanitised: string;
}

interface InferenceRule {
  name: string;
  premises: InferenceRuleStatement[];
  conclusion: InferenceRuleStatement;
}

export type { SyntaxRule, InferenceRule, InferenceRuleStatement };
