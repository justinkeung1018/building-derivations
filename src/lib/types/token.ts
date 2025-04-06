export class Terminal {
  constructor(readonly value: string) {}
}

export class NonTerminal {
  constructor(
    readonly index: number,
    readonly name: string,
  ) {}
}

export class Multiset {
  constructor(readonly tokens: Token[]) {} // TODO: investigate whether we can type this as (Terminal | NonTerminal)[]
}

export class Or {
  constructor(readonly alternatives: Token[][]) {}
}

export type Token = Terminal | NonTerminal | Multiset | Or;
