import { apply, seq, tok, Token } from "typescript-parsec";
import { TERM, Term, VARIABLE, Variable } from "./lambda";
import { TYPE, Type } from "./type";
import { TokenKind } from "../tokens";

// For contexts
class VarAssignment {
  variable: Variable;
  type: Type;

  constructor(variable: Variable, type: Type) {
    this.variable = variable;
    this.type = type;
  }
}

class Assignment {
  term: Term;
  type: Type;

  constructor(term: Term, type: Type) {
    this.term = term;
    this.type = type;
  }
}

function applyVarAssignment(value: [Variable, Token<TokenKind.Colon>, Type]): VarAssignment {
  const variable = value[0];
  const type = value[2];
  return new VarAssignment(variable, type);
}

function applyAssignment(value: [Term, Token<TokenKind.Colon>, Type]): Assignment {
  const term = value[0];
  const type = value[2];
  return new Assignment(term, type);
}

// Not sure why I need to annotate tok with <TokenKind.Colon> here but not in rule.setPattern

// VarAssignment = Variable: Type
const VARASSIGNMENT = apply(seq(VARIABLE, tok<TokenKind.Colon>(TokenKind.Colon), TYPE), applyVarAssignment);

// Assignment = Term: Type
const ASSIGNMENT = apply(seq(TERM, tok<TokenKind.Colon>(TokenKind.Colon), TYPE), applyAssignment);

export { VarAssignment, Assignment, VARASSIGNMENT, ASSIGNMENT };
