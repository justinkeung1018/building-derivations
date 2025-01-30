import { lexer } from "@/lib/ts-parsec/lexer";
import { Variable, Abstraction, Application, Term, TERM } from "@/lib/parsers/ts-parsec/lambda";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseLambda(term: string): Term {
  return expectSingleResult(expectEOF(TERM.parse(lexer.parse(term))));
}

const x = new Variable("x");
const y = new Variable("y");
const lambdaXX = new Abstraction(x, x);
const lambdaXY = new Abstraction(x, y);

test("Parses variables", () => {
  expect(parseLambda("x")).toEqual(x);
});

test("Parses abstractions", () => {
  expect(parseLambda("(\\x. x)")).toEqual(lambdaXX);
  expect(parseLambda("(\\x. y)")).toEqual(lambdaXY);
});

test("Parses applications", () => {
  const x = new Variable("x");
  const lambdaXX = new Abstraction(x, x);
  expect(parseLambda("((\\x. x)(\\x. x))")).toEqual(new Application(lambdaXX, lambdaXX));
  expect(parseLambda("(xx)")).toEqual(new Application(x, x));
  expect(parseLambda("(xy)")).toEqual(new Application(x, y));
  expect(parseLambda("(x(\\x.x))")).toEqual(new Application(x, lambdaXX));
  expect(parseLambda("((\\x.    x)x)")).toEqual(new Application(lambdaXX, x));
});
