import React from "react";
import { latexify } from "@/lib/latexify";
import { InferenceRule } from "@/lib/types/rules";
import { MathJax } from "better-react-mathjax";

interface DefinitionPreviewProps {
  rule: InferenceRule;
}

export function DefinitionPreview({ rule }: DefinitionPreviewProps) {
  const premisesLaTeX = rule.premises.map((premise) => latexify(premise.unsanitised)).join(" \\quad ");
  const conclusionLaTeX = latexify(rule.conclusion.unsanitised);
  return <MathJax inline dynamic>{`\\[\\frac{${premisesLaTeX}}{${conclusionLaTeX}}\\]`}</MathJax>;
}
