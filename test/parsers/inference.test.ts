import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "./utils";
import { Terminal } from "@/lib/types/token";
import { parseInferenceRules } from "@/lib/parsers/inference";

describe("Parses inference rules", () => {
  it("does not modify the arguments", () => {
    const syntaxRule: SyntaxRule = {
      ...defaultSyntaxRule,
      placeholders: ["A", "B"],
      definition: [[new Terminal("a")]],
    };
    const inferenceRule: InferenceRule = {
      ...defaultInferenceRule,
      premises: [{ ...defaultInferenceRuleStatement, unsanitised: "A" }],
      conclusion: { ...defaultInferenceRuleStatement, unsanitised: "B" },
    };
    const syntaxRuleClone = structuredClone(syntaxRule);
    const inferenceRuleClone = structuredClone(inferenceRule);
    parseInferenceRules([inferenceRule], [syntaxRule]);
    expect(syntaxRule).toEqual(syntaxRuleClone);
    expect(inferenceRule).toEqual(inferenceRuleClone);
  });
});
