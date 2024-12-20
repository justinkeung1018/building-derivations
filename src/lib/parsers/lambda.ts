import { alt, apply, rule, seq, tok, Token } from "typescript-parsec";
import { TokenKind } from "../tokens";

class Variable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Abstraction {
  variable: Variable;
  body: Term;

  constructor(variable: Variable, body: Term) {
    this.variable = variable;
    this.body = body;
  }
}

class Application {
  left: Term;
  right: Term;

  constructor(left: Term, right: Term) {
    this.left = left;
    this.right = right;
  }
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
    Token<TokenKind.Lambda>,
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
    seq(tok(TokenKind.LParen), tok(TokenKind.Lambda), VARIABLE, tok(TokenKind.Dot), TERM, tok(TokenKind.RParen)),
    applyAbstraction,
  ),
);

// Application = (Term Term)
APPLICATION.setPattern(apply(seq(tok(TokenKind.LParen), TERM, TERM, tok(TokenKind.RParen)), applyApplication));

// Term = Variable | Abstraction | Application
TERM.setPattern(alt(VARIABLE, ABSTRACTION, APPLICATION));

export { Variable, Abstraction, Application, VARIABLE, TERM };
export type { Term };
