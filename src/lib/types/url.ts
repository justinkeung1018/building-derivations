import { JSONInferenceRule, JSONSyntaxRule } from "./io/rules";

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
  syntax?: JSONSyntaxRule[];
  inferenceRules?: JSONInferenceRule[];
}

export interface NoneSearchParams {
  mode: "none";
}

export type SearchParams = PredefinedSearchParams | JSONSearchParams | CustomSearchParams | NoneSearchParams;
