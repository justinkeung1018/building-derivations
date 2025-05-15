import React from "react";
import { latexify } from "@/lib/latexify";
import { ArgumentInputProps } from "./ArgumentInput";
import { FocusingInput } from "./FocusingInput";
import { MathJax } from "better-react-mathjax";
import { ErrorsTooltip } from "./ErrorsTooltip";

export function RuleNameInput({ index, states, setStates, ruleErrors }: ArgumentInputProps) {
  const showInput = states[index].ruleNameInputState.isEditing || states[index].ruleNameInputState.value.length == 0;

  if (showInput) {
    return (
      <FocusingInput
        placeholder={index === 0 ? "Rule" : ""}
        className="w-full"
        value={states[index].ruleNameInputState.value}
        edited={states[index].ruleNameInputState.edited}
        autoFocus={false}
        onBlur={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              ruleNameInputState: {
                ...old[index].ruleNameInputState,
                edited: true,
                isEditing: false,
                latex: `\\((\\mathit{${latexify(old[index].ruleNameInputState.value)}})\\)`,
              },
            },
          }));
        }}
        onFocus={() => {
          setStates((old) => ({
            ...old,
            [index]: { ...old[index], ruleNameInputState: { ...old[index].ruleNameInputState, isEditing: true } },
          }));
        }}
        onChange={(e) => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              ruleNameInputState: { ...old[index].ruleNameInputState, value: e.target.value },
            },
          }));
        }}
        data-cy={`tree-rule-${index}`}
      />
    );
  }

  return (
    <div className="px-4 flex items-start gap-x-1">
      <MathJax
        onClick={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              ruleNameInputState: { ...old[index].ruleNameInputState, isEditing: true },
            },
          }));
        }}
        data-cy={`tree-rule-latex-${index}`}
      >
        {states[index].ruleNameInputState.latex}
      </MathJax>
      {ruleErrors.get(index).length > 0 && <ErrorsTooltip errors={ruleErrors.get(index)} />}
    </div>
  );
}
