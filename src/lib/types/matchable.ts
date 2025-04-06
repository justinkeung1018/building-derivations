export class MatchableTerminal {
  constructor(readonly value: string) {}
}

export class Name {
  constructor(
    readonly index: number,
    readonly name: string,
  ) {}
}

export class MatchableNonTerminal {
  constructor(
    readonly index: number,
    readonly name: string,
    readonly children: Matchable[],
  ) {}
}

export class MultisetElement {
  constructor(readonly tokens: Matchable[]) {}
}

export class MatchableMultiset {
  // An element is either a placeholder (Name) for a multiset (e.g. \Gamma),
  // or a string of tokens (MultisetElement) representing one element of the multiset (e.g. x:A)
  constructor(
    readonly index: number,
    readonly elements: (Name | MultisetElement)[],
  ) {}
}

export type Matchable = MatchableTerminal | Name | MatchableMultiset;
