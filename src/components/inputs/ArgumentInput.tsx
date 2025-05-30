import React, { useEffect, useState } from "react";
import { Button } from "../shadcn/Button";
import { Plus } from "lucide-react";
import { RuleNameInput } from "./RuleNameInput";
import { ArgumentInputState, getDefaultState } from "@/lib/types/argumentinput";
import { ConclusionInput } from "./ConclusionInput";
import { MessageMap } from "@/lib/types/messagemap";

interface ArgumentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  valid: boolean;
  states: Record<number, ArgumentInputState>;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export function ArgumentInput(props: ArgumentInputProps) {
  const { states, ...childProps } = props;
  const { index, valid, setStates } = childProps;
  const [localState, setLocalState] = useState(states[index]);

  // Update local states when importing a derivation
  useEffect(() => {
    setLocalState(states[index]);
  }, [states[index]]);

  const showPremises =
    localState.conclusionInputState.edited &&
    (localState.conclusionInputState.value.length > 0 || localState.premiseIndices.length > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full grid grid-cols-[1fr_min-content] place-items-center gap-x-2">
        {showPremises && (
          <div className="flex space-x-4 items-end justify-center -mb-2">
            {localState.premiseIndices.map((index) => (
              <ArgumentInput {...props} index={index} />
            ))}
            {!valid && (
              <Button
                variant="secondary"
                onClick={() => {
                  setStates((old) => {
                    // Generate new state for the premise subtree and update current state
                    const premiseIndex = Object.keys(states).length;
                    const newState: ArgumentInputState = {
                      ...localState,
                      premiseIndices: [...localState.premiseIndices, premiseIndex],
                    };
                    setLocalState(newState);
                    return { ...old, [index]: newState, [premiseIndex]: getDefaultState(premiseIndex, index) };
                  });
                }}
                data-cy={`tree-add-premise-button-${index}`}
              >
                <Plus />
              </Button>
            )}
          </div>
        )}
        <hr className="col-start-1 w-full h-px border-black text-black bg-black" />
        <RuleNameInput {...childProps} state={localState} setLocalState={setLocalState} />
        <ConclusionInput {...childProps} state={localState} setLocalState={setLocalState} className="-mt-2" />
      </div>
    </div>
  );
}
