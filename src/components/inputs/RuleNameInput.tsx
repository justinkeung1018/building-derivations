import React from "react";
import { latexify } from "@/lib/latexify";
import { ArgumentInputProps } from "./ArgumentInput";
import { FocusingInput } from "./FocusingInput";
import { MathJax } from "better-react-mathjax";
import { ErrorsTooltip } from "./ErrorsTooltip";
import { cn } from "@/lib/utils";

interface RuleNameInputProps extends ArgumentInputProps {
  latexRef: React.RefObject<HTMLDivElement | null>;
}

export function RuleNameInput({ index, states, setStates, ruleErrors, className, latexRef }: RuleNameInputProps) {
  const showInput = states[index].ruleNameInputState.isEditing || states[index].ruleNameInputState.value.length == 0;

  if (showInput) {
    return (
      <FocusingInput
        placeholder={index === 0 ? "Rule" : ""}
        className={cn("w-20", className)}
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
    <div className={cn("flex items-start gap-x-1 justify-self-start", className)} ref={latexRef}>
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
