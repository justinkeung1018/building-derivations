import { Token } from "typescript-parsec";
import { buildLexer } from "typescript-parsec";
import { TokenKind } from "./tokens";

const lexer = buildLexer([
  [true, /^[a-z]/g, TokenKind.Variable],
  [true, /^\\emptyset/g, TokenKind.Emptyset],
  [true, /^\|-/g, TokenKind.Turnstile],
  [true, /^\d+/g, TokenKind.Number],
  [true, /^(->|\u{2192})/gu, TokenKind.Arrow],
  [true, /^:/g, TokenKind.Colon],
  [true, /^,/g, TokenKind.Comma],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\\/g, TokenKind.Slash],
  [true, /^\./g, TokenKind.Dot],
  [false, /^\s+/g, TokenKind.Space],
]);

function lex(term: string): Token<TokenKind>[] {
  const tokens: Token<TokenKind>[] = [];
  let token = lexer.parse(term);
  while (token) {
    tokens.push(token);
    token = token.next;
  }
  return tokens;
}

export { lex, lexer };
