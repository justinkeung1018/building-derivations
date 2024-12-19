import { Token } from "typescript-parsec";
import { buildLexer, expectEOF, expectSingleResult, rule } from "typescript-parsec";
import { alt, apply, seq, tok } from "typescript-parsec";
import { TokenKind } from "./tokens";

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

class Variable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

type Term = Variable | Abstraction | Application;

const lexer = buildLexer([
  [true, /^[a-z]/g, TokenKind.Variable],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\\/g, TokenKind.Lambda],
  [true, /^\./g, TokenKind.Dot],
  [false, /^\s+/g, TokenKind.Space],
]);

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

VARIABLE.setPattern(apply(tok(TokenKind.Variable), applyVariable));
ABSTRACTION.setPattern(
  apply(
    seq(tok(TokenKind.LParen), tok(TokenKind.Lambda), VARIABLE, tok(TokenKind.Dot), TERM, tok(TokenKind.RParen)),
    applyAbstraction,
  ),
);
APPLICATION.setPattern(apply(seq(tok(TokenKind.LParen), TERM, TERM, tok(TokenKind.RParen)), applyApplication));
TERM.setPattern(alt(VARIABLE, ABSTRACTION, APPLICATION));

function lex(term: string): Token<TokenKind>[] {
  const tokens: Token<TokenKind>[] = [];
  let token = lexer.parse(term);
  while (token) {
    tokens.push(token);
    token = token.next;
  }
  return tokens;
}

function parse(term: string): Term {
  return expectSingleResult(expectEOF(TERM.parse(lexer.parse(term))));
}

export { Variable, Application, Abstraction, parse, lex };
