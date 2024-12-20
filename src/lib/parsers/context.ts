import { alt, apply, rep_sc, seq, tok, Token } from "typescript-parsec";
import { VARASSIGNMENT, VarAssignment } from "./assignment";
import { TokenKind } from "../tokens";

class Empty {}

class VarAssignments {
  varAssignments: VarAssignment[];

  constructor(varAssignments: VarAssignment[]) {
    this.varAssignments = varAssignments;
  }
}

type Context = Empty | VarAssignments;

function applyVarAssignments(value: [VarAssignment, [Token<TokenKind.Comma>, VarAssignment][]]): VarAssignments {
  const first = value[0];
  const rest = value[1];
  return new VarAssignments([first, ...rest.map((pair) => pair[1])]);
}

// Empty = \emptyset
const EMPTY = apply(tok(TokenKind.Emptyset), () => new Empty());

// VarAssignments = VarAssignment {, VarAssignment}
const VARASSIGNMENTS = apply(
  seq(VARASSIGNMENT, rep_sc(seq(tok<TokenKind.Comma>(TokenKind.Comma), VARASSIGNMENT))),
  applyVarAssignments,
);

// Context = Empty | VarAssignments
const CONTEXT = alt(EMPTY, VARASSIGNMENTS);

export { Empty, VarAssignments, CONTEXT };
export type { Context };
