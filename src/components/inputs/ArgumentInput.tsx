import React from "react";
import { Button } from "../shadcn/Button";
import { Plus } from "lucide-react";
import { RuleNameInput } from "./RuleNameInput";
import { ArgumentInputState, getDefaultState } from "@/lib/types/argumentinput";
import { ConclusionInput } from "./ConclusionInput";
import { MessageMap } from "@/lib/types/messagemap";
import { useMeasure } from "@react-hookz/web";
import { cn } from "@/lib/utils";

export interface ArgumentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  valid: boolean;
  states: Record<number, ArgumentInputState>;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export const ArgumentInput = React.forwardRef<HTMLInputElement, ArgumentInputProps>((props) => {
  const { index, valid, states, setStates } = props;
  const [latexMeasurements, latexRef] = useMeasure<HTMLDivElement>();

  const showPremises =
    states[index].conclusionInputState.edited &&
    (states[index].conclusionInputState.value.length > 0 || states[index].premiseIndices.length > 0);

  return (
    <div
      className={cn("flex flex-col items-center", latexRef.current === null ? "mr-24" : "")}
      style={latexRef.current !== null && latexMeasurements ? { marginRight: latexMeasurements.width + 20 } : undefined}
    >
      <div className="w-full flex flex-col gap-y-2 items-center">
        {showPremises && (
          <div className="flex items-end justify-center">
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
        <div className="relative w-full">
          <hr className="w-full h-px border-black text-black bg-black" />
          <RuleNameInput
            {...props}
            className="absolute ml-2 left-full translate -translate-y-1/2"
            latexRef={latexRef}
          />
        </div>
        <ConclusionInput {...props} />
      </div>
    </div>
  );
});
