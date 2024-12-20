import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { lex } from "@/lib/lexer";
import { latexify } from "@/lib/latexify";
import { Argument, parseArgument } from "@/lib/parsers/argument";
import { Button } from "./shadcn/Button";
import { Plus } from "lucide-react";

interface FocusingInputProps extends React.ComponentProps<"input"> {
  edited: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FocusingInput({ edited, onBlur, ...props }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  }, []);

  return <Input ref={ref} onBlur={onBlur} {...props} />;
}

interface ConclusionState {
  index: number;
  setState: (state: ArgumentInputState) => void;
}

interface ArgumentInputState {
  index: number;
  isEditing: boolean;
  edited: boolean; // Focus input when we try to edit from the second time onwards
  value: string;
  latex: string;
  conclusion: Argument | null;
  conclusionState: ConclusionState | null;
  premiseIndices: number[];
}

function getDefaultState(
  index: number,
  conclusionIndex: number | null,
  setConclusionState: ((state: ArgumentInputState) => void) | null,
): ArgumentInputState {
  const conclusionState =
    conclusionIndex === null || setConclusionState === null
      ? null
      : { index: conclusionIndex, setState: setConclusionState };
  return {
    index,
    isEditing: true,
    edited: false,
    value: "",
    latex: "",
    conclusion: null,
    conclusionState,
    premiseIndices: [],
  };
}

interface ArgumentInputProps {
  index: number;
  states: Record<number, ArgumentInputState>;
  setStates: (states: Record<number, ArgumentInputState>) => void;
}

function ArgumentInput({ index, states, setStates }: ArgumentInputProps) {
  const [state, setState] = useState(states[index]);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (!value && state.conclusionState !== null && state.premiseIndices.length === 0) {
      // Delete newly added input (i.e. no premises) if it is empty
      const rest: Record<number, ArgumentInputState> = {};
      for (const key in states) {
        if (+key !== index) {
          rest[key] = states[key];
        }
      }
      const conclusionIndex = state.conclusionState.index;
      rest[conclusionIndex].premiseIndices = rest[conclusionIndex].premiseIndices.filter((i) => i !== index);
      state.conclusionState.setState(rest[conclusionIndex]);
      setStates(rest);
      return;
    }
    let conclusion = null;
    try {
      const arg = parseArgument(value);
      conclusion = arg;
    } catch {
      // TODO: display input error
    }
    setState((state) => {
      const newState = {
        ...state,
        edited: true,
        isEditing: false,
        latex: `\\(${latexify(lex(value))}\\)`,
        conclusion,
      };
      setStates({ ...states, [state.index]: newState });
      return newState;
    });
  };

  return (
    <div className="flex flex-col items-center">
      {state.edited && (state.value.length > 0 || state.premiseIndices.length > 0) && (
        <div className="w-full">
          <div className="flex space-x-4 items-end justify-center">
            {state.premiseIndices.map((index) => (
              <ArgumentInput index={index} states={states} setStates={setStates} />
            ))}
            <Button
              variant="secondary"
              onClick={() => {
                setState((state) => {
                  const premiseIndex = Object.keys(states).length;
                  setStates({ ...states, [premiseIndex]: getDefaultState(premiseIndex, state.index, setState) });
                  return { ...state, premiseIndices: [...state.premiseIndices, premiseIndex] };
                });
              }}
            >
              <Plus />
            </Button>
          </div>
          <hr className="my-2 h-px border-black text-black bg-black" />
        </div>
      )}
      {state.isEditing || state.value.length == 0 ? (
        <FocusingInput
          value={state.value}
          edited={state.edited}
          onBlur={onBlur}
          onFocus={() => {
            setState((state) => ({ ...state, isEditing: true }));
          }}
          onChange={(e) => {
            setState((state) => ({ ...state, value: e.target.value }));
          }}
        />
      ) : (
        <div className="px-4">
          <MathJax
            onClick={() => {
              setState((state) => ({ ...state, edited: true, isEditing: true }));
            }}
          >
            {state.latex}
          </MathJax>
        </div>
      )}
    </div>
  );
}

export { getDefaultState, ArgumentInput };
export type { ArgumentInputState };
