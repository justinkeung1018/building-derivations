import { AST } from "../types/ast";
import { InferenceRule, SyntaxRule } from "../types/rules";
import { match } from "./match";

export function verify(conclusion: string, premises: string[], rule: InferenceRule, syntax: SyntaxRule[]): boolean {
  if (premises.length !== rule.premises.length) {
    return false;
  }

  const names: Record<string, AST> = {};

  try {
    match(conclusion, rule.conclusion.structure, syntax, names);

    premises.forEach((premise, index) => {
      const premiseStructure = rule.premises[index].structure;
      match(premise, premiseStructure, syntax, names);
    });

    return true;
  } catch (_) {
    return false;
  }
}
