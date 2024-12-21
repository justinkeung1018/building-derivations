import { Argument } from "@/lib/parsers/argument";
import { Assignment, VarAssignment } from "@/lib/parsers/assignment";
import { Context } from "@/lib/parsers/context";
import { Abstraction, Variable } from "@/lib/parsers/lambda";
import { Arrow, TypeVar } from "@/lib/parsers/type";
import { action, arrowIntroduction } from "@/lib/verifiers/lambda";

describe("Action rule", () => {
  const xOneXOne = new Argument(
    new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
    new Assignment(new Variable("x"), new TypeVar(1)),
  );

  test("x: 1 |- x: 1 is true", () => {
    expect(action(xOneXOne, [])).toBe(true);
  });

  test("x: 1 |- x : 2 is false", () => {
    expect(
      action(
        new Argument(
          new Context([new VarAssignment(new Variable("x"), new TypeVar(1))]),
          new Assignment(new Variable("x"), new TypeVar(2)),
        ),
        [],
      ),
    ).toBe(false);
  });

  test("x: 1 |- x : 1 with premises is false", () => {
    expect(action(xOneXOne, [xOneXOne])).toBe(false);
  });

  //
  test("x: 1 -> 2 |- x: 1 -> 2 is true", () => {
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
});

describe("Arrow introduction", () => {
  it("passes in basic case", () => {
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
  });

  it("passes even when premise is nonsense", () => {
    // Validity of conclusion is independent from validity of premise
    // \emptyset |- \x. x: 2 -> 1 given x: 2 |- x : 1 is true
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
  });

  it("fails when bound variable is in context", () => {
    // x: 1 |- \x. x: 1 -> 1 given x: 1 |- x : 1 is false
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
  });

  it("fails when bound variable type in premise does not match input of arrow type", () => {
    // \emptyset |- \x. x: 1 -> 1 given x: 2 |- x : 1 is false
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
  });

  it("fails when type is not arrow type", () => {
    // \emptyset |- \x. x: 1 given x: 1 |- x : 1 is false
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
  });

  it("fails when name of bound variable does not match", () => {
    // \emptyset |- \x. x: 1 -> 1 given y: 1 |- x : 1 is false
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
  });

  it("fails when abstraction body does not match", () => {
    // \emptyset |- \x. x: 1 -> 1 given x: 1 |- y : 1 is false
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
  });

  it("fails when term is not an abstraction", () => {
    // \emptyset |- x: 1 -> 1 given x: 1 |- x : 1 is false
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

  it("fails when there are too many premises", () => {
    // \emptyset |- x: 1 -> 1 given x: 1 |- x : 1 is false
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
});
