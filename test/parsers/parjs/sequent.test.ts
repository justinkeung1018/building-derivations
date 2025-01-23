import { LowerASCII, UpperASCII, UpperGreek } from "@/lib/parsers/parjs/letter";
import { Sequent, sequent } from "@/lib/parsers/parjs/sequent";

describe("lambda calculus", () => {
  it("parses the action rule", () => {
    expect(sequent.parse("\\Gamma, x:A |- x:A").value).toEqual(
      new Sequent(
        [new UpperGreek("Gamma"), ",", new LowerASCII("x"), ":", new UpperASCII("A")],
        [new LowerASCII("x"), ":", new UpperASCII("A")],
      ),
    );
  });

  it("parses the arrow introduction rule", () => {
    expect(sequent.parse("\\Gamma, x:A |- M:B").value).toEqual(
      new Sequent(
        [new UpperGreek("Gamma"), ",", new LowerASCII("x"), ":", new UpperASCII("A")],
        [new UpperASCII("M"), ":", new UpperASCII("B")],
      ),
    );
    expect(sequent.parse("\\Gamma |- \\x.M: A -> B").value).toEqual(
      new Sequent(
        [new UpperGreek("Gamma")],
        ["\\", new LowerASCII("x"), ".", new UpperASCII("M"), ":", new UpperASCII("A"), "->", new UpperASCII("B")],
      ),
    );
  });

  it("parses the arrow elimination rule", () => {
    expect(sequent.parse("\\Gamma |- M: A -> B").value).toEqual(
      new Sequent(
        [new UpperGreek("Gamma")],
        [new UpperASCII("M"), ":", new UpperASCII("A"), "->", new UpperASCII("B")],
      ),
    );
    expect(sequent.parse("\\Gamma |- N: A").value).toEqual(
      new Sequent([new UpperGreek("Gamma")], [new UpperASCII("N"), ":", new UpperASCII("A")]),
    );
    expect(sequent.parse("\\Gamma |- MN: B").value).toEqual(
      new Sequent([new UpperGreek("Gamma")], [new UpperASCII("M"), new UpperASCII("N"), ":", new UpperASCII("B")]),
    );
  });
});

// TODO: should this fail?
// it("fails when a LaTeX command is followed by another character without whitespace", () => {
//   expect(sequent.parse("\\Gammaa |- x:A").isOk).toBe(false);
// })
