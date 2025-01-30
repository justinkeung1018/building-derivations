import { alt, apply, rule, seq, tok, Token } from "typescript-parsec";
import { TokenKind } from "../tokens";

class TypeVar {
  constructor(readonly index: number) {}
}

class Arrow {
  constructor(
    readonly left: Type,
    readonly right: Type,
  ) {}
}

type Type = TypeVar | Arrow;

const TYPEVAR = rule<TokenKind, TypeVar>();
const ARROW = rule<TokenKind, Arrow>();
const TYPE = rule<TokenKind, Type>();

function applyTypeVar(value: Token<TokenKind.Number>): TypeVar {
  return new TypeVar(+value.text);
}

function applyArrow(
  value: [Token<TokenKind.LParen>, Type, Token<TokenKind.Arrow>, Type, Token<TokenKind.RParen>],
): Arrow {
  const left = value[1];
  const right = value[3];
  return new Arrow(left, right);
}

// TypeVar = number
TYPEVAR.setPattern(apply(tok(TokenKind.Number), applyTypeVar));

// Arrow = (Type -> Type)
ARROW.setPattern(
  apply(seq(tok(TokenKind.LParen), TYPE, tok(TokenKind.Arrow), TYPE, tok(TokenKind.RParen)), applyArrow),
);

// Type = TypeVar | Arrow
TYPE.setPattern(alt(TYPEVAR, ARROW));

export { TypeVar, Arrow, TYPE };
export type { Type };
