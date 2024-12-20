import { lexer } from "@/lib/lexer";
import { VarAssignment } from "@/lib/parsers/assignment";
import { CONTEXT, Context, Empty, VarAssignments } from "@/lib/parsers/context";
import { Variable } from "@/lib/parsers/lambda";
import { TypeVar } from "@/lib/parsers/type";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseContext(context: string): Context {
  return expectSingleResult(expectEOF(CONTEXT.parse(lexer.parse(context))));
}

test("Parses empty context", () => {
  expect(parseContext("\\emptyset")).toEqual(new Empty());
});

const xOne = new VarAssignment(new Variable("x"), new TypeVar(1));
const yTwo = new VarAssignment(new Variable("y"), new TypeVar(2));

test("Parses non-empty contexts", () => {
  expect(parseContext("x: 1")).toEqual(new VarAssignments([xOne]));
  expect(parseContext("x: 1, y: 2")).toEqual(new VarAssignments([xOne, yTwo]));
});

// TODO: fail when context contains multiple types of same variable
