class TerminalAST {
  constructor(readonly value: string) {}
}

class NonTerminalAST {
  constructor(
    readonly value: string,
    readonly children: AST[],
  ) {}
}

type AST = TerminalAST | NonTerminalAST;

export { TerminalAST, NonTerminalAST };
export type { AST };
