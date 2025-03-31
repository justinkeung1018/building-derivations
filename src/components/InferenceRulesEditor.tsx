import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Input } from "./shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./shadcn/Table";
import { InferenceRule, InferenceRuleStatement, SyntaxRule } from "@/lib/types/rules";
import { latexify } from "@/lib/latexify";
import { parseInferenceRules } from "@/lib/parsers/inference";
import { Plus } from "lucide-react";

function PremisesEditor({ rule, index, setInferenceRules }: DefinitionEditorProps) {
  if (rule.premises.length === 0) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setInferenceRules((old) => {
              const newPremise = {
                structure: [],
                sanitised: "",
                unsanitised: "",
              };
              const newRule = { ...rule, premises: [newPremise] };
              return old.map((r, i) => (i === index ? newRule : r));
            });
          }}
          data-cy={`add-premise-button-${index}`}
        >
          Add premise
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-4">
      {rule.premises.map((premise, premiseIndex) => (
        <Input
          key={`${index.toString()}-${premiseIndex.toString()}-premise`}
          className="w-48"
          value={premise.unsanitised}
          onChange={(e) => {
            setInferenceRules((old) => {
              const newPremise: InferenceRuleStatement = { ...premise, unsanitised: e.target.value };
              const newRule: InferenceRule = {
                ...rule,
                premises: rule.premises.map((p, i) => (i === premiseIndex ? newPremise : p)),
              };
              return old.map((r, i) => (i === index ? newRule : r));
            });
          }}
          data-cy={`premise-${index}-${premiseIndex}`}
        />
      ))}
      <Button
        variant="secondary"
        onClick={() => {
          setInferenceRules((old) => {
            const newPremise: InferenceRuleStatement = {
              structure: [],
              sanitised: "",
              unsanitised: "",
            };
            const newRule: InferenceRule = {
              ...rule,
              premises: [...rule.premises, newPremise],
            };
            return old.map((r, i) => (i === index ? newRule : r));
          });
        }}
        data-cy={`add-premise-button-${index}`}
      >
        <Plus />
      </Button>
    </div>
  );
}

function ConclusionEditor({ rule, index, setInferenceRules }: DefinitionEditorProps) {
  return (
    <div className="flex justify-center">
      <Input
        key={`${index.toString()}-conclusion`}
        className="w-96"
        value={rule.conclusion.unsanitised}
        onChange={(e) => {
          setInferenceRules((old) => {
            const newConclusion: InferenceRuleStatement = { ...rule.conclusion, unsanitised: e.target.value };
            const newRule: InferenceRule = {
              ...rule,
              conclusion: newConclusion,
            };
            return old.map((r, i) => (i === index ? newRule : r));
          });
        }}
        data-cy={`conclusion-${index}`}
      />
    </div>
  );
}

interface DefinitionEditorProps extends InferenceRulesEditorProps {
  editing: boolean;
  rule: InferenceRule;
  index: number;
}

function DefinitionEditor(props: DefinitionEditorProps) {
  const { editing, rule } = props;

  if (!editing) {
    const premisesLaTeX = rule.premises.map((premise) => latexify(premise.sanitised)).join(" \\quad ");
    const conclusionLaTeX = latexify(rule.conclusion.sanitised);
    return <MathJax>{`\\[\\frac{${premisesLaTeX}}{${conclusionLaTeX}}\\]`}</MathJax>;
  }

  return (
    <div className="space-y-2">
      <PremisesEditor {...props} />
      <hr className="h-px border-black text-black bg-black" />
      <ConclusionEditor {...props} />
    </div>
  );
}

interface InferenceRulesEditorProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

function InferenceRulesEditor(props: InferenceRulesEditorProps) {
  const { syntax, inferenceRules, setInferenceRules } = props;
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-2">
      <h1 className="text-center text-lg font-semibold">Inference rules</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Name</TableHead>
            <TableHead className="w-96">Definition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inferenceRules.map((rule, index) => (
            <TableRow>
              <TableCell>
                {editing ? (
                  <Input
                    key={index}
                    className="w-24"
                    value={rule.name}
                    onChange={(e) => {
                      setInferenceRules((old) => {
                        const newRule = { ...rule, name: e.target.value };
                        return old.map((r, i) => (i === index ? newRule : r));
                      });
                    }}
                    data-cy={`inference-name-${index}`}
                  />
                ) : (
                  <MathJax>{`\\((\\mathit{${rule.name}})\\)`}</MathJax>
                )}
              </TableCell>
              <TableCell>
                <DefinitionEditor editing={editing} rule={rule} index={index} {...props} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editing && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            setInferenceRules((old) => [
              ...old,
              {
                name: "",
                premises: [],
                conclusion: {
                  structure: [],
                  sanitised: "",
                  unsanitised: "",
                },
              },
            ]);
          }}
          data-cy="add-inference-button"
        >
          Add rule
        </Button>
      )}
      <div className="flex justify-end">
        {editing ? (
          <Button
            className="bg-green-500 hover:bg-green-500/80"
            onClick={() => {
              setInferenceRules((old) => parseInferenceRules(old, syntax).rules);
              setEditing(false);
            }}
            data-cy="apply-inference-button"
          >
            Apply changes
          </Button>
        ) : (
          <Button
            className="bg-red-500 hover:bg-red-500/80"
            onClick={() => {
              setEditing(true);
            }}
            data-cy="edit-inference-button"
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export { InferenceRulesEditor };
