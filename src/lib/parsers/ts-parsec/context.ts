import { alt, apply, rep_sc, seq, tok, Token } from "typescript-parsec";
import { VARASSIGNMENT, VarAssignment } from "./assignment";
import { TokenKind } from "../../ts-parsec/tokens";

class Context {
  readonly varAssignments: Set<VarAssignment>;

  constructor(varAssignments?: Iterable<VarAssignment>) {
    this.varAssignments = new Set(varAssignments);
  }
}

function applyContext(value: [VarAssignment, [Token<TokenKind.Comma>, VarAssignment][]]): Context {
  const first = value[0];
  const rest = value[1];
  return new Context(new Set([first, ...rest.map((pair) => pair[1])]));
}

// Empty = \emptyset
const EMPTY = apply(tok(TokenKind.Emptyset), () => new Context());

// VarAssignments = VarAssignment {, VarAssignment}
const VARASSIGNMENTS = apply(
  seq(VARASSIGNMENT, rep_sc(seq(tok<TokenKind.Comma>(TokenKind.Comma), VARASSIGNMENT))),
  applyContext,
);

// Context = Empty | VarAssignments
const CONTEXT = alt(EMPTY, VARASSIGNMENTS);

export { Context, CONTEXT };
