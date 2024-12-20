import { apply, seq, tok, Token } from "typescript-parsec";
import { ASSIGNMENT, Assignment } from "./assignment";
import { CONTEXT, Context } from "./context";
import { TokenKind } from "../tokens";

class Argument {
  context: Context;
  assignment: Assignment;

  constructor(context: Context, assignment: Assignment) {
    this.context = context;
    this.assignment = assignment;
  }
}

function applyArgument(value: [Context, Token<TokenKind.Turnstile>, Assignment]): Argument {
  const context = value[0];
  const assignment = value[2];
  return new Argument(context, assignment);
}

// Argument = Context |- Assignment
const ARGUMENT = apply(seq(CONTEXT, tok<TokenKind.Turnstile>(TokenKind.Turnstile), ASSIGNMENT), applyArgument);

export { Argument, ARGUMENT };
