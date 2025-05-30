import React from "react";
import { latexify } from "@/lib/latexify";
import { InferenceRule } from "@/lib/types/rules";
import { MathJax } from "better-react-mathjax";
import { PremisesEditor } from "./PremisesEditor";
import { ConclusionEditor } from "./ConclusionEditor";

export interface DefinitionEditorProps {
  editing: boolean;
  rule: InferenceRule;
  index: number;
  setLocalRule: React.Dispatch<React.SetStateAction<InferenceRule>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function DefinitionEditor(props: DefinitionEditorProps) {
  const { editing, rule } = props;

  if (!editing) {
    const premisesLaTeX = rule.premises.map((premise) => latexify(premise.sanitised)).join(" \\quad ");
    const conclusionLaTeX = latexify(rule.conclusion.sanitised);
    return <MathJax inline dynamic>{`\\[\\frac{${premisesLaTeX}}{${conclusionLaTeX}}\\]`}</MathJax>;
  }

  return (
    <div className="space-y-2">
      <PremisesEditor {...props} />
      <hr className="h-px border-black text-black bg-black" />
      <ConclusionEditor {...props} />
    </div>
  );
}
