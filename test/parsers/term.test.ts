import { buildParsers } from "@/lib/parsers/term";
import { TerminalAST, NonTerminalAST, MultisetAST } from "@/lib/types/ast";
import { Terminal, NonTerminal, Multiset } from "@/lib/types/token";
import { defaultSyntaxRule } from "./utils";
import { ResultKind } from "parjs";

it("parses terminals", () => {
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new Terminal("x"), new Terminal("|-"), new Terminal("y")]],
  };
  const parser = buildParsers([statement])[0];
  expect(parser.parse("x |- y").value).toEqual([new TerminalAST("x"), new TerminalAST("|-"), new TerminalAST("y")]);
});

it("parses non-terminals", () => {
  const statement = { ...defaultSyntaxRule, definition: [[new NonTerminal(1, "A")]] };
  const type = {
    ...defaultSyntaxRule,
    placeholders: ["A"],
    definition: [
      [new Terminal("x")],
      [new Terminal("("), new NonTerminal(1, "A"), new Terminal("->"), new NonTerminal(1, "A"), new Terminal(")")],
    ],
  };
  const parser = buildParsers([statement, type])[0];
  expect(parser.parse("(x -> x)").value).toEqual([
    new NonTerminalAST("A", [
      new TerminalAST("("),
      new NonTerminalAST("A", [new TerminalAST("x")]),
      new TerminalAST("->"),
      new NonTerminalAST("A", [new TerminalAST("x")]),
      new TerminalAST(")"),
    ]),
  ]);
});

it("parses multiset with one element", () => {
  const statement = { ...defaultSyntaxRule, definition: [[new Multiset([new NonTerminal(1, "A")])]] };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];
  expect(parser.parse("a").value).toEqual([new MultisetAST([[new NonTerminalAST("A", [new TerminalAST("a")])]])]);
});

it("parses multiset with multiple elements", () => {
  const statement = { ...defaultSyntaxRule, definition: [[new Multiset([new NonTerminal(1, "A")])]] };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];
  expect(parser.parse("a, b,a").value).toEqual([
    new MultisetAST([
      [new NonTerminalAST("A", [new TerminalAST("a")])],
      [new NonTerminalAST("A", [new TerminalAST("b")])],
      [new NonTerminalAST("A", [new TerminalAST("a")])],
    ]),
  ]);
});

it("parses empty multisets", () => {
  const statement = { ...defaultSyntaxRule, definition: [[new Multiset([new NonTerminal(1, "A")])]] };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];
  expect(parser.parse("\\varnothing").value).toEqual([new MultisetAST([])]);
});

it("parses multiset followed by comma", () => {
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new Multiset([new NonTerminal(1, "A")]), new Terminal(","), new Terminal("x")]],
  };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];
  expect(parser.parse("a,b,a,x").value).toEqual([
    new MultisetAST([
      [new NonTerminalAST("A", [new TerminalAST("a")])],
      [new NonTerminalAST("A", [new TerminalAST("b")])],
      [new NonTerminalAST("A", [new TerminalAST("a")])],
    ]),
    new TerminalAST(","),
    new TerminalAST("x"),
  ]);
});

it("parses multisets greedily without caring about the rest of the same rule", () => {
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1, "\\Gamma"), new Terminal(";")]],
  };
  const context = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2, "A")]), new Terminal(","), new NonTerminal(1, "A")]],
  };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, context, type])[0];
  expect(parser.parse("a,b,a,b;").kind).toEqual(ResultKind.HardFail);
});

it("parses multisets greedily without caring about other rules", () => {
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1, "\\Gamma"), new Terminal(","), new NonTerminal(1, "A"), new Terminal(";")]],
  };
  const context = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2, "A")])]],
  };
  const type = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, context, type])[0];
  expect(parser.parse("a,b,a,b;").kind).toEqual(ResultKind.HardFail);
});

it("parses statements in logic", () => {
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1, "\\Gamma"), new Terminal("|-"), new NonTerminal(2, "A")]],
  };
  const context = {
    ...defaultSyntaxRule,
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2, "A")])]],
  };
  const type = {
    ...defaultSyntaxRule,
    placeholders: ["A", "B"],
    definition: [
      [new NonTerminal(3, "\\varphi")],
      [new Terminal("("), new NonTerminal(2, "A"), new Terminal("->"), new NonTerminal(2, "B"), new Terminal(")")],
    ],
  };
  const typevar = {
    ...defaultSyntaxRule,
    placeholders: ["\\varphi"],
    definition: [[new Terminal("1")], [new Terminal("2")], [new Terminal("3")]],
  };

  const parser = buildParsers([statement, context, type, typevar])[0];
  expect(parser.parse("\\varnothing |- (1 -> 2)").value).toEqual([
    new NonTerminalAST("\\Gamma", [new MultisetAST([])]),
    new Terminal("|-"),
    new NonTerminalAST("A", [
      new TerminalAST("("),
      new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("1")])]),
      new TerminalAST("->"),
      new NonTerminalAST("B", [new NonTerminalAST("\\varphi", [new TerminalAST("2")])]),
      new TerminalAST(")"),
    ]),
  ]);

  expect(parser.parse("1, 2 |- (1 -> 2)").value).toEqual([
    new NonTerminalAST("\\Gamma", [
      new MultisetAST([
        [new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("1")])])],
        [new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("2")])])],
      ]),
    ]),
    new TerminalAST("|-"),
    new NonTerminalAST("A", [
      new TerminalAST("("),
      new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("1")])]),
      new TerminalAST("->"),
      new NonTerminalAST("B", [new NonTerminalAST("\\varphi", [new TerminalAST("2")])]),
      new TerminalAST(")"),
    ]),
  ]);
});
