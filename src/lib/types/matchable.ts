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
  ) {
    for (const element of elements) {
      if (element instanceof Name && element.index !== index) {
        throw new Error("Cannot match multisets belonging to different rules");
      }
    }
  }
}

export type Matchable = MatchableTerminal | Name | MatchableNonTerminal | MatchableMultiset;
