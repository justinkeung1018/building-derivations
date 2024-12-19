import { Abstraction, Application, parse, Variable } from "@/lib/lexer";

const x = new Variable("x");
const y = new Variable("y");
const lambdaXX = new Abstraction(x, x);
const lambdaXY = new Abstraction(x, y);

test("Parses variables", () => {
  expect(parse("x")).toEqual(x);
});

test("Parses abstractions", () => {
  expect(parse("(\\x. x)")).toEqual(lambdaXX);
  expect(parse("(\\x. y)")).toEqual(lambdaXY);
});

test("Parses applications", () => {
  const x = new Variable("x");
  const lambdaXX = new Abstraction(x, x);
  expect(parse("((\\x. x)(\\x. x))")).toEqual(new Application(lambdaXX, lambdaXX));
  expect(parse("(xx)")).toEqual(new Application(x, x));
  expect(parse("(xy)")).toEqual(new Application(x, y));
  expect(parse("(x(\\x.x))")).toEqual(new Application(x, lambdaXX));
  expect(parse("((\\x.    x)x)")).toEqual(new Application(lambdaXX, x));
});
