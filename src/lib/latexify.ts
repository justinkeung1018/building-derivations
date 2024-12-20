import { Token } from "typescript-parsec";
import { TokenKind } from "./tokens";

function latexify(tokens: Token<TokenKind>[]): string {
  return tokens
    .map((token) => {
      switch (token.kind) {
        case TokenKind.Variable:
          return token.text;
        case TokenKind.Dot:
          return ".";
        case TokenKind.LParen:
          return "(";
        case TokenKind.RParen:
          return ")";
        case TokenKind.Slash:
          return "\\lambda";
        default:
          return "";
      }
    })
    .join(" ");
}

export { latexify };
