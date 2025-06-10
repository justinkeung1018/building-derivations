import React from "react";
import { latexifyRuleName } from "@/lib/latexify";
import { FocusingInput } from "./FocusingInput";
import { MathJax } from "better-react-mathjax";
import { ErrorsTooltip } from "./ErrorsTooltip";
import { cn } from "@/lib/utils";
import { ArgumentInputState } from "@/lib/types/argumentinput";
import { MessageMap } from "@/lib/types/messagemap";

export interface RuleNameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  valid: boolean;
  state: ArgumentInputState;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
  setLocalState: React.Dispatch<React.SetStateAction<ArgumentInputState>>;
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export function RuleNameInput({ index, state, setStates, setLocalState, className, ruleErrors }: RuleNameInputProps) {
  const showInput = state.ruleNameInputState.isEditing || state.ruleNameInputState.value.length == 0;

  if (showInput) {
    return (
      <FocusingInput
        placeholder="Rule"
        className={cn("w-20", className)}
        value={state.ruleNameInputState.value}
        edited={state.ruleNameInputState.edited}
        autoFocus={false}
        onBlur={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...state,
              ruleNameInputState: {
                ...state.ruleNameInputState,
                edited: true,
                isEditing: false,
                latex: `\\(${latexifyRuleName(state.ruleNameInputState.value)}\\)`,
              },
            },
          }));
        }}
        onFocus={() => {
          setStates((old) => ({
            ...old,
            [index]: { ...state, ruleNameInputState: { ...state.ruleNameInputState, isEditing: true } },
          }));
        }}
        onChange={(e) => {
          setLocalState((old) => ({
            ...old,
            ruleNameInputState: { ...old.ruleNameInputState, value: e.target.value },
          }));
        }}
        data-cy={`tree-rule-${index}`}
      />
    );
  }

  return (
    <div className={cn("flex items-center h-9", className)}>
      <div className="flex items-start gap-x-1">
        <MathJax
          onClick={() => {
            setStates((old) => ({
              ...old,
              [index]: {
                ...state,
                ruleNameInputState: { ...state.ruleNameInputState, isEditing: true },
              },
            }));
          }}
          data-cy={`tree-rule-latex-${index}`}
          inline
          dynamic
        >
          {state.ruleNameInputState.latex}
        </MathJax>
        {ruleErrors.get(index).length > 0 && (
          <ErrorsTooltip errors={ruleErrors.get(index)} data-cy={`errors-rule-${index}`} />
        )}
      </div>
    </div>
  );
}
