import { buildParsers, parseSyntax } from "@/lib/parsers/syntax";
import { MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { ParjsParsingFailure } from "parjs";

const defaultRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};

describe("Parses syntax rules", () => {
  const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{A}" };

  it("parses placeholders", () => {
    const rule = { ...defaultRule, placeholdersUnsanitised: "\\Gamma, \\Alpha, a,b,c" };
    const [parsed] = parseSyntax([rule]);
    expect(parsed.placeholders).toEqual(["\\Gamma", "\\Alpha", "a", "b", "c"]);
  });

  it("assigns non-terminals to placeholders and terminals otherwise", () => {
    const rule1 = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "A | B|y" };
    const rule2 = { ...defaultRule, placeholdersUnsanitised: "A,B, C", defintiionUnsanitised: "x" };
    const [parsed1, _] = parseSyntax([rule1, rule2]);
    expect(parsed1.definition).toEqual([[new NonTerminal(1, "A")], [new NonTerminal(1, "B")], [new Terminal("y")]]);
  });

  it("parses multisets of non-terminals", () => {
    const type = { ...defaultRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]);
    expect(contextParsed.definition).toEqual([[new Multiset(new NonTerminal(1, "A"))]]);
  });

  it("parses multisets of non-terminals with spaces between curly braces", () => {
    const context = { ...defaultRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" };
    const type = { ...defaultRule, placeholdersUnsanitised: "A", definitionUnsanitised: "x" };
    const [contextParsed, _] = parseSyntax([context, type]);
    expect(contextParsed.definition).toEqual([[new Multiset(new NonTerminal(1, "A"))]]);
  });

  it("fails when trying to parse multisets of terminals", () => {
    // Since A (in the definition of \\Gamma) does not appear in the list of placeholders, it is treated as a terminal "A"
    expect(() => parseSyntax([context])).toThrow(ParjsParsingFailure);
  });

  it("fails when there are duplicate placeholders", () => {
    const rule1 = { ...defaultRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "x" };
    const rule2 = { ...defaultRule, placeholdersUnsanitised: "B, C", definitionUnsanitised: "y" };
    expect(() => parseSyntax([rule1, rule2])).toThrow(Error);
  });

  it("parses logic syntax", () => {
    const statement = { ...defaultRule, definitionUnsanitised: "\\Gamma |- A" };
    const type = { ...defaultRule, placeholdersUnsanitised: "A,B", definitionUnsanitised: "\\varphi | (A -> B)" };
    const typevar = { ...defaultRule, placeholdersUnsanitised: "\\varphi", definitionUnsanitised: "1 | 2 | 3 | 4 | 5" };
    const [statementParsed, contextParsed, typeParsed, typevarParsed] = parseSyntax([
      statement,
      context,
      type,
      typevar,
    ]);
    expect(statementParsed.definition).toEqual([
      [new NonTerminal(1, "\\Gamma"), new Terminal("|-"), new NonTerminal(2, "A")],
    ]);
    expect(contextParsed.placeholders).toEqual(["\\Gamma"]);
    expect(contextParsed.definition).toEqual([[new Multiset(new NonTerminal(2, "A"))]]);
    expect(typeParsed.placeholders).toEqual(["A", "B"]);
    expect(typeParsed.definition).toEqual([
      [new NonTerminal(3, "\\varphi")],
      [new Terminal("("), new NonTerminal(2, "A"), new Terminal("->"), new NonTerminal(2, "B"), new Terminal(")")],
    ]);
    expect(typevarParsed.placeholders).toEqual(["\\varphi"]);
    expect(typevarParsed.definition).toEqual([
      [new Terminal("1")],
      [new Terminal("2")],
      [new Terminal("3")],
      [new Terminal("4")],
      [new Terminal("5")],
    ]);
  });
});

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

  const statement = { ...defaultRule, definition: [[new Multiset(new NonTerminal(1, "A"))]] };
  const type = { ...defaultRule, placeholders: ["A"], definition: [[new Terminal("a")], [new Terminal("b")]] };
  const parser = buildParsers([statement, type])[0];

  it("parses non-empty multisets", () => {
    expect(parser.parse("a, b,a").value).toEqual([
      new MultisetAST([
        new NonTerminalAST("A", [new TerminalAST("a")]),
        new NonTerminalAST("A", [new TerminalAST("b")]),
        new NonTerminalAST("A", [new TerminalAST("a")]),
      ]),
    ]);
  });

  it("parses empty multisets", () => {
    expect(parser.parse("\\varnothing").value).toEqual([new MultisetAST([])]);
  });

  it("parses statements in logic", () => {
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(1, "\\Gamma"), new Terminal("|-"), new NonTerminal(2, "A")]],
    };
    const context = {
      ...defaultRule,
      placeholders: ["\\Gamma"],
      definition: [[new Multiset(new NonTerminal(2, "A"))]],
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
          new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("1")])]),
          new NonTerminalAST("A", [new NonTerminalAST("\\varphi", [new TerminalAST("2")])]),
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
