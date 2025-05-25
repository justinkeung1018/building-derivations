import { normalise } from "../latexify";
import { AST } from "../types/ast";
import { Matchable, MatchableMultiset, MatchableNonTerminal, Name } from "../types/matchable";
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

function addNames(token: Matchable, namesToMatch: Set<string>) {
  if (token instanceof Name) {
    namesToMatch.add(token.name);
  } else if (token instanceof MatchableNonTerminal) {
    for (const child of token.children) {
      addNames(child, namesToMatch);
    }
  } else if (token instanceof MatchableMultiset) {
    for (const element of token.elements) {
      if (element instanceof Name) {
        addNames(element, namesToMatch);
      } else {
        for (const subToken of element.tokens) {
          addNames(subToken, namesToMatch);
        }
      }
    }
  }
}

function explore(
  conclusion: string,
  premises: string[],
  rule: InferenceRule,
  syntax: SyntaxRule[],
  names: Record<string, AST>,
  unmatchedPossibilities: Record<string, AST[]>,
): boolean {
  if (Object.keys(unmatchedPossibilities).length === 0) {
    return true;
  }

  const namesClone: Record<string, AST> = {};
  for (const [name, ast] of Object.entries(names)) {
    // matchRule should not alter existing entries in its names argument,
    // so a shallow clone suffices
    namesClone[name] = ast;
  }

  const nameToExplore = Object.keys(unmatchedPossibilities).sort()[0];
  let possibilitiesToExplore: AST[] | undefined = undefined;

  const unmatchedPossibilitiesClone: Record<string, AST[]> = {};
  for (const [name, possibilities] of Object.entries(unmatchedPossibilities)) {
    if (name === nameToExplore) {
      possibilitiesToExplore = possibilities;
      continue;
    }
    unmatchedPossibilitiesClone[name] = [];
    for (const ast of possibilities) {
      unmatchedPossibilitiesClone[name].push(ast);
    }
  }

  if (possibilitiesToExplore === undefined) {
    return false;
  }

  const possibility = possibilitiesToExplore.pop();
  if (possibility === undefined) {
    return false;
  }

  namesClone[nameToExplore] = possibility;

  const errors: Errors = {
    conclusionErrors: [],
    ruleErrors: [],
    premisesErrors: Array(premises.length)
      .fill([])
      .map(() => [] as string[]),
  };
  matchRule(conclusion, premises, rule, syntax, namesClone, unmatchedPossibilitiesClone, errors);
  unmatchedPossibilitiesClone[nameToExplore] = possibilitiesToExplore;
  delete namesClone[nameToExplore];

  if (
    errors.ruleErrors.length === 0 &&
    errors.conclusionErrors.length === 0 &&
    errors.premisesErrors.every((x) => x.length === 0)
  ) {
    return true;
  }

  return explore(conclusion, premises, rule, syntax, namesClone, unmatchedPossibilitiesClone);
}

function matchRule(
  conclusion: string,
  premises: string[],
  rule: InferenceRule,
  syntax: SyntaxRule[],
  names: Record<string, AST>,
  unmatchedPossibilities: Record<string, AST[]>,
  errors: Errors,
) {
  let numNames;
  do {
    numNames = Object.keys(names).length;
    try {
      match(conclusion, rule.conclusion.structure, syntax, names, unmatchedPossibilities);
    } catch (error: unknown) {
      pushErrorToList(errors.conclusionErrors, error);
      return errors;
    }

    premises.forEach((premise, index) => {
      const premiseStructure = rule.premises[index].structure;
      try {
        match(premise, premiseStructure, syntax, names, unmatchedPossibilities);
      } catch (error: unknown) {
        pushErrorToList(errors.premisesErrors[index], error);
      }
    });
  } while (numNames !== Object.keys(names).length);
}

export function verify(conclusion: string, premises: string[], rule: InferenceRule, syntax: SyntaxRule[]): Errors {
  conclusion = normalise(conclusion);
  premises = premises.map(normalise);

  const errors: Errors = {
    conclusionErrors: [],
    ruleErrors: [],
    premisesErrors: Array(premises.length)
      .fill([])
      .map(() => [] as string[]),
  };

  if (premises.length !== rule.premises.length) {
    errors.ruleErrors.push(
      `Rule needs ${rule.premises.length} premise${rule.premises.length === 1 ? "" : "s"}, but ${premises.length} premise${premises.length === 1 ? " is" : "s are"} given`,
    );
    return errors;
  }

  const names: Record<string, AST> = {};
  const unmatchedPossibilities: Record<string, AST[]> = {};

  matchRule(conclusion, premises, rule, syntax, names, unmatchedPossibilities, errors);

  if (Object.keys(unmatchedPossibilities).length > 0) {
    if (!explore(conclusion, premises, rule, syntax, names, unmatchedPossibilities)) {
      errors.ruleErrors.push("Unable to unify names");
    }
    return errors;
  }

  const namesToMatch = new Set<string>();
  for (const token of rule.conclusion.structure) {
    addNames(token, namesToMatch);
  }
  for (const premise of rule.premises) {
    for (const token of premise.structure) {
      addNames(token, namesToMatch);
    }
  }

  if (Object.keys(names).length !== namesToMatch.size) {
    const unmatchedNames: string[] = [];
    for (const name of namesToMatch) {
      if (!Object.hasOwn(names, name)) {
        unmatchedNames.push(name);
      }
    }

    if (unmatchedNames.length > 0) {
      errors.ruleErrors.push(`Unmatched names in the rule: ${unmatchedNames.join(", ")}`);
    }

    const overmatchedNames: string[] = [];
    for (const name of Object.keys(names)) {
      if (!namesToMatch.has(name)) {
        overmatchedNames.push(name);
      }
    }

    if (overmatchedNames.length > 0) {
      // If you get here, congratulations, I don't know how you managed it
      errors.ruleErrors.push(`Matched names that do not exist in the rule: ${overmatchedNames.join(", ")}`);
    }
  }

  // Remove duplicate error messages from do-while loop above
  errors.conclusionErrors = [...new Set(errors.conclusionErrors)];
  errors.premisesErrors = errors.premisesErrors.map((x) => [...new Set(x)]);
  errors.ruleErrors = [...new Set(errors.ruleErrors)];

  return errors;
}
