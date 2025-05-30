import { buildTermParser } from "@/lib/parsers/term";
import { TerminalAST, NonTerminalAST, MultisetAST } from "@/lib/types/ast";
import { Terminal, NonTerminal, Multiset, Or, Maybe } from "@/lib/types/token";
import { ResultKind } from "parjs";
import { SyntaxRule } from "@/lib/types/rules";
import { getDefaultSyntaxRule } from "@/lib/utils";

it("parses terminals", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x"), new Terminal("|-"), new Terminal("y")]],
  };
  const parser = buildTermParser([statement]);
  expect(parser.parse("x |- y").value).toEqual([new TerminalAST("x"), new TerminalAST("|-"), new TerminalAST("y")]);
});

it("parses non-terminals", () => {
  const statement = { ...getDefaultSyntaxRule(), definition: [[new NonTerminal(1)]] };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [
      [new Terminal("x")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
  };
  const parser = buildTermParser([statement, type]);
  expect(parser.parse("(x -> x)").value).toEqual([
    new NonTerminalAST(1, [
      new TerminalAST("("),
      new NonTerminalAST(1, [new TerminalAST("x")]),
      new TerminalAST("->"),
      new NonTerminalAST(1, [new TerminalAST("x")]),
      new TerminalAST(")"),
    ]),
  ]);
});

it("parses multiset with one element", () => {
  const statement = { ...getDefaultSyntaxRule(), definition: [[new Multiset([new NonTerminal(1)])]] };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, type]);
  expect(parser.parse("a").value).toEqual([new MultisetAST([[new NonTerminalAST(1, [new TerminalAST("a")])]])]);
});

it("parses multiset with multiple elements", () => {
  const statement = { ...getDefaultSyntaxRule(), definition: [[new Multiset([new NonTerminal(1)])]] };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, type]);
  expect(parser.parse("a, b,a").value).toEqual([
    new MultisetAST([
      [new NonTerminalAST(1, [new TerminalAST("a")])],
      [new NonTerminalAST(1, [new TerminalAST("b")])],
      [new NonTerminalAST(1, [new TerminalAST("a")])],
    ]),
  ]);
});

it("parses empty multisets", () => {
  const statement = { ...getDefaultSyntaxRule(), definition: [[new Multiset([new NonTerminal(1)])]] };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, type]);
  expect(parser.parse("\\varnothing").value).toEqual([new MultisetAST([])]);
});

it("parses multiset followed by comma", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(1)]), new Terminal(","), new Terminal("x")]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, type]);
  expect(parser.parse("a,b,a,x").value).toEqual([
    new MultisetAST([
      [new NonTerminalAST(1, [new TerminalAST("a")])],
      [new NonTerminalAST(1, [new TerminalAST("b")])],
      [new NonTerminalAST(1, [new TerminalAST("a")])],
    ]),
    new TerminalAST(","),
    new TerminalAST("x"),
  ]);
});

it("parses multisets greedily without caring about the rest of the same rule", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal(";")]],
  };
  const context = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)]), new Terminal(","), new NonTerminal(1)]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, context, type]);
  expect(parser.parse("a,b,a,b;").kind).toEqual(ResultKind.HardFail);
});

it("parses multisets greedily without caring about other rules", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal(","), new NonTerminal(1), new Terminal(";")]],
  };
  const context = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };
  const parser = buildTermParser([statement, context, type]);
  expect(parser.parse("a,b,a,b;").kind).toEqual(ResultKind.HardFail);
});

it("parses rules with Ors", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [
      [
        new Terminal("("),
        new Or([
          [new Terminal("a"), new Terminal(")")],
          [new Terminal("b"), new Terminal(")")],
        ]),
      ],
    ],
  };
  const parser = buildTermParser([statement]);
  expect(parser.parse("(a)").value).toEqual([new TerminalAST("("), new TerminalAST("a"), new TerminalAST(")")]);
  expect(parser.parse("(b)").value).toEqual([new TerminalAST("("), new TerminalAST("b"), new TerminalAST(")")]);
});

it("parses rules with Maybes", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("a"), new Maybe([[new Terminal("b")]])]],
  };
  const parser = buildTermParser([statement]);
  expect(parser.parse("a").value).toEqual([new TerminalAST("a")]);
  expect(parser.parse("ab").value).toEqual([new TerminalAST("a"), new TerminalAST("b")]);
});

it("parses statements in logic", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [
      [new NonTerminal(3)],
      [new Terminal("("), new NonTerminal(2), new Terminal("->"), new NonTerminal(2), new Terminal(")")],
    ],
  };
  const typevar = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\varphi"],
    definition: [[new Terminal("1")], [new Terminal("2")], [new Terminal("3")]],
  };

  const parser = buildTermParser([statement, context, type, typevar]);
  expect(parser.parse("\\varnothing |- (1 -> 2)").value).toEqual([
    new NonTerminalAST(1, [new MultisetAST([])]),
    new Terminal("|-"),
    new NonTerminalAST(2, [
      new TerminalAST("("),
      new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("1")])]),
      new TerminalAST("->"),
      new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("2")])]),
      new TerminalAST(")"),
    ]),
  ]);

  expect(parser.parse("1, 2 |- (1 -> 2)").value).toEqual([
    new NonTerminalAST(1, [
      new MultisetAST([
        [new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("1")])])],
        [new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("2")])])],
      ]),
    ]),
    new TerminalAST("|-"),
    new NonTerminalAST(2, [
      new TerminalAST("("),
      new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("1")])]),
      new TerminalAST("->"),
      new NonTerminalAST(2, [new NonTerminalAST(3, [new TerminalAST("2")])]),
      new TerminalAST(")"),
    ]),
  ]);
});
