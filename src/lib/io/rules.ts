import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { parseInferenceRules } from "../parsers/inference";
import { parseSyntax } from "../parsers/syntax";
import { JSONSyntaxRule, JSONInferenceRule, JSONFormat } from "../types/io/rules";
import { SyntaxRule, InferenceRule, ParseResult } from "../types/rules";
import { getDefaultInferenceRuleStatement, getDefaultSyntaxRule } from "../utils";

const jsonFields = {
  syntax: z.array(
    z.object({
      placeholders: z.array(z.string()),
      definition: z.string(),
    }),
  ),
  inferenceRules: z.array(
    z.object({
      name: z.string(),
      premises: z.array(z.string()),
      conclusion: z.string(),
    }),
  ),
};

const schema: z.ZodType<JSONFormat> = z.object(jsonFields);

export interface ImportResult {
  json: JSONFormat;
  parsedSyntax: ParseResult<SyntaxRule>;
  parsedInferenceRules: ParseResult<InferenceRule>;
}

export function importRules(text: string): ImportResult {
  // TODO: display parsing errors
  const json = schema.parse(JSON.parse(text));
  const syntax: SyntaxRule[] = json.syntax.map(({ placeholders, definition }) => ({
    ...getDefaultSyntaxRule(),
    placeholders,
    placeholdersUnsanitised: placeholders.join(", "),
    definitionUnsanitised: definition,
  }));
  const inferenceRules: InferenceRule[] = json.inferenceRules.map(({ name, premises, conclusion }) => ({
    name,
    premises: premises.map((unsanitised) => ({ ...getDefaultInferenceRuleStatement(), unsanitised })),
    conclusion: { ...getDefaultInferenceRuleStatement(), unsanitised: conclusion },
    id: uuidv4(),
  }));
  // TODO: display parsing errors
  const parsedSyntax = parseSyntax(syntax);
  const parsedInferenceRules = parseInferenceRules(inferenceRules, parsedSyntax.rules);
  return { json, parsedSyntax, parsedInferenceRules };
}

export function exportSyntaxRules(syntax: SyntaxRule[]): JSONSyntaxRule[] {
  return syntax.map(({ placeholders, definitionUnsanitised }) => ({
    placeholders,
    definition: definitionUnsanitised,
  }));
}

export function exportInferenceRules(inferenceRules: InferenceRule[]): JSONInferenceRule[] {
  return inferenceRules.map(({ name, premises, conclusion }) => ({
    name,
    premises: premises.map(({ unsanitised }) => unsanitised),
    conclusion: conclusion.unsanitised,
  }));
}

export function exportRules(syntax: SyntaxRule[], inferenceRules: InferenceRule[]): JSONFormat {
  return { syntax: exportSyntaxRules(syntax), inferenceRules: exportInferenceRules(inferenceRules) };
}
