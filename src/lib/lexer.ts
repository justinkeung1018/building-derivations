import { Token } from "typescript-parsec";
import { buildLexer } from "typescript-parsec";
import { TokenKind } from "./tokens";

const lexer = buildLexer([
  [true, /^[a-z]/g, TokenKind.Variable],
  [true, /^\d+/g, TokenKind.Number],
  [true, /^->/g, TokenKind.Arrow],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\\/g, TokenKind.Lambda],
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
