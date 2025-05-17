import { normalise } from "@/lib/latexify";

it("converts \\vdash to |-", () => {
  expect(normalise("x \\vdash y")).toEqual("x |- y");
});

it("does not change |-", () => {
  expect(normalise("x |- y")).toEqual("x |- y");
});

it("adds space around |- if there isn't already", () => {
  expect(normalise("x|-y")).toEqual("x |- y");
});

it("adds space around aliases of |- if there isn't already", () => {
  expect(normalise("x\\vdash y")).toEqual("x |- y");
});

it("converts \\to to ->", () => {
  expect(normalise("1 \\to 2")).toEqual("1 -> 2");
});

it("converts → to ->", () => {
  expect(normalise("1 → 2")).toEqual("1 -> 2");
});

it("converts \\rightarrow to ->", () => {
  expect(normalise("1 \\rightarrow 2")).toEqual("1 -> 2");
});

it("does not change ->", () => {
  expect(normalise("1 -> 2")).toEqual("1 -> 2");
});

it("adds space around -> if there isn't already", () => {
  expect(normalise("1->2")).toEqual("1 -> 2");
});

it("adds space around aliases of -> if there isn't already", () => {
  expect(normalise("1→2")).toEqual("1 -> 2");
});
