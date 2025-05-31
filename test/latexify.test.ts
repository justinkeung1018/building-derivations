import { latexify, normalise } from "@/lib/latexify";

it("does not escape curly braces in \\to{} (from latexifying ->)", () => {
  expect(latexify(normalise("x -> y"))).toEqual("x \\to{} y");
});

it("escapes curly braces that are not part of a LaTeX command", () => {
  expect(latexify(normalise("{ A }"))).toEqual("\\{ A \\}");
});

it("does not escape curly braces that represent empty arguments of a LaTeX command", () => {
  expect(latexify(normalise("x \\to{} y"))).toEqual("x \\to{} y");
});

it("does not escape curly braces that surround arguments of a LaTeX command", () => {
  expect(latexify(normalise("\\tilde{\\mu} { A }"))).toEqual("\\tilde{\\mu} \\{ A \\}");
});
