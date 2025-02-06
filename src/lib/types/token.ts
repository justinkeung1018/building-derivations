class Terminal {
  constructor(readonly value: string) {}
}

class NonTerminal {
  constructor(
    readonly index: number,
    readonly name: string,
  ) {}
}

class Multiset {
  constructor(readonly nonTerminal: NonTerminal) {}
}

type Token = Terminal | NonTerminal | Multiset;

export { Terminal, NonTerminal, Multiset };
export type { Token };
