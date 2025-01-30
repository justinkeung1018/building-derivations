import isEqual from "lodash.isequal";
import { Argument } from "../parsers/argument";
import { Abstraction, Application, Variable } from "../parsers/lambda";
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

function arrowElimination(conclusion: Argument, premises: Argument[]): boolean {
  if (premises.length !== 2) {
    return false;
  }

  const term = conclusion.assignment.term;
  if (!(term instanceof Application)) {
    return false;
  }

  // For simplicity, assume left premise shows left term in application
  if (!isEqual(term.left, premises[0].assignment.term) || !isEqual(term.right, premises[1].assignment.term)) {
    return false;
  }

  const context = conclusion.context;
  if (!isEqual(context, premises[0].context) || !isEqual(context, premises[1].context)) {
    return false;
  }

  const leftType = premises[0].assignment.type;
  if (!(leftType instanceof Arrow)) {
    return false;
  }

  const rightType = premises[1].assignment.type;
  if (!isEqual(rightType, leftType.left)) {
    return false;
  }

  if (!isEqual(term.left, premises[0].assignment.term) || !isEqual(term.right, premises[1].assignment.term)) {
    return false;
  }

  return isEqual(conclusion.assignment.type, leftType.right);
}

export { action, arrowIntroduction, arrowElimination };
