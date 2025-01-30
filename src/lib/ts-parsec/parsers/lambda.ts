import { alt, apply, rule, seq, tok, Token } from "typescript-parsec";
import { TokenKind } from "../tokens";

class Variable {
  constructor(readonly name: string) {}
}

class Abstraction {
  constructor(
    readonly variable: Variable,
    readonly body: Term,
  ) {}
}

class Application {
  constructor(
    readonly left: Term,
    readonly right: Term,
  ) {}
}

type Term = Variable | Abstraction | Application;

const VARIABLE = rule<TokenKind, Variable>();
const ABSTRACTION = rule<TokenKind, Abstraction>();
const APPLICATION = rule<TokenKind, Application>();
const TERM = rule<TokenKind, Term>();

function applyVariable(name: Token<TokenKind.Variable>) {
  return new Variable(name.text);
}

function applyAbstraction(
  value: [
    Token<TokenKind.LParen>,
    Token<TokenKind.Slash>,
    Variable,
    Token<TokenKind.Dot>,
    Term,
    Token<TokenKind.RParen>,
  ],
): Abstraction {
  const variable = value[2];
  const term = value[4];
  return new Abstraction(variable, term);
}

function applyApplication(value: [Token<TokenKind.LParen>, Term, Term, Token<TokenKind.RParen>]): Application {
  return new Application(value[1], value[2]);
}

// Variable = x
VARIABLE.setPattern(apply(tok(TokenKind.Variable), applyVariable));

// Abstraction = (\x. Term)
ABSTRACTION.setPattern(
  apply(
    seq(tok(TokenKind.LParen), tok(TokenKind.Slash), VARIABLE, tok(TokenKind.Dot), TERM, tok(TokenKind.RParen)),
    applyAbstraction,
  ),
);

// Application = (Term Term)
APPLICATION.setPattern(apply(seq(tok(TokenKind.LParen), TERM, TERM, tok(TokenKind.RParen)), applyApplication));

// Term = Variable | Abstraction | Application
TERM.setPattern(alt(VARIABLE, ABSTRACTION, APPLICATION));

export { Variable, Abstraction, Application, VARIABLE, TERM };
export type { Term };
