export class Terminal {
  constructor(readonly value: string) {}
}

export class NonTerminal {
  constructor(readonly index: number) {}
}

export class Multiset {
  constructor(readonly tokens: Token[]) {} // TODO: investigate whether we can type this as (Terminal | NonTerminal)[]
}

export class Or {
  constructor(readonly alternatives: Token[][]) {}
}

export class Maybe {
  constructor(readonly alternatives: Token[][]) {}
}

export type Token = Terminal | NonTerminal | Multiset | Or | Maybe;
