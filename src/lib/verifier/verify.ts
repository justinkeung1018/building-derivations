import { AST } from "../types/ast";
import { InferenceRule, SyntaxRule } from "../types/rules";
import { match } from "./match";

interface Errors {
  conclusionErrors: string[];
  ruleErrors: string[];
  premisesErrors: string[][];
}

function pushErrorToList(errors: string[], error: unknown) {
  if (!(error instanceof Error)) {
    throw error;
  }
  errors.push(error.message);
}

export function verify(conclusion: string, premises: string[], rule: InferenceRule, syntax: SyntaxRule[]): Errors {
  const errors: Errors = {
    conclusionErrors: [],
    ruleErrors: [],
    premisesErrors: Array(premises.length)
      .fill([])
      .map(() => [] as string[]),
  };

  if (premises.length !== rule.premises.length) {
    errors.ruleErrors.push(`Rule needs ${rule.premises.length} premises, but ${premises.length} premises are given`);
    return errors;
  }

  const names: Record<string, AST> = {};

  try {
    match(conclusion, rule.conclusion.structure, syntax, names);
  } catch (error: unknown) {
    pushErrorToList(errors.conclusionErrors, error);
    return errors;
  }

  premises.forEach((premise, index) => {
    const premiseStructure = rule.premises[index].structure;
    try {
      match(premise, premiseStructure, syntax, names);
    } catch (error: unknown) {
      pushErrorToList(errors.premisesErrors[index], error);
    }
  });

  return errors;
}
