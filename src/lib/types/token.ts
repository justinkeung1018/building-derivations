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
  constructor(readonly tokens: Token[]) {} // TODO: investigate whether we can type this as (Terminal | NonTerminal)[]
}

type Token = Terminal | NonTerminal | Multiset;

export { Terminal, NonTerminal, Multiset };
export type { Token };
