import { NonTerminalAST, TerminalAST } from "@/lib/types/ast";
import { NonTerminal, Terminal } from "@/lib/types/token";
import { match } from "@/lib/verifier";

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

    expect(match(input, structure, [statement, type])).toEqual({ A: new NonTerminalAST("A", [new TerminalAST("x")]) });
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

    expect(match(input, structure, [statement, type])).toEqual({
      A: new NonTerminalAST("A", [new TerminalAST("x")]),
      B: new NonTerminalAST("B", [new TerminalAST("y")]),
    });
  });
});
