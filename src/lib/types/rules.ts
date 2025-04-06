import { Matchable } from "./matchable";
import { Or } from "./token";

export interface SyntaxRule {
  definition: Or;
  placeholders: string[];
  definitionSanitised: string[];
  placeholdersUnsanitised: string;
  definitionUnsanitised: string;
}

// Statements as part of an inference rule should not have multiple alternatives
export interface InferenceRuleStatement {
  structure: Matchable[];
  sanitised: string;
  unsanitised: string;
}

export interface InferenceRule {
  name: string;
  premises: InferenceRuleStatement[];
  conclusion: InferenceRuleStatement;
}

export interface Warning {
  index: number;
  message: string;
}

export interface ParseResult<RuleType> {
  rules: RuleType[];
  warnings: Warning[];
}
