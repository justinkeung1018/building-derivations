import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../shadcn/Card";
import { InferenceRule } from "@/lib/types/rules";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../shadcn/Table";
import { latexify, latexifyRuleName } from "@/lib/latexify";
import { MathJax } from "better-react-mathjax";

interface InferenceRulesViewerProps {
  inferenceRules: InferenceRule[];
}

const InferenceRulesTable = memo(function InferenceRulesTable({ inferenceRules }: InferenceRulesViewerProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Name</TableHead>
          <TableHead className="w-48">Definition</TableHead>
        </TableRow>
      </TableHeader>
      {inferenceRules.map((rule, index) => {
        const premisesLaTeX = rule.premises.map((premise) => latexify(premise.sanitised)).join(" \\quad ");
        const conclusionLaTeX = latexify(rule.conclusion.sanitised);

        return (
          <TableBody className="group border-b last:border-0" key={index}>
            <TableRow className="group-hover:bg-muted/50 border-0">
              <TableCell>
                <MathJax inline dynamic>{`\\(${latexifyRuleName(rule.name)}\\)`}</MathJax>
              </TableCell>
              <TableCell>
                <MathJax inline dynamic>{`\\[\\frac{${premisesLaTeX}}{${conclusionLaTeX}}\\]`}</MathJax>
              </TableCell>
            </TableRow>
          </TableBody>
        );
      })}
    </Table>
  );
});

export const InferenceRulesViewer = memo(function InferenceRulesViewer({ inferenceRules }: InferenceRulesViewerProps) {
  return (
    <Card className="h-fit max-h-1/2 overflow-y-auto">
      <CardHeader>
        <CardTitle>Inference rules</CardTitle>
      </CardHeader>
      <CardContent>
        <InferenceRulesTable inferenceRules={inferenceRules} />
      </CardContent>
    </Card>
  );
});
