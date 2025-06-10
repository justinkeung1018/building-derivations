import { z } from "zod";
import { CustomSearchParams, JSONSearchParams, PredefinedSearchParams, SearchParams } from "./types/url";

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

const predefinedSearchSchema: z.ZodType<PredefinedSearchParams> = z.object({
  mode: z.literal("predefined"),
  system: z.union([z.literal("natural-deduction"), z.literal("lambda"), z.literal("sequent")]),
});

const jsonSearchSchema: z.ZodType<JSONSearchParams> = z.object({
  mode: z.literal("json"),
  ...jsonFields,
});

const customSearchSchema: z.ZodType<CustomSearchParams> = z.object({
  mode: z.literal("custom"),
  syntax: z.optional(
    z.array(
      z.object({
        placeholders: z.array(z.string()),
        definition: z.string(),
      }),
    ),
  ),
  inferenceRules: z.optional(
    z.array(
      z.object({
        name: z.string(),
        premises: z.array(z.string()),
        conclusion: z.string(),
      }),
    ),
  ),
});

export const searchSchema: z.ZodType<SearchParams> = z.union([
  predefinedSearchSchema,
  jsonSearchSchema,
  customSearchSchema,
]);
