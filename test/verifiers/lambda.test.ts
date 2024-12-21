import { Argument } from "@/lib/parsers/argument";
import { Assignment, VarAssignment } from "@/lib/parsers/assignment";
import { Context } from "@/lib/parsers/context";
import { Abstraction, Variable } from "@/lib/parsers/lambda";
import { Arrow, TypeVar } from "@/lib/parsers/type";
import { action, arrowIntroduction } from "@/lib/verifiers/lambda";

test("Verifies action rule", () => {
  // x: 1 |- x: 1 is true
  const xOneXOne = new Argument(
    new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
    new Assignment(new Variable("x"), new TypeVar(1)),
  );

  expect(action(xOneXOne, [])).toBe(true);

  // x: 1 |- x : 2 is false
  expect(
    action(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
        new Assignment(new Variable("x"), new TypeVar(2)),
      ),
      [],
    ),
  ).toBe(false);

  // x: 1 |- x : 1 with premises is false
  expect(action(xOneXOne, [xOneXOne])).toBe(false);

  // x: 1 -> 2 |- x: 1 -> 2 is true
  expect(
    action(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(2)))]),
        new Assignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(2))),
      ),
      [],
    ),
  ).toBe(true);
});

test("Verifies arrow introduction", () => {
  // \emptyset |- \x. x: 1 -> 1 given x: 1 |- x : 1 is true
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(1), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(true);

  // \emptyset |- \x. x: 2 -> 1 given x: 2 |- x : 1 is true (validity of conclusion independent from validity of premise)
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(2), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(2))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(true);

  // x: 1 |- \x. x: 1 -> 1 given x: 1 |- x : 1 is false (bound variable in context)
  expect(
    arrowIntroduction(
      new Argument(
        new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(1), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);

  // \emptyset |- \x. x: 1 -> 1 given x: 2 |- x : 1 is false (bound variable type mismatch)
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(1), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(2))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);

  // \emptyset |- \x. x: 1 given x: 1 |- x : 1 is false (not arrow type)
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(new Abstraction(new Variable("x"), new Variable("x")), new TypeVar(1)),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(2))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);

  // \emptyset |- \x. x: 1 -> 1 given y: 1 |- x : 1 is false (bound variable mismatch)
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(1), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("y"), new TypeVar(1))]),
          new Assignment(new Variable("x"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);

  // \emptyset |- \x. x: 1 -> 1 given x: 1 |- y : 1 is false (body mismatch)
  expect(
    arrowIntroduction(
      new Argument(
        new Context(),
        new Assignment(
          new Abstraction(new Variable("x"), new Variable("x")),
          new Arrow(new TypeVar(1), new TypeVar(1)),
        ),
      ),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("y"), new TypeVar(1))]),
          new Assignment(new Variable("y"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);

  // \emptyset |- x: 1 -> 1 given x: 1 |- x : 1 is false (not an abstraction)
  expect(
    arrowIntroduction(
      new Argument(new Context(), new Assignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(1)))),
      [
        new Argument(
          new Context([new VarAssignment(new Variable("y"), new TypeVar(1))]),
          new Assignment(new Variable("y"), new TypeVar(1)),
        ),
      ],
    ),
  ).toBe(false);
});
