import { MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import {
  Matchable,
  Name,
  MatchableTerminal,
  MatchableNonTerminal,
  MatchableMultiset,
  MultisetElement,
} from "@/lib/types/matchable";
import { SyntaxRule } from "@/lib/types/rules";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { defaultSyntaxRule } from "../parsers/utils";
import { match } from "@/lib/verifier/match";

it("matches basic statements", () => {
  const input = "x |- x";
  const structure: Matchable[] = [new Name(1, "A"), new MatchableTerminal("|-"), new Name(1, "A")];

  // Syntax
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type: SyntaxRule = { ...defaultSyntaxRule, placeholders: ["A"], definition: [[new Terminal("x")]] };

  expect(match(input, structure, [statement, type], {})).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
  });
});

it("matches arrows", () => {
  const input = "x |- (x -> y)";
  const structure: Matchable[] = [
    new Name(1, "A"),
    new MatchableTerminal("|-"),
    new MatchableNonTerminal(1, [
      new MatchableTerminal("("),
      new Name(1, "A"),
      new MatchableTerminal("->"),
      new Name(1, "B"),
      new MatchableTerminal(")"),
    ]),
  ];

  // Syntax
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type = {
    ...defaultSyntaxRule,
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  expect(match(input, structure, [statement, type], {})).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
    B: new NonTerminalAST(1, [new TerminalAST("y")]),
  });
});

it("matches multisets with unique elements that do not need to be inferred", () => {
  const input = "x, y, z";
  const structure: Matchable[] = [new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])])];

  // Syntax
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  expect(match(input, structure, [statement, context, type], {})).toEqual({
    "\\Gamma": new MultisetAST([
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("y")])],
      [new NonTerminalAST(2, [new TerminalAST("z")])],
    ]),
  });
});

it("matches multisets with duplicate elements that do not need to be inferred", () => {
  const input = "x, y, x,x,x,y,z";
  const structure: Matchable[] = [new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])])];

  // Syntax
  const statement: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...defaultSyntaxRule,
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  expect(match(input, structure, [statement, context, type], {})).toEqual({
    "\\Gamma": new MultisetAST([
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("y")])],
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("y")])],
      [new NonTerminalAST(2, [new TerminalAST("z")])],
    ]),
  });
});

it("matches multisets that need to be inferred", () => {
  const input = "x, y |- x";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "A"),
  ];

  // Syntax
  const statement = {
    ...defaultSyntaxRule,
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context = {
    ...defaultSyntaxRule,
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type = {
    ...defaultSyntaxRule,
    definition: [[new Terminal("x")], [new Terminal("y")]],
    placeholders: ["A", "B"],
  };

  expect(match(input, structure, [statement, context, type], {})).toEqual({
    "\\Gamma": new MultisetAST([[new NonTerminalAST(2, [new TerminalAST("y")])]]),
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
  });
});
