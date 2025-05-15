import { ArgumentInputState } from "@/lib/types/argumentinput";
import { ArgumentInputProps } from "./ArgumentInput";
import { latexify } from "@/lib/latexify";
import { MathJax } from "better-react-mathjax";
import { FocusingInput } from "./FocusingInput";

export function ConclusionInput({ index, states, setStates }: ArgumentInputProps) {
  const showInput =
    states[index].conclusionInputState.isEditing || states[index].conclusionInputState.value.length == 0;

  if (showInput) {
    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (!value && states[index].conclusionIndex !== null && states[index].premiseIndices.length === 0) {
        // Delete newly added input (i.e. no premises) if it is empty
        const rest: Record<number, ArgumentInputState> = {};
        for (const key in states) {
          if (+key !== index) {
            rest[key] = states[key];
          }
        }

        // Remove premise from conclusion input
        const conclusionIndex = states[index].conclusionIndex;
        rest[conclusionIndex].premiseIndices = rest[conclusionIndex].premiseIndices.filter((i) => i !== index);
        setStates(rest);
        return;
      }

      const newState = {
        ...states[index].conclusionInputState,
        edited: true,
        isEditing: false,
        latex: `\\(${latexify(value)}\\)`,
      };

      setStates((old) => ({ ...old, [index]: { ...old[index], conclusionInputState: newState } }));
    };

    return (
      <FocusingInput
        placeholder={index === 0 ? "Type the conclusion you want to prove" : ""}
        value={states[index].conclusionInputState.value}
        edited={states[index].conclusionInputState.edited}
        autoFocus={states[index].autofocus}
        onBlur={onBlur}
        onFocus={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              conclusionInputState: { ...old[index].conclusionInputState, isEditing: true },
            },
          }));
        }}
        onChange={(e) => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              conclusionInputState: { ...old[index].conclusionInputState, value: e.target.value },
            },
          }));
        }}
        data-cy={`tree-conclusion-${index}`}
      />
    );
  }

  return (
    <div className="px-4">
      <MathJax
        onClick={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              conclusionInputState: { ...old[index].conclusionInputState, isEditing: true },
            },
          }));
        }}
        data-cy={`tree-conclusion-latex-${index}`}
      >
        {states[index].conclusionInputState.latex}
      </MathJax>
    </div>
  );
}
