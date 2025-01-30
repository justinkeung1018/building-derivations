import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Input } from "./shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./shadcn/Table";
import { InferenceRule, SyntaxRule } from "@/lib/types/types";
import { parseInferenceRules } from "@/lib/parsers/parjs/syntax";
import { latexify } from "@/lib/latexify";

function PremisesEditor({ editing, rule, index, setInferenceRules }: DefinitionEditorProps) {
  if (!editing) {
    return (
      <div className="flex justify-center">
        <MathJax>{`\\(${rule.premises.map((premise) => premise.definitionSanitised.map(latexify).join(" ")).join(" \\quad ")}\\)`}</MathJax>
      </div>
    );
  }

  if (rule.premises.length === 0) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setInferenceRules((old) => {
              const newPremise = {
                placeholders: [],
                definition: [],
                definitionSanitised: [],
                placeholdersUnsanitised: "",
                definitionUnsanitised: "",
              };
              const newRule = { ...rule, premises: [newPremise] };
              return old.map((r, i) => (i === index ? newRule : r));
            });
          }}
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
          value={premise.definitionUnsanitised}
          onChange={(e) => {
            setInferenceRules((old) => {
              const newPremise = { ...premise, definitionUnsanitised: e.target.value };
              const newRule = {
                ...rule,
                premises: rule.premises.map((p, i) => (i === premiseIndex ? newPremise : p)),
              };
              return old.map((r, i) => (i === index ? newRule : r));
            });
          }}
        />
      ))}
    </div>
  );
}

function ConclusionEditor({ editing, rule, index, setInferenceRules }: DefinitionEditorProps) {
  if (!editing) {
    return (
      <div className="flex justify-center">
        <MathJax>{`\\(${rule.conclusion.definitionSanitised.map(latexify).join(" ")}\\)`}</MathJax>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Input
        key={`${index.toString()}-conclusion`}
        className="w-96"
        value={rule.conclusion.definitionUnsanitised}
        onChange={(e) => {
          setInferenceRules((old) => {
            const newConclusion = { ...rule.conclusion, definitionUnsanitised: e.target.value };
            const newRule = {
              ...rule,
              conclusion: newConclusion,
            };
            return old.map((r, i) => (i === index ? newRule : r));
          });
        }}
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
                  placeholders: [],
                  definition: [],
                  definitionSanitised: [],
                  placeholdersUnsanitised: "",
                  definitionUnsanitised: "",
                },
              },
            ]);
          }}
        >
          Add rule
        </Button>
      )}
      <div className="flex justify-end">
        {editing ? (
          <Button
            className="bg-green-500 hover:bg-green-500/80"
            onClick={() => {
              setInferenceRules((old) => parseInferenceRules(old, syntax));
              console.log(inferenceRules);
              setEditing(false);
            }}
          >
            Apply changes
          </Button>
        ) : (
          <Button
            className="bg-red-500 hover:bg-red-500/80"
            onClick={() => {
              setEditing(true);
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export { InferenceRulesEditor };
