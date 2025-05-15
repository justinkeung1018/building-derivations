import { JSONInferenceRule, JSONSyntaxRule } from "./jsonrules";

export interface PredefinedSearchParams {
  mode: "predefined";
  system: "natural-deduction" | "lambda" | "sequent";
}

export interface JSONSearchParams {
  mode: "json";
  syntax: JSONSyntaxRule[];
  inferenceRules: JSONInferenceRule[];
}

export interface CustomSearchParams {
  mode: "custom";
}

export interface NoneSearchParams {
  mode: "none";
}

export type SearchParams = PredefinedSearchParams | JSONSearchParams | CustomSearchParams | NoneSearchParams;
