import { InferenceRule, ParseResult, SyntaxRule } from "../types/rules";
import { buildSyntaxRuleParser, sanitiseDefinition } from "./syntax";

function sanitise(unsanitised: string) {
  return sanitiseDefinition(unsanitised)[0];
}

function parseInferenceRules(rules: InferenceRule[], syntax: SyntaxRule[]): ParseResult<InferenceRule> {
  // Assume the syntax is well-formed and already parsed
  const parser = buildSyntaxRuleParser(syntax);

  for (const rule of rules) {
    for (const premise of rule.premises) {
      premise.sanitised = sanitise(premise.unsanitised);
      premise.structure = parser.parse(premise.sanitised).value;
    }
    rule.conclusion.sanitised = sanitise(rule.conclusion.unsanitised);
    rule.conclusion.structure = parser.parse(rule.conclusion.sanitised).value;
  }

  return { rules, warnings: [] };
}

export { parseInferenceRules };
