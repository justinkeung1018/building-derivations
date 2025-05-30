import React from "react";
import { SquarePen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../shadcn/Sheet";
import { SidebarMenuButton } from "../shadcn/Sidebar";
import { ConfigFileInput } from "../inputs/ConfigFileInput";
import { Button } from "../shadcn/Button";
import { InferenceRulesEditor } from "./InferenceRulesEditor/InferenceRulesEditor";
import { SyntaxEditor } from "./SyntaxEditor";
import { ToggleGroup, ToggleGroupItem } from "../shadcn/ToggleGroup";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { getParsedSystem } from "@/lib/proof-systems";
import { exportRules } from "@/lib/io/rules";

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
        <SidebarMenuButton tooltip="Edit syntax and inference rules" data-cy="edit-rules-button">
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
                exportRules(syntax, inferenceRules);
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
