import { buildParsers } from "@/lib/parsers/syntax";
import { TerminalAST, NonTerminalAST, MultisetAST } from "@/lib/types/ast";
import { Terminal, NonTerminal, Multiset } from "@/lib/types/token";

const defaultRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};

describe("Builds parser based on syntax rules", () => {
  it("parses terminals", () => {
    const statement = { ...defaultRule, definition: [[new Terminal("x"), new Terminal("|-"), new Terminal("y")]] };
    const parser = buildParsers([statement])[0];
    expect(parser.parse("x |- y").value).toEqual([new TerminalAST("x"), new TerminalAST("|-"), new TerminalAST("y")]);
  });

  it("parses non-terminals", () => {
    const statement = { ...defaultRule, definition: [[new NonTerminal(1, "A")]] };
    const type = {
      ...defaultRule,
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

  const statement = { ...defaultRule, definition: [[new Multiset([new NonTerminal(1, "A")])]] };
  const type = { ...defaultRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];

  it("parses multiset with one element", () => {
    expect(parser.parse("a").value).toEqual([new MultisetAST([[new NonTerminalAST("A", [new TerminalAST("a")])]])]);
  });

  it("parses multiset with multiple elements", () => {
    expect(parser.parse("a, b,a").value).toEqual([
      new MultisetAST([
        [new NonTerminalAST("A", [new TerminalAST("a")])],
        [new NonTerminalAST("A", [new TerminalAST("b")])],
        [new NonTerminalAST("A", [new TerminalAST("a")])],
      ]),
    ]);
  });

  it("parses empty multisets", () => {
    expect(parser.parse("\\varnothing").value).toEqual([new MultisetAST([])]);
  });

  it("parses multiset followed by comma", () => {
    const statement = {
      ...defaultRule,
      definition: [[new Multiset([new NonTerminal(1, "A")]), new Terminal(","), new Terminal("x")]],
    };
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

  it("parses greedily until the rest of the input matches", () => {
    const statement = {
      ...defaultRule,
      definition: [[new Multiset([new NonTerminal(1, "A")]), new Terminal(","), new NonTerminal(1, "A")]],
    };
    const parser = buildParsers([statement, type])[0];
    expect(parser.parse("a,b").value).toEqual([
      new MultisetAST([[new NonTerminalAST("A", [new TerminalAST("a")])]]),
      new TerminalAST(","),
      new NonTerminalAST("A", [new TerminalAST("b")]),
    ]);
    expect(parser.parse("a,b,a,b").value).toEqual([
      new MultisetAST([
        [new NonTerminalAST("A", [new TerminalAST("a")])],
        [new NonTerminalAST("A", [new TerminalAST("b")])],
        [new NonTerminalAST("A", [new TerminalAST("a")])],
      ]),
      new TerminalAST(","),
      new NonTerminalAST("A", [new TerminalAST("b")]),
    ]);
  });

  it("parses statements in logic", () => {
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(1, "\\Gamma"), new Terminal("|-"), new NonTerminal(2, "A")]],
    };
    const context = {
      ...defaultRule,
      placeholders: ["\\Gamma"],
      definition: [[new Multiset([new NonTerminal(2, "A")])]],
    };
    const type = {
      ...defaultRule,
      placeholders: ["A", "B"],
      definition: [
        [new NonTerminal(3, "\\varphi")],
        [new Terminal("("), new NonTerminal(2, "A"), new Terminal("->"), new NonTerminal(2, "B"), new Terminal(")")],
      ],
    };
    const typevar = {
      ...defaultRule,
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
});
