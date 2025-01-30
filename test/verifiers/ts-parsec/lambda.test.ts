import { Argument } from "@/lib/ts-parsec/parsers/argument";
import { Assignment, VarAssignment } from "@/lib/ts-parsec/parsers/assignment";
import { Context } from "@/lib/ts-parsec/parsers/context";
import { Abstraction, Application, Variable } from "@/lib/ts-parsec/parsers/lambda";
import { Arrow, TypeVar } from "@/lib/ts-parsec/parsers/type";
import { action, arrowElimination, arrowIntroduction } from "@/lib/ts-parsec/verifiers/lambda";

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

  it("fails when there are too few premises", () => {
    // \emptyset |- x: 1 -> 1 given no premises is false
    expect(
      arrowIntroduction(
        new Argument(new Context(), new Assignment(new Variable("x"), new Arrow(new TypeVar(1), new TypeVar(1)))),
        [],
      ),
    ).toBe(false);
  });
});

describe("Arrow elimination", () => {
  const x = new Variable("x");
  const y = new Variable("y");
  const one = new TypeVar(1);
  const two = new TypeVar(2);

  it("passes in basic case", () => {
    // Context = (x: 1 -> 2, y: 1)
    const context = new Context([new VarAssignment(x, new Arrow(one, two)), new VarAssignment(y, one)]);

    // Context |- xy: 1 given Context |- x: 1 -> 2 and Context |- y: 1 is true
    expect(
      arrowElimination(new Argument(context, new Assignment(new Application(x, y), two)), [
        new Argument(context, new Assignment(x, new Arrow(one, two))),
        new Argument(context, new Assignment(y, one)),
      ]),
    ).toBe(true);
  });

  it("fails when there are too many premises", () => {
    // Context = (x: 1 -> 2, y: 1)
    const context = new Context([new VarAssignment(x, new Arrow(one, two)), new VarAssignment(y, one)]);

    // Context |- xy: 1 given too many premises is true
    expect(
      arrowElimination(new Argument(context, new Assignment(new Application(x, y), two)), [
        new Argument(context, new Assignment(x, new Arrow(one, two))),
        new Argument(context, new Assignment(y, one)),
        new Argument(context, new Assignment(y, one)),
      ]),
    ).toBe(false);
  });

  it("fails when there are too few premises", () => {
    // Context = (x: 1 -> 2, y: 1)
    const context = new Context([new VarAssignment(x, new Arrow(one, two)), new VarAssignment(y, one)]);

    // Context |- xy: 1 given too few premises is true
    expect(
      arrowElimination(new Argument(context, new Assignment(new Application(x, y), two)), [
        new Argument(context, new Assignment(x, new Arrow(one, two))),
      ]),
    ).toBe(false);
  });
});
