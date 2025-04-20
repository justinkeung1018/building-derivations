import { clsx, type ClassValue } from "clsx";
import { Parjser } from "parjs";
import { or } from "parjs/combinators";
import { twMerge } from "tailwind-merge";
import { AST, TerminalAST, NonTerminalAST } from "./types/ast";
import { Matchable, MatchableNonTerminal, MatchableTerminal, MultisetElement, Name } from "./types/matchable";
import { SyntaxRule, InferenceRuleStatement, InferenceRule } from "./types/rules";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ors<T, TResult>(elements: T[], parserFunc: (element: T) => Parjser<TResult>): Parjser<TResult> {
  let parser = parserFunc(elements[0]);
  for (const element of elements.slice(1)) {
    parser = parser.pipe(or(parserFunc(element)));
  }
  return parser;
}

export function astToString(ast: AST): string {
  if (ast instanceof TerminalAST) {
    return ast.value;
  } else if (ast instanceof NonTerminalAST) {
    return ast.children.map(astToString).join(" ");
  }
  return ast.elements.map((element) => element.map(astToString).join(" ")).join(", ");
}

export function multisetElementToString(element: MultisetElement): string {
  return element.tokens.map(matchableToString).join(" ");
}

export function matchableToString(matchable: Matchable): string {
  if (matchable instanceof MatchableTerminal) {
    return matchable.value;
  } else if (matchable instanceof MatchableNonTerminal) {
    return matchable.children.map(matchableToString).join(" ");
  } else if (matchable instanceof Name) {
    return matchable.name;
  }
  return matchable.elements
    .map((x) => {
      if (x instanceof Name) {
        return matchableToString(x);
      }
      return multisetElementToString(x);
    })
    .join(", ");
}

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
