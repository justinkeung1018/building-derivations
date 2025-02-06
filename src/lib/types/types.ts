import { Token } from "./token";

interface SyntaxRule {
  definition: Token[][];
  placeholders: string[];
  definitionSanitised: string[];
  placeholdersUnsanitised: string;
  definitionUnsanitised: string;
}

interface InferenceRule {
  name: string;
  premises: SyntaxRule[];
  conclusion: SyntaxRule;
}

export type { SyntaxRule, InferenceRule };
