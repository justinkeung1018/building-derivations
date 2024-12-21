import { lexer } from "@/lib/lexer";
import { Assignment, ASSIGNMENT, VarAssignment, VARASSIGNMENT } from "@/lib/parsers/assignment";
import { Abstraction, Variable } from "@/lib/parsers/lambda";
import { Arrow, TypeVar } from "@/lib/parsers/type";
import { expectEOF, expectSingleResult } from "typescript-parsec";

function parseVarAssignment(varAssignment: string): VarAssignment {
  return expectSingleResult(expectEOF(VARASSIGNMENT.parse(lexer.parse(varAssignment))));
}

function parseAssignment(assignment: string): Assignment {
  return expectSingleResult(expectEOF(ASSIGNMENT.parse(lexer.parse(assignment))));
}

const x = new Variable("x");
const one = new TypeVar(1);
const oneArrowOne = new Arrow(one, one);

test("Parses variable assignments", () => {
  expect(parseVarAssignment("x: 1")).toEqual(new VarAssignment(x, one));
  expect(parseVarAssignment("x: (1 -> 1)")).toEqual(new VarAssignment(x, oneArrowOne));
});

test("Parses assignments", () => {
  expect(parseAssignment("x: 1")).toEqual(new Assignment(x, one));
  expect(parseAssignment("x: (1 -> 1)")).toEqual(new Assignment(x, oneArrowOne));
  expect(parseAssignment("(\\x. x): (1 -> 1)")).toEqual(new Assignment(new Abstraction(x, x), oneArrowOne));
});
