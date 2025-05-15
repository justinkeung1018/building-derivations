import React, { useEffect, useState } from "react";
import { ArgumentInput } from "../components/inputs/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/shadcn/Sheet";
import { Button } from "../components/shadcn/Button";
import { InferenceRule, SyntaxRule } from "../lib/types/rules";
import { SyntaxEditor } from "../components/SyntaxEditor";
import { InferenceRulesEditor } from "../components/InferenceRulesEditor";
import { verify } from "../lib/verifier/verify";
import { ToggleGroup, ToggleGroupItem } from "../components/shadcn/ToggleGroup";
import { defaultInferenceRuleStatement, defaultSyntaxRule } from "../lib/utils";
import { parseSyntax } from "../lib/parsers/syntax";
import { parseInferenceRules } from "../lib/parsers/inference";
import { ConfigFileInput } from "../components/inputs/ConfigFileInput";
import { JSONFormat, JSONInferenceRule, JSONSyntaxRule } from "../lib/types/jsonrules";
import { createFileRoute } from "@tanstack/react-router";
import { searchSchema } from "@/lib/schemas";
import { MessageMap } from "@/lib/types/messagemap";
import {
  LAMBDA_INFERENCE_RULES,
  LAMBDA_SYNTAX,
  NATURAL_DEDUCTION_INFERENCE_RULES,
  NATURAL_DEDUCTION_SYNTAX,
  SEQUENT_INFERENCE_RULES,
  SEQUENT_SYNTAX,
} from "@/lib/proof-systems";
import { ArgumentInputState, getDefaultState } from "@/lib/types/argumentinput";

export const Route = createFileRoute("/builder")({
  component: DerivationBuilder,
  validateSearch: searchSchema,
});

export function DerivationBuilder() {
  const search = Route.useSearch();

  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0, null) });
  const [inputErrors, setInputErrors] = useState(new MessageMap());
  const [ruleErrors, setRuleErrors] = useState(new MessageMap());
  const [syntax, setSyntax] = useState<SyntaxRule[]>([{ ...defaultSyntaxRule }]);
  const [inferenceRules, setInferenceRules] = useState<InferenceRule[]>([]);

  // TODO: can we make valid stay false throughout initialisation?
  const valid = inputErrors.size === 0 && ruleErrors.size === 0;

  function verifyInput(index: number) {
    for (const premiseIndex of states[index].premiseIndices) {
      verifyInput(premiseIndex);
    }

    const conclusion = states[index].conclusionInputState.value;
    const premises = states[index].premiseIndices.map((index) => states[index].conclusionInputState.value);

    const rule = inferenceRules.find((rule) => states[index].ruleNameInputState.value === rule.name);

    if (rule === undefined) {
      setRuleErrors((old) => {
        old.push(index, "Undefined rule");
        return old;
      });
      return;
    }

    const { conclusionErrors, ruleErrors: ruleErrorsList, premisesErrors } = verify(conclusion, premises, rule, syntax);

    for (const message of conclusionErrors) {
      setInputErrors((old) => {
        old.push(index, message);
        return old;
      });
    }

    premisesErrors.forEach((messages, i) => {
      const premiseIndex = states[index].premiseIndices[i];
      for (const message of messages) {
        setInputErrors((old) => {
          old.push(premiseIndex, message);
          return old;
        });
      }
    });

    for (const message of ruleErrorsList) {
      setRuleErrors((old) => {
        old.push(index, message);
        return old;
      });
    }
  }

  useEffect(() => {
    setInputErrors(new MessageMap());
    setRuleErrors(new MessageMap());
    verifyInput(0);
  }, [states]);

  useEffect(() => {
    if (search.mode === "json") {
      const syntax: SyntaxRule[] = search.syntax.map(({ placeholders, definition }) => ({
        ...defaultSyntaxRule,
        placeholders,
        placeholdersUnsanitised: placeholders.join(", "),
        definitionUnsanitised: definition,
      }));

      const inferenceRules: InferenceRule[] = search.inferenceRules.map(({ name, premises, conclusion }) => ({
        name,
        premises: premises.map((unsanitised) => ({ ...defaultInferenceRuleStatement, unsanitised })),
        conclusion: { ...defaultInferenceRuleStatement, unsanitised: conclusion },
      }));

      const parsedSyntax = parseSyntax(syntax).rules;
      setSyntax(parsedSyntax);
      setInferenceRules(parseInferenceRules(inferenceRules, parsedSyntax).rules);
    } else if (search.mode === "predefined") {
      setSystem(search.system);
    }
  }, []);

  function setSystem(system: string) {
    let syntaxUnsanitised: SyntaxRule[] | undefined = undefined;
    let inferenceRulesUnsanitised: InferenceRule[] | undefined = undefined;

    if (system === "natural-deduction") {
      syntaxUnsanitised = NATURAL_DEDUCTION_SYNTAX;
      inferenceRulesUnsanitised = NATURAL_DEDUCTION_INFERENCE_RULES;
    } else if (system === "lambda") {
      syntaxUnsanitised = LAMBDA_SYNTAX;
      inferenceRulesUnsanitised = LAMBDA_INFERENCE_RULES;
    } else if (system === "sequent") {
      syntaxUnsanitised = SEQUENT_SYNTAX;
      inferenceRulesUnsanitised = SEQUENT_INFERENCE_RULES;
    } else if (system === "") {
      syntaxUnsanitised = [{ ...defaultSyntaxRule }];
      inferenceRulesUnsanitised = [];
    }

    if (syntaxUnsanitised !== undefined && inferenceRulesUnsanitised !== undefined) {
      const syntax = parseSyntax(syntaxUnsanitised).rules;
      setSyntax(syntax);
      const inferenceRules = parseInferenceRules(inferenceRulesUnsanitised, syntax).rules;
      setInferenceRules(inferenceRules);
    }
  }

  return (
    <MathJaxContext>
      <div
        className={`px-20 w-screen h-screen flex items-center justify-center ${valid ? "bg-lime-100" : ""}`}
        data-cy="container"
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button className="absolute top-4 left-4" variant="outline" data-cy="edit-rules-button">
              Edit syntax and rules
            </Button>
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
                  setSystem(value);
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
        <ArgumentInput index={0} valid={valid} states={states} setStates={setStates} />
      </div>
    </MathJaxContext>
  );
}
