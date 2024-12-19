import { Abstraction, Application, parse, Variable } from "@/lib/lexer";

test("Parses variables", () => {
  expect(parse("x")).toEqual(new Variable("x"));
});

test("Parses abstractions", () => {
  expect(parse("(\\x. x)")).toEqual(new Abstraction(new Variable("x"), new Variable("x")));
});

test("Parses applications", () => {
  const lambdaXX = new Abstraction(new Variable("x"), new Variable("x"));
  expect(parse("((\\x. x)(\\x. x))")).toEqual(new Application(lambdaXX, lambdaXX));
});
