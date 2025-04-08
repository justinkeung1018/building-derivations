import { clsx, type ClassValue } from "clsx";
import { Parjser } from "parjs";
import { or } from "parjs/combinators";
import { twMerge } from "tailwind-merge";
import { AST, TerminalAST, NonTerminalAST } from "./types/ast";

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
