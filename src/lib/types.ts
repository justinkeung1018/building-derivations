interface SyntaxRule {
  definition: Token[][];
  placeholders: string[];
  definitionSanitised: string[];
  placeholdersUnsanitised: string;
  definitionUnsanitised: string;
}

class Terminal {
  constructor(readonly value: string) {}
}

class NonTerminal {
  constructor(
    readonly index: number,
    readonly name: string,
  ) {}
}

type Token = Terminal | NonTerminal;

export { Terminal, NonTerminal };
export type { SyntaxRule, Token };
