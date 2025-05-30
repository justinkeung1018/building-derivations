import React from "react";
import { Input } from "@/components/shadcn/Input";
import { latexify } from "@/lib/latexify";
import { MathJax } from "better-react-mathjax";
import { DefinitionEditorProps } from "./DefinitionEditor";

export function RuleNameEditor({ editing, index, rule, setLocalRule, setInferenceRules }: DefinitionEditorProps) {
  if (editing) {
    return (
      <Input
        key={`${rule.name}-rule-name-input`}
        className="w-24"
        maxLength={50}
        value={rule.name}
        onChange={(e) => {
          setLocalRule((old) => ({ ...old, name: e.target.value }));
        }}
        onBlur={() => {
          setInferenceRules((old) => old.map((r, i) => (i === index ? rule : r)));
        }}
        data-cy={`inference-name-${index}`}
      />
    );
  }

  return (
    <MathJax inline dynamic key={`${rule.name}-rule-name-latex`}>{`\\((\\mathit{${latexify(rule.name)}})\\)`}</MathJax>
  );
}
