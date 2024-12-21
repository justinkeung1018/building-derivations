import { lexer } from "@/lib/lexer";
import { Arrow, Type, TYPE, TypeVar } from "@/lib/parsers/type";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseType(type: string): Type {
  return expectSingleResult(expectEOF(TYPE.parse(lexer.parse(type))));
}

const one = new TypeVar(1);
const two = new TypeVar(2);
const ten = new TypeVar(10);

test("Parses type variables", () => {
  expect(parseType("1")).toEqual(one);
  expect(parseType("2")).toEqual(two);
  expect(parseType("10")).toEqual(ten);
});

test("Parses arrow types", () => {
  expect(parseType("(1 -> 1)")).toEqual(new Arrow(one, one));
  expect(parseType("(1 → 1)")).toEqual(new Arrow(one, one));
  expect(parseType("(1 -> 2)")).toEqual(new Arrow(one, two));
  expect(parseType("(10 -> 10)")).toEqual(new Arrow(ten, ten));
});

test("Parses nested arrow types", () => {
  expect(parseType("((1 -> 1) -> 10)")).toEqual(new Arrow(new Arrow(one, one), ten));
});
