import { MultisetAST, NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import { InferenceRule } from "@/lib/types/rules";
import { Multiset, NonTerminal, Terminal } from "@/lib/types/token";
import { match, verify } from "@/lib/verifier";

const defaultRule = {
  placeholders: [],
  definition: [],
  definitionSanitised: [],
  placeholdersUnsanitised: "",
  definitionUnsanitised: "",
};

describe("Matches things", () => {
  it("matches basic statements", () => {
    const input = "x |- x";
    const structure = [new NonTerminal(1, "A"), new Terminal("|-"), new NonTerminal(1, "A")];

    // Syntax
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(1, "A"), new Terminal("|-"), new NonTerminal(1, "A")]],
    };
    const type = { ...defaultRule, definition: [[new Terminal("x")]], placeholders: ["A"] };

    expect(match(input, structure, [statement, type], {})).toEqual({
      A: new NonTerminalAST("A", [new TerminalAST("x")]),
    });
  });

  it("matches arrows", () => {
    const input = "x |- (x -> y)";
    const structure = [
      new NonTerminal(1, "A"),
      new Terminal("|-"),
      new Terminal("("),
      new NonTerminal(1, "A"),
      new Terminal("->"),
      new NonTerminal(1, "B"),
      new Terminal(")"),
    ];

    // Syntax
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(1, "A"), new Terminal("|-"), new NonTerminal(1, "B")]],
    };
    const type = {
      ...defaultRule,
      definition: [
        [new Terminal("x")],
        [new Terminal("y")],
        [new Terminal("("), new NonTerminal(1, "A"), new Terminal("->"), new NonTerminal(1, "B"), new Terminal(")")],
      ],
      placeholders: ["A", "B"],
    };

    expect(match(input, structure, [statement, type], {})).toEqual({
      A: new NonTerminalAST("A", [new TerminalAST("x")]),
      B: new NonTerminalAST("B", [new TerminalAST("y")]),
    });
  });

  it("matches multisets that do not need to be inferred", () => {
    const input = "x, y |- (y -> z)";
    const structure = [
      new NonTerminal(2, "\\Gamma"),
      new Terminal("|-"),
      new Terminal("("),
      new NonTerminal(1, "A"),
      new Terminal("->"),
      new NonTerminal(1, "B"),
      new Terminal(")"),
    ];

    // Syntax
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(2, "\\Gamma"), new Terminal("|-"), new NonTerminal(1, "A")]],
    };
    const type = {
      ...defaultRule,
      definition: [
        [new Terminal("x")],
        [new Terminal("y")],
        [new Terminal("z")],
        [new Terminal("("), new NonTerminal(1, "A"), new Terminal("->"), new NonTerminal(1, "B"), new Terminal(")")],
      ],
      placeholders: ["A", "B"],
    };
    const context = {
      ...defaultRule,
      definition: [[new Multiset(new NonTerminal(1, "A"))]],
      placeholders: ["\\Gamma"],
    };

    expect(match(input, structure, [statement, type, context], {})).toEqual({
      "\\Gamma": new NonTerminalAST("\\Gamma", [
        new MultisetAST([
          new NonTerminalAST("A", [new TerminalAST("x")]),
          new NonTerminalAST("A", [new TerminalAST("y")]),
        ]),
      ]),
      A: new NonTerminalAST("A", [new TerminalAST("y")]),
      B: new NonTerminalAST("B", [new TerminalAST("z")]),
    });
  });

  it("matches multisets that need to be inferred", () => {
    const input = "x, y |- x";
    const structure = [
      new NonTerminal(2, "\\Gamma"),
      new Terminal(","),
      new NonTerminal(1, "A"),
      new Terminal("|-"),
      new NonTerminal(1, "A"),
    ];

    // Syntax
    const statement = {
      ...defaultRule,
      definition: [[new NonTerminal(2, "\\Gamma"), new Terminal("|-"), new NonTerminal(1, "A")]],
    };
    const type = {
      ...defaultRule,
      definition: [
        [new Terminal("x")],
        [new Terminal("y")],
        [new Terminal("("), new NonTerminal(1, "A"), new Terminal("->"), new NonTerminal(1, "B"), new Terminal(")")],
      ],
      placeholders: ["A", "B"],
    };
    const context = {
      ...defaultRule,
      definition: [[new Multiset(new NonTerminal(1, "A"))]],
      placeholders: ["\\Gamma"],
    };

    expect(match(input, structure, [statement, type, context], {})).toEqual({
      "\\Gamma": new NonTerminalAST("\\Gamma", [new MultisetAST([new NonTerminalAST("A", [new TerminalAST("y")])])]),
      A: new NonTerminalAST("A", [new TerminalAST("x")]),
    });
  });
});

describe("Verifies logic inference rules are applied correctly", () => {
  // Syntax
  const statement = {
    ...defaultRule,
    definition: [[new NonTerminal(2, "\\Gamma"), new Terminal("|-"), new NonTerminal(1, "A")]],
  };
  const type = {
    ...defaultRule,
    definition: [
      [new Terminal("x")],
      [new Terminal("y")],
      [new Terminal("z")],
      [new Terminal("("), new NonTerminal(1, "A"), new Terminal("->"), new NonTerminal(1, "B"), new Terminal(")")],
    ],
    placeholders: ["A", "B"],
  };
  const context = {
    ...defaultRule,
    definition: [[new Multiset(new NonTerminal(1, "A"))]],
    placeholders: ["\\Gamma"],
  };

  const syntax = [statement, type, context];

  const action: InferenceRule = {
    name: "Ax",
    premises: [],
    conclusion: {
      structure: [
        new NonTerminal(2, "\\Gamma"),
        new Terminal(","),
        new NonTerminal(1, "A"),
        new Terminal("|-"),
        new NonTerminal(1, "A"),
      ],
      sanitised: "",
      unsanitised: "",
    },
  };

  describe("Verifies correct applications of the action rule", () => {
    function check(conclusion: string) {
      expect(verify(conclusion, [], action, syntax)).toBe(true);
    }

    it("verifies context with variables only", () => {
      check("x, y, z |- y");
    });

    it("verifies context with arrow terms", () => {
      check("(x -> y), x |- (x -> y)");
    });

    it("verifies context with duplicate elements", () => {
      check("y, y, y, x, y, x |- x");
    });
  });

  describe("Verifies incorrect application of action rule", () => {
    it("rejects when conclusion does not appear in context", () => {
      const conclusion = "x, y |- z";
      expect(verify(conclusion, [], action, syntax)).toBe(false);
    });

    it("rejects non-empty premises", () => {
      const conclusion = "x |- x";
      const premises = ["x |- x"];
      expect(verify(conclusion, premises, action, syntax)).toBe(false);
    });
  });
});
