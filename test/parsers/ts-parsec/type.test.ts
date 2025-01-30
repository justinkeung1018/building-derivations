import { lexer } from "@/lib/ts-parsec/lexer";
import { Arrow, Type, TYPE, TypeVar } from "@/lib/parsers/ts-parsec/type";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseType(type: string): Type {
  return expectSingleResult(expectEOF(TYPE.parse(lexer.parse(type))));
}

const one = new TypeVar(1);
const two = new TypeVar(2);
const ten = new TypeVar(10);

it("parses type variables", () => {
  expect(parseType("1")).toEqual(one);
  expect(parseType("2")).toEqual(two);
  expect(parseType("10")).toEqual(ten);
});

it("parses arrow types", () => {
  expect(parseType("(1 -> 1)")).toEqual(new Arrow(one, one));
  expect(parseType("(1 → 1)")).toEqual(new Arrow(one, one));
  expect(parseType("(1 -> 2)")).toEqual(new Arrow(one, two));
  expect(parseType("(10 -> 10)")).toEqual(new Arrow(ten, ten));
});

// it("parses unbracketed arrow types in right associative manner", () => {
//   expect(parseType("1 -> 1")).toEqual(new Arrow(one, one));
//   expect(parseType("1 -> 1 -> 2")).toEqual(new Arrow(one, new Arrow(one, two)));
// });

it("parses nested arrow types", () => {
  expect(parseType("((1 -> 1) -> 10)")).toEqual(new Arrow(new Arrow(one, one), ten));
});

// it("parses unbracketed nested arrow types", () => {
//   expect(parseType("(1 -> 1) -> 2")).toEqual(new Arrow(new Arrow(one, one), two));
// });
