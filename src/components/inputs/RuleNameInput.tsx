import React, { memo } from "react";
import { latexify } from "@/lib/latexify";
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
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export const RuleNameInput = memo(function RuleNameInput({
  index,
  state,
  setStates,
  className,
  ruleErrors,
}: RuleNameInputProps) {
  const showInput = state.ruleNameInputState.isEditing || state.ruleNameInputState.value.length == 0;

  if (showInput) {
    return (
      <FocusingInput
        placeholder={index === 0 ? "Rule" : ""}
        className={cn("w-20", className)}
        value={state.ruleNameInputState.value}
        edited={state.ruleNameInputState.edited}
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
    <div className={cn("flex items-center h-9", className)}>
      <div className="flex items-start gap-x-1">
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
});
