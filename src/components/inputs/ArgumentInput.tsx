import React from "react";
import { Button } from "../shadcn/Button";
import { Plus } from "lucide-react";
import { RuleNameInput } from "./RuleNameInput";
import { ArgumentInputState, getDefaultState } from "@/lib/types/argumentinput";
import { ConclusionInput } from "./ConclusionInput";
import { MessageMap } from "@/lib/types/messagemap";

export interface ArgumentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  valid: boolean;
  states: Record<number, ArgumentInputState>;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export function ArgumentInput(props: ArgumentInputProps) {
  const { index, valid, states, setStates } = props;

  const showPremises =
    states[index].conclusionInputState.edited &&
    (states[index].conclusionInputState.value.length > 0 || states[index].premiseIndices.length > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full grid grid-cols-[1fr_min-content] place-items-center gap-x-2">
        {showPremises && (
          <div className="flex space-x-4 items-end justify-center -mb-2">
            {states[index].premiseIndices.map((index) => (
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
                      ...old[index],
                      premiseIndices: [...old[index].premiseIndices, premiseIndex],
                    };
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
        <RuleNameInput {...props} />
        <ConclusionInput {...props} className="-mt-2" />
      </div>
    </div>
  );
}
