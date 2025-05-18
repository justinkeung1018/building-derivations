import React, { useEffect, useState } from "react";
import { ArgumentInput } from "../components/inputs/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { InferenceRule, SyntaxRule } from "../lib/types/rules";
import { verify } from "../lib/verifier/verify";
import { defaultInferenceRuleStatement, defaultSyntaxRule } from "../lib/utils";
import { parseSyntax } from "../lib/parsers/syntax";
import { parseInferenceRules } from "../lib/parsers/inference";
import { createFileRoute } from "@tanstack/react-router";
import { searchSchema } from "@/lib/schemas";
import { MessageMap } from "@/lib/types/messagemap";
import { ArgumentInputState, getDefaultState } from "@/lib/types/argumentinput";
import { normalise } from "@/lib/latexify";
import { TooltipProvider } from "@/components/shadcn/Tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/shadcn/Sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { getParsedSystem } from "@/lib/proof-systems";

export const Route = createFileRoute("/builder")({
  component: DerivationBuilder,
  validateSearch: searchSchema,
});

interface Errors {
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

export function DerivationBuilder() {
  const search = Route.useSearch();

  const [valid, setValid] = useState<boolean>(false);
  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0, null) });
  const [{ inputErrors, ruleErrors }, setErrors] = useState({
    inputErrors: new MessageMap(),
    ruleErrors: new MessageMap(),
  });
  const [syntax, setSyntax] = useState<SyntaxRule[]>([{ ...defaultSyntaxRule }]);
  const [inferenceRules, setInferenceRules] = useState<InferenceRule[]>([]);

  function verifyInput(index: number, inputErrors: MessageMap, ruleErrors: MessageMap): Errors {
    for (const premiseIndex of states[index].premiseIndices) {
      verifyInput(premiseIndex, inputErrors, ruleErrors);
    }

    const conclusion = states[index].conclusionInputState.value;
    const premises = states[index].premiseIndices.map((index) => states[index].conclusionInputState.value);

    const rule = inferenceRules.find((rule) => normalise(states[index].ruleNameInputState.value) === rule.name);

    if (rule === undefined) {
      ruleErrors.push(index, "Undefined rule");
    } else {
      const {
        conclusionErrors,
        ruleErrors: ruleErrorsList,
        premisesErrors,
      } = verify(normalise(conclusion), premises.map(normalise), rule, syntax);

      for (const message of conclusionErrors) {
        inputErrors.push(index, message);
      }

      premisesErrors.forEach((messages, i) => {
        const premiseIndex = states[index].premiseIndices[i];
        for (const message of messages) {
          inputErrors.push(premiseIndex, message);
        }
      });

      for (const message of ruleErrorsList) {
        ruleErrors.push(index, message);
      }
    }

    return { inputErrors, ruleErrors };
  }

  useEffect(() => {
    const errors = verifyInput(0, new MessageMap(), new MessageMap());
    setErrors(errors);
    setValid(errors.inputErrors.size === 0 && errors.ruleErrors.size === 0);
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
      const { syntax, inferenceRules } = getParsedSystem(search.system);
      setSyntax(syntax);
      setInferenceRules(inferenceRules);
    }
  }, []);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <MathJaxContext>
          <AppSidebar
            valid={valid}
            syntax={syntax}
            inferenceRules={inferenceRules}
            states={states}
            setSyntax={setSyntax}
            setInferenceRules={setInferenceRules}
            setStates={setStates}
          />
          <div className={valid ? "bg-lime-100" : ""}>
            <SidebarTrigger className="mt-2" />
          </div>
          <div
            className={`px-auto w-screen h-screen flex items-center justify-center ${valid ? "bg-lime-100" : ""}`}
            data-cy="container"
          >
            <ArgumentInput
              index={0}
              valid={valid}
              states={states}
              setStates={setStates}
              inputErrors={inputErrors}
              ruleErrors={ruleErrors}
            />
          </div>
        </MathJaxContext>
      </TooltipProvider>
    </SidebarProvider>
  );
}
