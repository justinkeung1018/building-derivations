import React, { useState } from "react";
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
import { downloadJSON } from "@/lib/io/utils";
import { useNavigate } from "@tanstack/react-router";

interface EditorSheetProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function EditorSheet({ syntax, inferenceRules, setSyntax, setInferenceRules }: EditorSheetProps) {
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <SidebarMenuButton tooltip="Edit syntax and inference rules" data-cy="edit-rules-button">
          <SquarePen />
          <span>Edit syntax and inference rules</span>
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetContent side="left" className="max-w-full overflow-auto">
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
              if (value === "natural-deduction" || value === "lambda" || value === "sequent") {
                navigate({ to: "/builder", search: { mode: "predefined", system: value } }).catch((error: unknown) => {
                  console.error(error);
                });
              }
            }}
          >
            <ToggleGroupItem
              className="text-xs lg:text-sm"
              value="natural-deduction"
              data-cy="predefined-natural-deduction"
            >
              Natural deduction
            </ToggleGroupItem>
            <ToggleGroupItem className="text-xs lg:text-sm" value="lambda" data-cy="predefined-lambda">
              Lambda calculus
            </ToggleGroupItem>
            <ToggleGroupItem className="text-xs lg:text-sm" value="sequent" data-cy="predefined-sequent">
              Sequent calculus
            </ToggleGroupItem>
          </ToggleGroup>
          <div>or load a configuration:</div>
          <ConfigFileInput
            setFileName={setFileName}
            callback={({ parsedSyntax, parsedInferenceRules }) => {
              setSyntax(parsedSyntax.rules);
              setInferenceRules(parsedInferenceRules.rules);
              const json = exportRules(parsedSyntax.rules, parsedInferenceRules.rules);
              navigate({
                to: "/builder",
                search: { mode: "json", syntax: json.syntax, inferenceRules: json.inferenceRules },
              }).catch((error: unknown) => {
                console.error(error);
              });
            }}
          />
          {fileName !== undefined && <span>{fileName} uploaded.</span>}
        </div>
        <h1>or define your own:</h1>
        <div>
          <div
            className="flex flex-col lg:flex-row items-start mt-4 space-y-6 lg:space-y-0 lg:space-x-6"
            data-cy="editor"
          >
            <SyntaxEditor syntax={syntax} inferenceRules={inferenceRules} setSyntax={setSyntax} />
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
                downloadJSON(exportRules(syntax, inferenceRules), "rules.json");
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
