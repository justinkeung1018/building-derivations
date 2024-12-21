import isEqual from "lodash.isequal";
import { Argument } from "../parsers/argument";
import { Variable } from "../parsers/lambda";

function action(argument: Argument): boolean {
  const left = argument.assignment.term;
  if (!(left instanceof Variable)) {
    return false;
  }
  for (const varAssignment of argument.context.varAssignments) {
    if (isEqual(left, varAssignment.variable)) {
      return isEqual(argument.assignment.type, varAssignment.type);
    }
  }
  return false;
}

export { action };
