import { Argument } from "@/lib/parsers/argument";
import { Assignment, VarAssignment } from "@/lib/parsers/assignment";
import { Context } from "@/lib/parsers/context";
import { Variable } from "@/lib/parsers/lambda";
import { Arrow, TypeVar } from "@/lib/parsers/type";
import { action } from "@/lib/verifiers/lambda";

test("Verifies action rule", () => {
  // x: 1 |- x: 1 is true
  expect(
    action(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
        new Assignment(new Variable("x"), new TypeVar(1)),
      ),
    ),
  ).toBe(true);

  // x: 1 |- x : 2 is false
  expect(
    action(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
        new Assignment(new Variable("x"), new TypeVar(2)),
      ),
    ),
  ).toBe(false);

  // x: 1 -> 2 |- x: 1 -> 2 is true
  expect(
    action(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(2)))]),
        new Assignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(2))),
      ),
    ),
  ).toBe(true);
});
