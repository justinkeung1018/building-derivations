import { AST, MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
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
import { getDefaultSyntaxRule } from "@/lib/utils";
import { match } from "@/lib/verifier/match";

it("matches basic statements", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type: SyntaxRule = { ...getDefaultSyntaxRule(), placeholders: ["A"], definition: [[new Terminal("x")]] };

  const input = "x |- x";
  const structure: Matchable[] = [new Name(1, "A"), new MatchableTerminal("|-"), new Name(1, "A")];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, type], names, {});

  expect(names).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
  });
});

it("fails when the input is nonsense", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
  };

  const input = "werioahjvoi";
  const structure: Matchable[] = [new MatchableTerminal("x")];

  expect(() => {
    match(input, structure, [statement], {}, {});
  }).toThrow("Malformed");
});

it("fails when the existing value for a name mapping to a non-terminal is not compatible with the input", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A"],
    definition: [[new Terminal("x")], [new Terminal("y")]],
  };

  const input = "x";
  const structure: Matchable[] = [new Name(1, "A")];

  expect(() => {
    match(input, structure, [statement, type], { A: new NonTerminalAST(1, [new TerminalAST("y")]) }, {});
  }).toThrow("Incompatible");
});

describe("fails to match a multiset to an existing value in the mapping", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2)])]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["A", "B"],
    definition: [[new Terminal("a")], [new Terminal("b")]],
  };

  const structure: Matchable[] = [new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])])];

  it("fails when the existing multiset has fewer elements", () => {
    const input = "a,b";
    const names: Record<string, AST> = {
      "\\Gamma": new MultisetAST([[new NonTerminalAST(2, [new TerminalAST("a")])]]),
    };
    expect(() => {
      match(input, structure, [statement, context, type], names, {});
    }).toThrow("leftover");
  });

  it("fails when the existing multiset has more elements", () => {
    const input = "a,a";
    const names: Record<string, AST> = {
      "\\Gamma": new MultisetAST([
        [new NonTerminalAST(2, [new TerminalAST("a")])],
        [new NonTerminalAST(2, [new TerminalAST("a")])],
        [new NonTerminalAST(2, [new TerminalAST("a")])],
      ]),
    };
    expect(() => {
      match(input, structure, [statement, context, type], names, {});
    }).toThrow("not found");
  });

  it("fails when the existing multiset has the same number of elements but different elements", () => {
    const input = "a,b";
    const names: Record<string, AST> = {
      "\\Gamma": new MultisetAST([
        [new NonTerminalAST(2, [new TerminalAST("a")])],
        [new NonTerminalAST(2, [new TerminalAST("a")])],
      ]),
    };
    expect(() => {
      match(input, structure, [statement, context, type], names, {});
    }).toThrow("not found");
  });
});

it("matches arrows", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(1)]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

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

  const names: Record<string, AST> = {};
  match(input, structure, [statement, type], names, {});

  expect(names).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
    B: new NonTerminalAST(1, [new TerminalAST("y")]),
  });
});

it("matches when there is only one multiset element to match and one actual element in the given multiset", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  const input = "x";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
    ]),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([]),
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
  });
});

it("fails when there is only one multiset element to match and one actual element in the given multiset, but the element is incompatible with the given names", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  const input = "x";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(2, "A")])]),
    ]),
  ];

  expect(() => {
    match(input, structure, [statement, context, type], { A: new NonTerminalAST(2, [new TerminalAST("y")]) }, {});
  }).toThrow("Failed to match");
});

it("matches multisets with unique elements that do not need to be inferred", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  const input = "x, y, z";
  const structure: Matchable[] = [new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])])];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("y")])],
      [new NonTerminalAST(2, [new TerminalAST("z")])],
    ]),
  });
});

it("matches multisets with duplicate elements that do not need to be inferred", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A"],
  };

  const input = "x, y, x,x,x,y,z";
  const structure: Matchable[] = [new MatchableNonTerminal(1, [new MatchableMultiset(1, [new Name(1, "\\Gamma")])])];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
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

it("matches multisets with unique elements that need to be inferred from the rest of the statement", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")]],
    placeholders: ["A", "B"],
  };

  const input = "x, y |- x";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "A"),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([[new NonTerminalAST(2, [new TerminalAST("y")])]]),
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
  });
});

it("matches multisets that need to be inferred from the names", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A", "B"],
  };

  const input = "x, y |- z";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "B"),
  ];

  const names: Record<string, AST> = {
    "\\Gamma": new MultisetAST([[new NonTerminalAST(2, [new TerminalAST("y")])]]),
  };
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([[new NonTerminalAST(2, [new TerminalAST("y")])]]),
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
    B: new NonTerminalAST(2, [new TerminalAST("z")]),
  });
});

it("fails to match multisets that need to be inferred from the names but are incompatible with the names", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A", "B"],
  };

  const input = "x, y |- z";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "B"),
  ];
  const names: Record<string, AST> = {
    "\\Gamma": new MultisetAST([
      [new NonTerminalAST(2, [new TerminalAST("y")])],
      [new NonTerminalAST(2, [new TerminalAST("x")])],
    ]),
  };

  expect(() => {
    match(input, structure, [statement, context, type], names, {});
  }).toThrow("placeholder");
});

it("leaves uninferrable multisets alone", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")], [new Terminal("y")], [new Terminal("z")]],
    placeholders: ["A", "B"],
  };

  const input = "x, y |- z";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "B"),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    B: new NonTerminalAST(2, [new TerminalAST("z")]),
  });
});

it("matches multisets with duplicate elements that need to be inferred from the rest of the statement", () => {
  const statement = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2)]],
  };
  const context = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [[new Terminal("x")]],
    placeholders: ["A", "B"],
  };

  const input = "x,x ,x |- x";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [new Name(1, "\\Gamma"), new MultisetElement([new Name(1, "A")])]),
    ]),
    new MatchableTerminal("|-"),
    new Name(1, "A"),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([
      [new NonTerminalAST(2, [new TerminalAST("x")])],
      [new NonTerminalAST(2, [new TerminalAST("x")])],
    ]),
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
  });
});

it("matches multisets where each element consists of multiple tokens", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1), new Terminal("|-"), new NonTerminal(2), new Terminal(":"), new NonTerminal(3)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\Gamma"],
    definition: [[new Multiset([new NonTerminal(2), new Terminal(":"), new NonTerminal(3)])]],
  };
  const variable: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["var"],
    definition: [[new Terminal("x")], [new Terminal("y")]],
  };
  const type: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    placeholders: ["\\varphi"],
    definition: [[new Terminal("1")], [new Terminal("2")]],
  };

  const input = "x:1, y:2 |- y:2";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [
        new Name(1, "\\Gamma"),
        new MultisetElement([new Name(2, "var"), new MatchableTerminal(":"), new Name(3, "\\varphi")]),
      ]),
    ]),
    new MatchableTerminal("|-"),
    new Name(2, "var"),
    new MatchableTerminal(":"),
    new Name(3, "\\varphi"),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, variable, type], names, {});

  expect(names).toEqual({
    "\\Gamma": new MultisetAST([
      [
        new NonTerminalAST(2, [new TerminalAST("x")]),
        new TerminalAST(":"),
        new NonTerminalAST(3, [new TerminalAST("1")]),
      ],
    ]),
    var: new NonTerminalAST(2, [new TerminalAST("y")]),
    "\\varphi": new NonTerminalAST(3, [new TerminalAST("2")]),
  });
});

it("matches multiset elements that are expanded forms of the multiset definition", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(1)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  const input = "(x -> y)";
  const structure: Matchable[] = [
    new MatchableMultiset(0, [
      new MultisetElement([
        new MatchableNonTerminal(1, [
          new MatchableTerminal("("),
          new Name(1, "A"),
          new MatchableTerminal("->"),
          new Name(1, "B"),
          new MatchableTerminal(")"),
        ]),
      ]),
    ]),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, type], names, {});

  expect(names).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
    B: new NonTerminalAST(1, [new TerminalAST("y")]),
  });
});

it("matches when the same name appears multiple times in a multiset element", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(1)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  const input = "(x -> x)";
  const structure: Matchable[] = [
    new MatchableMultiset(0, [
      new MultisetElement([
        new MatchableNonTerminal(1, [
          new MatchableTerminal("("),
          new Name(1, "A"),
          new MatchableTerminal("->"),
          new Name(1, "A"),
          new MatchableTerminal(")"),
        ]),
      ]),
    ]),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, type], names, {});

  expect(names).toEqual({
    A: new NonTerminalAST(1, [new TerminalAST("x")]),
  });
});

it("fails when the same name appears multiple times in a multiset element, but the actual element is incompatible", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(1)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  const input = "(x -> y)";
  const structure: Matchable[] = [
    new MatchableMultiset(0, [
      new MultisetElement([
        new MatchableNonTerminal(1, [
          new MatchableTerminal("("),
          new Name(1, "A"),
          new MatchableTerminal("->"),
          new Name(1, "A"),
          new MatchableTerminal(")"),
        ]),
      ]),
    ]),
  ];

  expect(() => {
    match(input, structure, [statement, type], {}, {});
  }).toThrow("Failed to match placeholder");
});

it("matches when the same name appears multiple times in a multiset element, and there are multiple actual elements", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new NonTerminal(1)]],
  };
  const context: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(2)])]],
    placeholders: ["\\Gamma"],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(2), new Terminal("->"), new NonTerminal(2), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  const input = "(x -> y), (x -> x)";
  const structure: Matchable[] = [
    new MatchableNonTerminal(1, [
      new MatchableMultiset(1, [
        new Name(1, "\\Gamma"),
        new MultisetElement([
          new MatchableNonTerminal(2, [
            new MatchableTerminal("("),
            new Name(2, "A"),
            new MatchableTerminal("->"),
            new Name(2, "A"),
            new MatchableTerminal(")"),
          ]),
        ]),
      ]),
    ]),
  ];

  const names: Record<string, AST> = {};
  match(input, structure, [statement, context, type], names, {});

  expect(names).toEqual({
    A: new NonTerminalAST(2, [new TerminalAST("x")]),
    "\\Gamma": new MultisetAST([
      [
        new NonTerminalAST(2, [
          new TerminalAST("("),
          new NonTerminalAST(2, [new TerminalAST("x")]),
          new TerminalAST("->"),
          new NonTerminalAST(2, [new TerminalAST("y")]),
          new TerminalAST(")"),
        ]),
      ],
    ]),
  });
});

it("returns a map of names to ASTs when some names cannot be matched immediately", () => {
  const statement: SyntaxRule = {
    ...getDefaultSyntaxRule(),
    definition: [[new Multiset([new NonTerminal(1)])]],
  };
  const type = {
    ...getDefaultSyntaxRule(),
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("("), new NonTerminal(1), new Terminal("->"), new NonTerminal(1), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };

  const input = "x, y";
  const structure: Matchable[] = [
    new MatchableMultiset(0, [new MultisetElement([new Name(1, "A")]), new MultisetElement([new Name(1, "B")])]),
  ];

  const unmatchedPossibilities: Record<string, AST[]> = {};
  match(input, structure, [statement, type], {}, unmatchedPossibilities);

  expect(unmatchedPossibilities).toEqual({
    A: [new NonTerminalAST(1, [new TerminalAST("x")]), new NonTerminalAST(1, [new TerminalAST("y")])],
    B: [new NonTerminalAST(1, [new TerminalAST("x")]), new NonTerminalAST(1, [new TerminalAST("y")])],
  });
});
