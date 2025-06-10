import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../shadcn/Card";
import { MathJax } from "better-react-mathjax";

export function SyntaxGuideViewer() {
  return (
    <Card className="h-fit max-h-1/2 overflow-y-auto min-w-60">
      <CardHeader>
        <CardTitle>Syntax guide</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-outside ml-4 text-sm space-y-2">
          <li>
            |- and \vdash both represent <MathJax inline>{"\\(\\vdash\\)"}</MathJax>.
          </li>
          <li>
            {"->"}, \rightarrow, \to, and {"\\to{}"} all represent <MathJax inline>{"\\(\\to\\)"}</MathJax>.
          </li>
          <li>
            Everything else is done in <MathJax inline>{"\\(\\LaTeX\\)"}</MathJax>.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
