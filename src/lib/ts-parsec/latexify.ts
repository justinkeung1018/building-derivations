import { Token } from "typescript-parsec";
import { TokenKind } from "./tokens";

function latexify(tokens: Token<TokenKind>[]): string {
  return tokens
    .map((token) => {
      switch (token.kind) {
        case TokenKind.Variable:
        case TokenKind.Number:
          return token.text;
        case TokenKind.Dot:
          return ".";
        case TokenKind.LParen:
          return "(";
        case TokenKind.RParen:
          return ")";
        case TokenKind.Slash:
          return "\\lambda";
        case TokenKind.Arrow:
          return "\\rightarrow";
        case TokenKind.Colon:
          return ":";
        case TokenKind.Comma:
          return ",";
        case TokenKind.Turnstile:
          return "\\vdash";
        case TokenKind.Emptyset:
          return "\\varnothing";
        default:
          return "";
      }
    })
    .join(" ");
}

export { latexify };
