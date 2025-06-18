import React, { useCallback, useEffect, useState } from "react";
import { ArgumentInput } from "../components/inputs/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { v4 as uuidv4 } from "uuid";
import { InferenceRule, SyntaxRule } from "../lib/types/rules";
import { verify } from "../lib/verifier/verify";
import { cn, getDefaultInferenceRuleStatement, getDefaultSyntaxRule } from "../lib/utils";
import { parseSyntax } from "../lib/parsers/syntax";
import { parseInferenceRules } from "../lib/parsers/inference";
import { createFileRoute } from "@tanstack/react-router";
import { searchSchema } from "@/lib/schemas";
import { MessageMap } from "@/lib/types/messagemap";
import { ArgumentInputState, getDefaultState, InputState } from "@/lib/types/argumentinput";
import { latexifyRuleName, normalise } from "@/lib/latexify";
import { TooltipProvider } from "@/components/shadcn/Tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/shadcn/Sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { getParsedSystem } from "@/lib/proof-systems";
import { z } from "zod";
import { buildTermParser } from "@/lib/parsers/term";
import { toast } from "sonner";

export const Route = createFileRoute("/builder")({
  component: DerivationBuilder,
  validateSearch: searchSchema,
});

interface Errors {
  inputErrors: MessageMap;
  ruleErrors: MessageMap;
}

const inputStateSchema: z.ZodType<InputState> = z.object({
  isEditing: z.boolean(),
  edited: z.boolean(),
  value: z.string(),
  latex: z.string(),
});

const argumentInputStateSchema: z.ZodType<ArgumentInputState> = z.object({
  index: z.number(),
  autofocus: z.boolean(),
  conclusionInputState: inputStateSchema,
  ruleNameInputState: inputStateSchema,
  conclusionIndex: z.number().or(z.null()),
  premiseIndices: z.array(z.number()),
});

// JSON stores the numerical keys as strings so we want to accept numerical strings instead of numbers
const schema: z.ZodType<Record<number, ArgumentInputState>> = z.record(z.coerce.number(), argumentInputStateSchema);

export function DerivationBuilder() {
  const search = Route.useSearch();

  const [valid, setValid] = useState<boolean>(false);
  const [states, setStates] = useState<Record<number, ArgumentInputState>>(() => {
    const persistedStates = localStorage.getItem("states");
    if (persistedStates === null) {
      return { 0: getDefaultState(0, null) };
    }
    return schema.parse(JSON.parse(persistedStates));
  });

  const [{ inputErrors, ruleErrors }, setErrors] = useState({
    inputErrors: new MessageMap(),
    ruleErrors: new MessageMap(),
  });
  const [syntax, setSyntax] = useState<SyntaxRule[]>([getDefaultSyntaxRule()]);
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
      if (syntax[0].definition.length > 0) {
        // TODO: find more elegant solution
        // Parse the statement only if syntax is initialised
        const parser = buildTermParser(syntax);
        const parseResult = parser.parse(normalise(conclusion));
        if (!parseResult.isOk) {
          inputErrors.push(index, "Input is not a valid statement");
        }
      }
    } else {
      const {
        conclusionErrors,
        ruleErrors: ruleErrorsList,
        premisesErrors,
      } = verify(conclusion, premises, rule, syntax);

      for (const message of conclusionErrors) {
        inputErrors.push(index, `${message} [rule ${latexifyRuleName(rule.name)}]`);
      }

      premisesErrors.forEach((messages, i) => {
        const premiseIndex = states[index].premiseIndices[i];
        for (const message of messages) {
          inputErrors.push(premiseIndex, `${message} [rule ${latexifyRuleName(rule.name)}]`);
        }
      });

      for (const message of ruleErrorsList) {
        ruleErrors.push(index, `${message} [rule ${latexifyRuleName(rule.name)}]`);
      }
    }

    return { inputErrors, ruleErrors };
  }

  const setPersistentStates = useCallback(
    (valueOrCallback: React.SetStateAction<Record<number, ArgumentInputState>>) => {
      setStates((old) => {
        const newStates = typeof valueOrCallback === "function" ? valueOrCallback(old) : valueOrCallback;

        try {
          localStorage.setItem("states", JSON.stringify(newStates));
        } catch (error) {
          console.warn(`Error writing to localStorage with key "states":`, error);
        }

        return newStates;
      });
    },
    [],
  );

  useEffect(() => {
    const errors = verifyInput(0, new MessageMap(), new MessageMap());
    setErrors(errors);
    const newIsValid = errors.inputErrors.size === 0 && errors.ruleErrors.size === 0;
    setValid(newIsValid);
    if (
      newIsValid &&
      Object.values(states).every((x) => !x.conclusionInputState.isEditing && !x.ruleNameInputState.isEditing)
    ) {
      toast.success("Derivation is correct!");
    }
  }, [states, syntax, inferenceRules]);

  useEffect(() => {
    if (search.mode === "json" || search.mode === "custom") {
      if (search.syntax !== undefined) {
        const syntax: SyntaxRule[] = search.syntax.map(({ placeholders, definition }) => ({
          ...getDefaultSyntaxRule(),
          placeholders,
          placeholdersUnsanitised: placeholders.join(", "),
          definitionUnsanitised: definition,
        }));

        // TODO: display errors when mode === "custom"
        const parsedSyntax = parseSyntax(syntax).rules;
        setSyntax(parsedSyntax);

        if (search.inferenceRules !== undefined) {
          const inferenceRules: InferenceRule[] = search.inferenceRules.map(({ name, premises, conclusion }) => ({
            name,
            premises: premises.map((unsanitised) => ({ ...getDefaultInferenceRuleStatement(), unsanitised })),
            conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: conclusion },
            id: uuidv4(),
          }));
          // TODO: display errors when mode === "custom"
          setInferenceRules(parseInferenceRules(inferenceRules, parsedSyntax).rules);
        }
      }
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
            setStates={setPersistentStates}
          />
          <div className={cn("flex w-full min-w-fit pl-2", valid ? "bg-lime-100" : "")} data-cy="container">
            <SidebarTrigger className="mt-2" />
            <div className={`px-auto w-full flex items-center justify-center`}>
              <ArgumentInput
                index={0}
                valid={valid}
                states={states}
                setStates={setPersistentStates}
                inputErrors={inputErrors}
                ruleErrors={ruleErrors}
              />
            </div>
          </div>
        </MathJaxContext>
      </TooltipProvider>
    </SidebarProvider>
  );
}
