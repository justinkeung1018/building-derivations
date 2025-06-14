import { z } from "zod";
import { ArgumentInputState, getDefaultState } from "../types/argumentinput";
import { JSONArgumentInputState } from "../types/io/derivation";
import { latexify } from "../latexify";

const schema: z.ZodType<Record<number, JSONArgumentInputState>> = z.record(
  z.coerce.number(), // JSON stores the numerical keys as strings so we want to accept numerical strings instead of numbers
  z.object({
    ruleName: z.string(),
    conclusion: z.string(),
    premiseIndices: z.array(z.number()),
  }),
);

export function importDerivation(text: string): Record<number, ArgumentInputState> {
  // TODO: display parsing errors
  const json = schema.parse(JSON.parse(text));

  const states: Record<number, ArgumentInputState> = {};

  for (const [index, jsonState] of Object.entries(json)) {
    const state = getDefaultState(Number(index), null);
    state.ruleNameInputState = {
      isEditing: false,
      edited: true,
      value: jsonState.ruleName,
      latex: `\\((\\mathit{${latexify(jsonState.ruleName)}})\\)`,
    };
    state.conclusionInputState = {
      isEditing: false,
      edited: true,
      value: jsonState.conclusion,
      latex: `\\(${latexify(jsonState.conclusion)}\\)`,
    };
    state.premiseIndices = jsonState.premiseIndices;
    states[Number(index)] = state;
  }

  for (const [index, state] of Object.entries(states)) {
    for (const premiseIndex of state.premiseIndices) {
      states[premiseIndex].conclusionIndex = Number(index);
    }
  }

  return states;
}

export function exportDerivation(states: Record<number, ArgumentInputState>): Record<number, JSONArgumentInputState> {
  const json: Record<number, JSONArgumentInputState> = {};

  for (const [index, state] of Object.entries(states)) {
    const ruleName = state.ruleNameInputState.value;
    const conclusion = state.conclusionInputState.value;
    const premiseIndices = state.premiseIndices;

    const jsonState: JSONArgumentInputState = { ruleName, conclusion, premiseIndices };
    json[Number(index)] = jsonState;
  }

  return json;
}
