class TerminalAST {
  constructor(readonly value: string) {}
}

class NonTerminalAST {
  constructor(
    readonly name: string,
    readonly children: AST[],
  ) {}
}

class MultisetAST {
  constructor(readonly elements: NonTerminalAST[]) {}
}

type AST = TerminalAST | NonTerminalAST | MultisetAST;

export { TerminalAST, NonTerminalAST, MultisetAST };
export type { AST };
