import { parseSyntax } from "@/lib/parsers/parjs/syntax";
import { Multiset, NonTerminal, Terminal } from "@/lib/types";
import { ParjsParsingFailure } from "parjs";

const defaultRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};
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

it("fails when trying to parse multisets of terminals", () => {
  expect(() => parseSyntax([context])).toThrow(ParjsParsingFailure);
});

it("parses logic syntax", () => {
  const statement = { ...defaultRule, definitionUnsanitised: "\\Gamma |- A" };
  const type = { ...defaultRule, placeholdersUnsanitised: "A,B", definitionUnsanitised: "\\varphi | (A -> B)" };
  const typevar = { ...defaultRule, placeholdersUnsanitised: "\\varphi", definitionUnsanitised: "1 | 2 | 3 | 4 | 5" };
  const [statementParsed, contextParsed, typeParsed, typevarParsed] = parseSyntax([statement, context, type, typevar]);
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
