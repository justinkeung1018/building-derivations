import React from "react";
import { Input } from "@/components/shadcn/Input";
import { InferenceRuleStatement } from "@/lib/types/rules";
import { DefinitionEditorProps } from "./DefinitionEditor";

export function ConclusionEditor({ rule, index, setLocalRule, setInferenceRules }: DefinitionEditorProps) {
  return (
    <div className="flex justify-center">
      <Input
        key={`${index.toString()}-conclusion`}
        className="w-96"
        maxLength={200}
        value={rule.conclusion.unsanitised}
        onChange={(e) => {
          setLocalRule((old) => {
            const newConclusion: InferenceRuleStatement = { ...old.conclusion, unsanitised: e.target.value };
            return {
              ...old,
              conclusion: newConclusion,
            };
          });
        }}
        onBlur={() => {
          setInferenceRules((old) => old.map((r, i) => (i === index ? rule : r)));
        }}
        data-cy={`conclusion-${index}`}
      />
    </div>
  );
}
