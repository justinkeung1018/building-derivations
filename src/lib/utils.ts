import { clsx, type ClassValue } from "clsx";
import { Parjser } from "parjs";
import { or } from "parjs/combinators";
import { twMerge } from "tailwind-merge";

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
