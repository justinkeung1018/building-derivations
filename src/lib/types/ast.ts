export class TerminalAST {
  constructor(readonly value: string) {}
}

export class NonTerminalAST {
  constructor(
    readonly name: string,
    readonly children: AST[],
  ) {}
}

export class MultisetAST {
  constructor(readonly elements: AST[][]) {} // TODO: investigate whether we can type this as (TerminalAST | NonTerminalAST)[][]
}

export type AST = TerminalAST | NonTerminalAST | MultisetAST;
