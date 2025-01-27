import React, { useEffect, useState } from "react";
import { ArgumentInput, ArgumentInputState, getDefaultState } from "./components/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { action, arrowElimination, arrowIntroduction } from "./lib/verifiers/lambda";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/shadcn/Sheet";
import { Button } from "./components/shadcn/Button";
import { InferenceRule, SyntaxRule } from "./lib/types/types";
import { SyntaxEditor } from "./components/SyntaxEditor";
import { InferenceRulesEditor } from "./components/InferenceRulesEditor";

export function App() {
  const [valid, setValid] = useState(false);
  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0, null) });
  const [syntax, setSyntax] = useState<SyntaxRule[]>([
    {
      placeholders: [],
      definition: [],
      definitionSanitised: [],
      placeholdersUnsanitised: "",
      definitionUnsanitised: "",
    },
  ]);
  const [inferenceRules, setInferenceRules] = useState<InferenceRule[]>([]);

  function verify(index: number): boolean {
    const conclusion = states[index].conclusion;

    if (conclusion === null) {
      return false;
    }

    if (!states[index].premiseIndices.every((index) => verify(index))) {
      return false;
    }

    const premises = states[index].premiseIndices
      .map((index) => states[index].conclusion)
      .filter((premise) => premise !== null);

    return [action, arrowIntroduction, arrowElimination].some((rule) => rule(conclusion, premises));
  }

  useEffect(() => {
    setValid(verify(0));
  }, [states]);

  return (
    <MathJaxContext>
      <div className={`px-20 w-screen h-screen flex items-center justify-center ${valid ? "bg-lime-100" : ""}`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="absolute top-4 left-4" variant="outline">
              Edit syntax and rules
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Edit syntax and inference rules</SheetTitle>
            </SheetHeader>
            <div className="flex items-start mt-4 space-x-6">
              <SyntaxEditor syntax={syntax} setSyntax={setSyntax} />
              <InferenceRulesEditor
                syntax={syntax}
                inferenceRules={inferenceRules}
                setInferenceRules={setInferenceRules}
              />
            </div>
          </SheetContent>
        </Sheet>
        <ArgumentInput index={0} valid={valid} states={states} setStates={setStates} />
      </div>
    </MathJaxContext>
  );
}
