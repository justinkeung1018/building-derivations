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

const EMPTY = apply(seq(tok(TokenKind.Slash), tok(TokenKind.Emptyset)), () => new Empty());
const VARASSIGNMENTS = apply(
  seq(VARASSIGNMENT, rep_sc(seq(tok<TokenKind.Comma>(TokenKind.Comma), VARASSIGNMENT))),
  applyVarAssignments,
);
const CONTEXT = alt(EMPTY, VARASSIGNMENTS);

export { Empty, VarAssignments, CONTEXT };
export type { Context };
