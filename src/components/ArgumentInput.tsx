import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Plus } from "lucide-react";
import { latexify } from "@/lib/latexify";

interface FocusingInputProps extends React.ComponentProps<"input"> {
  edited: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FocusingInput({ edited, autoFocus, onBlur, ...props }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  }, []);

  return <Input ref={ref} autoFocus={autoFocus} onBlur={onBlur} {...props} />;
}

function RuleNameInput({ index, states, setStates }: ArgumentInputProps) {
  const showInput = states[index].ruleNameInputState.isEditing || states[index].ruleNameInputState.value.length == 0;

  if (showInput) {
    return (
      <FocusingInput
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
              ruleNameInputState: { ...old[index].ruleNameInputState, edited: true, isEditing: true },
            },
          }));
        }}
      >
        {states[index].ruleNameInputState.latex}
      </MathJax>
    </div>
  );
}

function ConclusionInput({ index, states, setStates }: ArgumentInputProps) {
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
        value={states[index].conclusionInputState.value}
        edited={states[index].conclusionInputState.edited}
        autoFocus={states[index].autofocus}
        onBlur={onBlur}
        onFocus={() => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              conclusionInputState: { ...states[index].conclusionInputState, isEditing: true },
            },
          }));
        }}
        onChange={(e) => {
          setStates((old) => ({
            ...old,
            [index]: {
              ...old[index],
              conclusionInputState: { ...states[index].conclusionInputState, value: e.target.value },
            },
          }));
        }}
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
              conclusionInputState: { ...old[index].conclusionInputState, edited: true, isEditing: true },
            },
          }));
        }}
      >
        {states[index].conclusionInputState.latex}
      </MathJax>
    </div>
  );
}

interface InputState {
  isEditing: boolean;
  edited: boolean; // Focus input when we try to edit from the second time onwards
  value: string;
  latex: string;
}

interface ArgumentInputState {
  index: number;
  autofocus: boolean;
  conclusionInputState: InputState;
  ruleNameInputState: InputState;
  conclusionIndex: number | null;
  premiseIndices: number[];
}

function getDefaultState(index: number, conclusionIndex: number | null): ArgumentInputState {
  return {
    index,
    autofocus: index !== 0, // Autofocus for newly generated inputs
    conclusionInputState: {
      isEditing: true,
      edited: false,
      value: "",
      latex: "",
    },
    ruleNameInputState: {
      isEditing: false,
      edited: false,
      value: "",
      latex: "",
    },
    conclusionIndex,
    premiseIndices: [],
  };
}

interface ArgumentInputProps {
  index: number;
  valid: boolean;
  states: Record<number, ArgumentInputState>;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
}

function ArgumentInput(props: ArgumentInputProps) {
  const { index, valid, states, setStates } = props;

  const showPremises =
    states[index].conclusionInputState.edited &&
    (states[index].conclusionInputState.value.length > 0 || states[index].premiseIndices.length > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full grid grid-cols-[1fr_5em] place-items-center gap-x-2">
        {showPremises && (
          <div className="w-full">
            <div className="flex space-x-4 items-end justify-center">
              {states[index].premiseIndices.map((index) => (
                <ArgumentInput index={index} valid={valid} states={states} setStates={setStates} />
              ))}
              {!valid && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Generate new state for the premise subtree and update current state
                    const premiseIndex = Object.keys(states).length;
                    const newState = {
                      ...states[index],
                      premiseIndices: [...states[index].premiseIndices, premiseIndex],
                    };
                    setStates({ ...states, [index]: newState, [premiseIndex]: getDefaultState(premiseIndex, index) });
                    return newState;
                  }}
                >
                  <Plus />
                </Button>
              )}
            </div>
          </div>
        )}
        <hr className="col-start-1 w-full h-px border-black text-black bg-black" />
        <RuleNameInput {...props} />
        <ConclusionInput {...props} />
      </div>
    </div>
  );
}

export { getDefaultState, ArgumentInput };
export type { ArgumentInputState };
