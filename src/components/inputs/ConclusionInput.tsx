import React from "react";
import { ArgumentInputState } from "@/lib/types/argumentinput";
import { latexify } from "@/lib/latexify";
import { MathJax } from "better-react-mathjax";
import { FocusingInput } from "./FocusingInput";
import { ErrorsTooltip } from "./ErrorsTooltip";
import { cn } from "@/lib/utils";
import { MessageMap } from "@/lib/types/messagemap";

export interface ConclusionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  valid: boolean;
  state: ArgumentInputState;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
  setLocalState: React.Dispatch<React.SetStateAction<ArgumentInputState>>;
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export function ConclusionInput({
  index,
  state,
  setStates,
  setLocalState,
  className,
  inputErrors,
}: ConclusionInputProps) {
  const showInput = state.conclusionInputState.isEditing || state.conclusionInputState.value.length == 0;

  if (showInput) {
    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      setStates((old) => {
        if (!value && state.conclusionIndex !== null && state.premiseIndices.length === 0) {
          // Delete newly added input (i.e. no premises) if it is empty
          const rest: Record<number, ArgumentInputState> = {};
          for (const key in old) {
            if (+key !== index) {
              rest[key] = old[key];
            }
          }

          // Remove premise from conclusion input
          const conclusionIndex = state.conclusionIndex;
          rest[conclusionIndex].premiseIndices = rest[conclusionIndex].premiseIndices.filter((i) => i !== index);
          return rest;
        }

        const newState = {
          ...state.conclusionInputState,
          edited: true,
          isEditing: false,
          latex: `\\(${latexify(value)}\\)`,
        };

        return { ...old, [index]: { ...state, conclusionInputState: newState } };
      });
    };

    return (
      <FocusingInput
        className={className}
        placeholder={index === 0 ? "Type the conclusion you want to prove" : "Conclusion"}
        value={state.conclusionInputState.value}
        edited={state.conclusionInputState.edited}
        autoFocus={state.autofocus}
        onBlur={onBlur}
        onFocus={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...state,
              conclusionInputState: { ...state.conclusionInputState, isEditing: true },
            },
          }));
        }}
        onChange={(e) => {
          setLocalState((old) => ({
            ...old,
            conclusionInputState: { ...old.conclusionInputState, value: e.target.value },
          }));
        }}
        data-cy={`tree-conclusion-${index}`}
      />
    );
  }

  return (
    <div className={cn("px-4 flex items-start gap-x-1", className)}>
      <MathJax
        onClick={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...state,
              conclusionInputState: { ...state.conclusionInputState, isEditing: true },
            },
          }));
        }}
        data-cy={`tree-conclusion-latex-${index}`}
        inline
        dynamic
      >
        {state.conclusionInputState.latex}
      </MathJax>
      {inputErrors.get(index).length > 0 && (
        <ErrorsTooltip errors={inputErrors.get(index)} data-cy={`errors-conclusion-${index}`} />
      )}
    </div>
  );
}
