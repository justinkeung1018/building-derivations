import { LowerASCII, UpperASCII, UpperGreek } from "@/lib/parsers/parjs/letter";
import { Sequent, sequent } from "@/lib/parsers/parjs/sequent";

it("parses a basic sequent", () => {
  expect(sequent.parse("\\Gamma, x:A |- x:A").value).toEqual(
    new Sequent(
      [new UpperGreek("Gamma"), ",", new LowerASCII("x"), ":", new UpperASCII("A")],
      [new LowerASCII("x"), ":", new UpperASCII("A")],
    ),
  );
});

// TODO: should this fail?
// it("fails when a LaTeX command is followed by another character without whitespace", () => {
//   expect(sequent.parse("\\Gammaa |- x:A").isOk).toBe(false);
// })
