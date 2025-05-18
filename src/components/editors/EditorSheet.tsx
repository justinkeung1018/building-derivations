import React from "react";
import { SquarePen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../shadcn/Sheet";
import { SidebarMenuButton } from "../shadcn/SideBar";
import { JSONSyntaxRule, JSONInferenceRule, JSONFormat } from "@/lib/types/jsonrules";
import { ConfigFileInput } from "../inputs/ConfigFileInput";
import { Button } from "../shadcn/Button";
import { InferenceRulesEditor } from "./InferenceRulesEditor";
import { SyntaxEditor } from "./SyntaxEditor";
import { ToggleGroup, ToggleGroupItem } from "../shadcn/ToggleGroup";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { getParsedSystem } from "@/lib/proof-systems";

interface EditorSheetProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function EditorSheet({ syntax, inferenceRules, setSyntax, setInferenceRules }: EditorSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <SidebarMenuButton>
          <SquarePen />
          <span>Edit syntax and inference rules</span>
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-auto">
        <SheetHeader>
          <SheetTitle>Edit syntax and inference rules</SheetTitle>
        </SheetHeader>
        <h1 className="font-medium mt-4 mb-2">Select a predefined system:</h1>
        <div className="flex items-center mb-4 gap-x-2">
          <ToggleGroup
            type="single"
            variant="outline"
            className="justify-start"
            onValueChange={(value) => {
              const { syntax, inferenceRules } = getParsedSystem(value);
              setSyntax(syntax);
              setInferenceRules(inferenceRules);
            }}
          >
            <ToggleGroupItem value="natural-deduction" data-cy="predefined-natural-deduction">
              Natural deduction
            </ToggleGroupItem>
            <ToggleGroupItem value="lambda" data-cy="predefined-lambda">
              Lambda calculus
            </ToggleGroupItem>
            <ToggleGroupItem value="sequent" data-cy="predefined-sequent">
              Sequent calculus
            </ToggleGroupItem>
          </ToggleGroup>
          <div>or load a configuration:</div>
          <ConfigFileInput setSyntax={setSyntax} setInferenceRules={setInferenceRules} />
        </div>
        <h1>or define your own:</h1>
        <div>
          <div className="flex items-start mt-4 space-x-6" data-cy="editor">
            <SyntaxEditor syntax={syntax} setSyntax={setSyntax} />
            <InferenceRulesEditor
              syntax={syntax}
              inferenceRules={inferenceRules}
              setInferenceRules={setInferenceRules}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                const jsonSyntax: JSONSyntaxRule[] = syntax.map(({ placeholders, definitionUnsanitised }) => ({
                  placeholders,
                  definition: definitionUnsanitised,
                }));
                const jsonInferenceRules: JSONInferenceRule[] = inferenceRules.map(
                  ({ name, premises, conclusion }) => ({
                    name,
                    premises: premises.map(({ unsanitised }) => unsanitised),
                    conclusion: conclusion.unsanitised,
                  }),
                );
                const json: JSONFormat = { syntax: jsonSyntax, inferenceRules: jsonInferenceRules };
                const blob = new Blob([JSON.stringify(json, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "rules.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Export as JSON
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
