import { InferenceRule, InferenceRuleStatement, SyntaxRule } from "@/lib/types/rules";

export const defaultSyntaxRule: SyntaxRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};

export const defaultInferenceRuleStatement: InferenceRuleStatement = {
  structure: [],
  sanitised: "",
  unsanitised: "",
};

export const defaultInferenceRule: InferenceRule = {
  name: "dummy",
  premises: [],
  conclusion: {
    structure: [],
    sanitised: "",
    unsanitised: "",
  },
};
