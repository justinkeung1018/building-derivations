import React from "react";
import { SyntaxRule, InferenceRule } from "@/lib/types/rules";
import { InferenceRulesTable, InferenceRulesViewer } from "./InferenceRulesViewer";
import { SyntaxTable, SyntaxViewer } from "./SyntaxViewer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../shadcn/Resizable";
import { Card, CardContent, CardHeader, CardTitle } from "../shadcn/Card";

interface RuleViewerProps {
  showSyntax: boolean;
  showInferenceRules: boolean;
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
}

export function RuleViewer({ showSyntax, showInferenceRules, syntax, inferenceRules }: RuleViewerProps) {
  if (showSyntax && showInferenceRules) {
    return (
      <div className="ml-2 py-2 max-h-screen">
        <Card>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={20}>
              <div className="max-h-full overflow-y-auto">
                <CardHeader>
                  <CardTitle>Syntax rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <SyntaxTable syntax={syntax} />
                </CardContent>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} maxSize={80}>
              <div className="max-h-full overflow-y-auto">
                <CardHeader>
                  <CardTitle>Inference rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <InferenceRulesTable inferenceRules={inferenceRules} />
                </CardContent>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Card>
      </div>
    );
  }

  if (showSyntax) {
    return (
      <div className="ml-2 py-2 flex flex-col gap-y-2 max-h-screen items-stretch">
        <SyntaxViewer syntax={syntax} />
      </div>
    );
  }

  return (
    <div className="ml-2 py-2 flex flex-col gap-y-2 max-h-screen items-stretch">
      <InferenceRulesViewer inferenceRules={inferenceRules} />
    </div>
  );
}
