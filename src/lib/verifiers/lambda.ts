import isEqual from "lodash.isequal";
import { Argument } from "../parsers/argument";
import { Abstraction, Variable } from "../parsers/lambda";
import { Arrow } from "../parsers/type";

function action(conclusion: Argument, premises: Argument[]): boolean {
  if (premises.length !== 0) {
    return false;
  }

  const term = conclusion.assignment.term;
  if (!(term instanceof Variable)) {
    return false;
  }

  for (const varAssignment of conclusion.context.varAssignments) {
    if (isEqual(term, varAssignment.variable)) {
      return isEqual(conclusion.assignment.type, varAssignment.type);
    }
  }
  return false;
}

function arrowIntroduction(conclusion: Argument, premises: Argument[]): boolean {
  if (premises.length !== 1) {
    return false;
  }

  const premise = premises[0];

  const term = conclusion.assignment.term;
  if (!(term instanceof Abstraction)) {
    return false;
  }

  const arrowType = conclusion.assignment.type;
  if (!(arrowType instanceof Arrow)) {
    return false;
  }

  for (const varAssignment of conclusion.context.varAssignments) {
    if (isEqual(term.variable, varAssignment.variable)) {
      // Bound variable cannot appear free in context by Barendregt's convention
      return false;
    }
  }

  if (!isEqual(term.body, premise.assignment.term) || !isEqual(arrowType.right, premise.assignment.type)) {
    return false;
  }

  for (const varAssignment of premise.context.varAssignments) {
    if (isEqual(term.variable, varAssignment.variable)) {
      return isEqual(arrowType.left, varAssignment.type);
    }
  }

  // Bound variable not in premise context
  return false;
}

export { action, arrowIntroduction };
