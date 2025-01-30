import { apply, expectEOF, expectSingleResult, seq, tok, Token } from "typescript-parsec";
import { ASSIGNMENT, Assignment } from "./assignment";
import { CONTEXT, Context } from "./context";
import { TokenKind } from "../../ts-parsec/tokens";
import { lexer } from "../../ts-parsec/lexer";

class Argument {
  constructor(
    readonly context: Context,
    readonly assignment: Assignment,
  ) {}
}

function applyArgument(value: [Context, Token<TokenKind.Turnstile>, Assignment]): Argument {
  const context = value[0];
  const assignment = value[2];
  return new Argument(context, assignment);
}

// Argument = Context |- Assignment
const ARGUMENT = apply(seq(CONTEXT, tok<TokenKind.Turnstile>(TokenKind.Turnstile), ASSIGNMENT), applyArgument);

function parseArgument(argument: string): Argument {
  return expectSingleResult(expectEOF(ARGUMENT.parse(lexer.parse(argument))));
}

export { Argument, ARGUMENT, parseArgument };
