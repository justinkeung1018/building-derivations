import { letter, LowerASCII, UpperASCII, UpperGreek } from "@/lib/parsers/parjs/letter";

it("parses uppercase Greek letters", () => {
  expect(letter.parse("\\Gamma").value).toEqual(new UpperGreek("Gamma"));
});

it("parses lowercase Roman letters", () => {
  expect(letter.parse("a").value).toEqual(new LowerASCII("a"));
});

it("parses uppercase Roman letters", () => {
  expect(letter.parse("A").value).toEqual(new UpperASCII("A"));
});

it("fails when the string has multiple letters", () => {
  expect(letter.parse("aFDSOJK").isOk).toBe(false);
});
