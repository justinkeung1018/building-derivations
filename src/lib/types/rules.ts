import { Matchable } from "./matchable";
import { ErrorMap, MessageMap } from "./messagemap";
import { Token } from "./token";

export interface SyntaxRule {
  definition: Token[][];
  placeholders: string[];
  definitionSanitised: string[];
  placeholdersUnsanitised: string;
  definitionUnsanitised: string;
  id: string; // For identifying React DOM elements
}

// Statements as part of an inference rule should not have multiple alternatives
export interface InferenceRuleStatement {
  structure: Matchable[];
  sanitised: string;
  unsanitised: string;
  id: string; // For identifying React DOM elements
}

export interface InferenceRule {
  name: string;
  premises: InferenceRuleStatement[];
  conclusion: InferenceRuleStatement;
  id: string; // For identifying React DOM elements
}

export interface ParseResult<RuleType> {
  rules: RuleType[];
  warnings: MessageMap;
  errors: ErrorMap;
}
