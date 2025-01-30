import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { MathJax } from "better-react-mathjax";
import { lex } from "@/lib/ts-parsec/lexer";
import { latexify } from "@/lib/ts-parsec/latexify";
import { Argument, parseArgument } from "@/lib/ts-parsec/parsers/argument";
import { Button } from "./shadcn/Button";
import { Plus } from "lucide-react";

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

interface ArgumentInputState {
  index: number;
  autofocus: boolean;
  isEditing: boolean;
  edited: boolean; // Focus input when we try to edit from the second time onwards
  value: string;
  latex: string;
  conclusion: Argument | null;
  conclusionIndex: number | null;
  premiseIndices: number[];
}

function getDefaultState(index: number, conclusionIndex: number | null): ArgumentInputState {
  return {
    index,
    autofocus: index !== 0, // Autofocus for newly generated inputs
    isEditing: true,
    edited: false,
    value: "",
    latex: "",
    conclusion: null,
    conclusionIndex,
    premiseIndices: [],
  };
}

interface ArgumentInputProps {
  index: number;
  valid: boolean;
  states: Record<number, ArgumentInputState>;
  setStates: (states: Record<number, ArgumentInputState>) => void;
}

function ArgumentInput({ index, valid, states, setStates }: ArgumentInputProps) {
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

    // If input nonempty, try to parse it
    let conclusion = null;
    try {
      const arg = parseArgument(value);
      conclusion = arg;
    } catch {
      // TODO: display input error
    }

    const newState = {
      ...states[index],
      edited: true,
      isEditing: false,
      latex: `\\(${latexify(lex(value))}\\)`,
      conclusion,
    };
    setStates({ ...states, [index]: newState });
  };

  return (
    <div className="flex flex-col items-center">
      {states[index].edited && (states[index].value.length > 0 || states[index].premiseIndices.length > 0) && (
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
          <hr className="my-2 h-px border-black text-black bg-black" />
        </div>
      )}
      {states[index].isEditing || states[index].value.length == 0 ? (
        <FocusingInput
          value={states[index].value}
          edited={states[index].edited}
          autoFocus={states[index].autofocus}
          onBlur={onBlur}
          onFocus={() => {
            setStates({ ...states, [index]: { ...states[index], isEditing: true } });
          }}
          onChange={(e) => {
            setStates({ ...states, [index]: { ...states[index], value: e.target.value } });
          }}
        />
      ) : (
        <div className="px-4">
          <MathJax
            onClick={() => {
              setStates({ ...states, [index]: { ...states[index], edited: true, isEditing: true } });
            }}
          >
            {states[index].latex}
          </MathJax>
        </div>
      )}
    </div>
  );
}

export { getDefaultState, ArgumentInput };
export type { ArgumentInputState };
