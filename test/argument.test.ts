import { lexer } from "@/lib/lexer";
import { Argument, ARGUMENT } from "@/lib/parsers/argument";
import { Assignment, VarAssignment } from "@/lib/parsers/assignment";
import { Empty, VarAssignments } from "@/lib/parsers/context";
import { Variable } from "@/lib/parsers/lambda";
import { TypeVar } from "@/lib/parsers/type";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseArgument(argument: string): Argument {
  return expectSingleResult(expectEOF(ARGUMENT.parse(lexer.parse(argument))));
}

const xOneVar = new VarAssignment(new Variable("x"), new TypeVar(1));
const xOne = new Assignment(new Variable("x"), new TypeVar(1));

test("Parses argument with empty context", () => {
  expect(parseArgument("\\emptyset |- x: 1")).toEqual(
    new Argument(new Empty(), new Assignment(new Variable("x"), new TypeVar(1))),
  );
});

test("Parses argument with non-empty context", () => {
  expect(parseArgument("x: 1 |- x: 1")).toEqual(new Argument(new VarAssignments([xOneVar]), xOne));
});
