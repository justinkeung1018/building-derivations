import React from "react";
import { Button } from "@/components/shadcn/Button";
import { Input } from "@/components/shadcn/Input";
import { InferenceRuleStatement } from "@/lib/types/rules";
import { Plus } from "lucide-react";
import { DefinitionEditorProps } from "./DefinitionEditor";
import { DeleteIcon } from "../DeleteIcon";
import { v4 as uuidv4 } from "uuid";

export function PremisesEditor({ rule, index, setLocalRule, setInferenceRules }: DefinitionEditorProps) {
  if (rule.premises.length === 0) {
    return (
      <div key={`${rule.id}-add-premise-button-container`} className="flex justify-center">
        <Button
          key={`${rule.id}-add-premise-button`}
          variant="outline"
          onClick={() => {
            setLocalRule((old) => {
              const newPremise = {
                structure: [],
                sanitised: "",
                unsanitised: "",
                id: uuidv4(),
              };
              return { ...old, premises: [newPremise] };
            });
          }}
          data-cy={`add-premise-button-${index}`}
        >
          Add premise
        </Button>
      </div>
    );
  }

  return (
    <div key={`${rule.id}-premises-container`} className="flex justify-center space-x-4">
      {rule.premises.map((premise, premiseIndex) => (
        <div key={`${premise.id}-input-container`} className="relative">
          <Input
            key={`${premise.id}-input`}
            className="w-48 pr-8"
            maxLength={200}
            value={premise.unsanitised}
            onChange={(e) => {
              setLocalRule((old) => {
                const newPremise: InferenceRuleStatement = {
                  ...old.premises[premiseIndex],
                  unsanitised: e.target.value,
                };
                return {
                  ...old,
                  premises: rule.premises.map((p, i) => (i === premiseIndex ? newPremise : p)),
                };
              });
            }}
            onBlur={() => {
              setInferenceRules((old) => old.map((r, i) => (i === index ? rule : r)));
            }}
            data-cy={`premise-${index}-${premiseIndex}`}
          />
          <div key={`${premise.id}-delete-container`} className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <DeleteIcon
              key={`${premise.id}-delete`}
              onClick={() => {
                setLocalRule((old) => ({
                  ...old,
                  premises: rule.premises.filter((_, i) => i !== premiseIndex),
                }));
              }}
            />
          </div>
        </div>
      ))}
      <Button
        key={`${rule.id}-add-premise-button-multiple`}
        variant="secondary"
        onClick={() => {
          setLocalRule((old) => {
            const newPremise: InferenceRuleStatement = {
              structure: [],
              sanitised: "",
              unsanitised: "",
              id: uuidv4(),
            };
            return {
              ...old,
              premises: [...rule.premises, newPremise],
            };
          });
        }}
        data-cy={`add-premise-button-${index}`}
      >
        <Plus />
      </Button>
    </div>
  );
}
