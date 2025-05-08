import React, { useEffect, useState } from "react";
import { ArgumentInput, ArgumentInputState, getDefaultState } from "./components/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/shadcn/Sheet";
import { Button } from "./components/shadcn/Button";
import { InferenceRule, SyntaxRule } from "./lib/types/rules";
import { SyntaxEditor } from "./components/SyntaxEditor";
import { InferenceRulesEditor } from "./components/InferenceRulesEditor";
import { verify } from "./lib/verifier/verify";
import { ToggleGroup, ToggleGroupItem } from "./components/shadcn/ToggleGroup";
import { defaultInferenceRule, defaultInferenceRuleStatement, defaultSyntaxRule } from "./lib/utils";
import { parseSyntax } from "./lib/parsers/syntax";
import { parseInferenceRules } from "./lib/parsers/inference";
import { ConfigFileInput } from "./components/ConfigFileInput";
import { JSONFormat, JSONInferenceRule, JSONSyntaxRule } from "./lib/types/jsonrules";

const NATURAL_DEDUCTION_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- A" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ A }" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "var | (A -> B)" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
];
const NATURAL_DEDUCTION_INFERENCE_RULES: InferenceRule[] = [
  {
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\to I",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- B" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\to E",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A -> B)" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A" },
    ],
  },
];
const LAMBDA_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- M: A" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma", definitionUnsanitised: "{ var: A }" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "A, B", definitionUnsanitised: "\\varphi | (A -> B)" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\varphi", definitionUnsanitised: "1 | 2 | 3" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "M, N", definitionUnsanitised: "var | (\\lambda var. M) | (MN)" },
];
const LAMBDA_INFERENCE_RULES: InferenceRule[] = [
  {
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- var: A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\to I",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (\\lambda var. M): (A -> B)" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, var: A |- M: B" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\to E",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (MN): B" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- M: (A -> B)" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- N: A" },
    ],
  },
];
const SEQUENT_SYNTAX: SyntaxRule[] = [
  { ...defaultSyntaxRule, definitionUnsanitised: "\\Gamma |- \\Delta" },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "\\Gamma, \\Delta, \\Sigma, \\Pi", definitionUnsanitised: "{ A }" },
  {
    ...defaultSyntaxRule,
    placeholdersUnsanitised: "A, B",
    definitionUnsanitised: "var | (A \\to B) | (A \\land B) | (A \\lor B) | (\\lnot A)",
  },
  { ...defaultSyntaxRule, placeholdersUnsanitised: "var", definitionUnsanitised: "x | y | z" },
];
const SEQUENT_INFERENCE_RULES: InferenceRule[] = [
  {
    ...defaultInferenceRule,
    name: "Ax",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta, A" },
  },
  {
    ...defaultInferenceRule,
    name: "\\land L_1",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\land L_2",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\land B) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, B |- \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (A \\lor B) |- \\Delta" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, B |- \\Delta" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\to L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, \\Sigma, (A \\to B) |- \\Delta, \\Pi" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Sigma, B |- \\Pi" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\lnot L",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, (\\lnot A) |- \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor R_1",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lor R_2",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\lor B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\land R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\land B), \\Delta" },
    premises: [
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- A, \\Delta" },
      { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- B, \\Delta" },
    ],
  },
  {
    ...defaultInferenceRule,
    name: "\\to R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (A \\to B), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- B, \\Delta" }],
  },
  {
    ...defaultInferenceRule,
    name: "\\lnot R",
    conclusion: { ...defaultInferenceRuleStatement, unsanitised: "\\Gamma |- (\\lnot A), \\Delta" },
    premises: [{ ...defaultInferenceRuleStatement, unsanitised: "\\Gamma, A |- \\Delta" }],
  },
];

export function App() {
  const [valid, setValid] = useState(false);
  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0, null) });
  const [syntax, setSyntax] = useState<SyntaxRule[]>([{ ...defaultSyntaxRule }]);
  const [inferenceRules, setInferenceRules] = useState<InferenceRule[]>([]);

  function verifyInput(index: number): boolean {
    const conclusion = states[index].conclusionInputState.value;

    if (!states[index].premiseIndices.every((index) => verifyInput(index))) {
      return false;
    }

    const premises = states[index].premiseIndices.map((index) => states[index].conclusionInputState.value);

    const rule = inferenceRules.find((rule) => states[index].ruleNameInputState.value === rule.name);

    if (rule === undefined) {
      return false;
    }

    return verify(conclusion, premises, rule, syntax);
  }

  useEffect(() => {
    setValid(verifyInput(0));
  }, [states]);

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
              <Button
                className="relative float-right mt-4"
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
          </SheetContent>
        </Sheet>
        <ArgumentInput index={0} valid={valid} states={states} setStates={setStates} />
      </div>
    </MathJaxContext>
  );
}
