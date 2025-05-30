import React, { useState } from "react";
import { Button } from "../../shadcn/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../shadcn/Table";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { parseInferenceRules } from "@/lib/parsers/inference";
import { ErrorMap } from "@/lib/types/messagemap";
import { Errors } from "../Errors";
import { DeleteIcon } from "../DeleteIcon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../shadcn/Card";
import { RuleNameEditor } from "./RuleNameEditor";
import { DefinitionEditor } from "./DefinitionEditor";
import { DefinitionPreview } from "./DefinitionPreview";

interface InferenceRuleEditorRowProps {
  editing: boolean;
  rule: InferenceRule;
  index: number;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
  errors: ErrorMap;
}

function InferenceRuleEditorRow({ editing, index, rule, setInferenceRules, errors }: InferenceRuleEditorRowProps) {
  const [localRule, setLocalRule] = useState(rule);

  return (
    <TableBody className="group border-b last:border-0">
      <TableRow className="group-hover:bg-muted/50 border-0">
        <TableCell>
          <RuleNameEditor
            editing={editing}
            rule={localRule}
            index={index}
            setLocalRule={setLocalRule}
            setInferenceRules={setInferenceRules}
          />
        </TableCell>
        <TableCell>
          <DefinitionEditor
            editing={editing}
            rule={localRule}
            index={index}
            setLocalRule={setLocalRule}
            setInferenceRules={setInferenceRules}
          />
        </TableCell>
        {editing && (
          <>
            <TableCell>
              <DefinitionPreview rule={localRule} />
            </TableCell>
            <TableCell>
              <DeleteIcon
                onClick={() => {
                  setInferenceRules((old) => old.filter((_, i) => i !== index));
                }}
              />
            </TableCell>
          </>
        )}
      </TableRow>
      <Errors index={index} errors={errors} />
    </TableBody>
  );
}

interface InferenceRulesEditorProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function InferenceRulesEditor(props: InferenceRulesEditorProps) {
  const { syntax, inferenceRules, setInferenceRules } = props;
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState(new ErrorMap());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inference rules</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Name</TableHead>
              <TableHead className="w-48">Definition</TableHead>
              {editing && <TableHead>Preview</TableHead>}
            </TableRow>
          </TableHeader>
          {inferenceRules.map((rule, index) => (
            <InferenceRuleEditorRow
              editing={editing}
              index={index}
              rule={rule}
              setInferenceRules={setInferenceRules}
              errors={errors}
            />
          ))}
        </Table>
        {editing && (
          <Button
            className="w-full mt-2"
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
      </CardContent>
      <CardFooter className="flex justify-end">
        {editing ? (
          <Button
            className="bg-green-500 hover:bg-green-500/80"
            onClick={() => {
              setInferenceRules((old) => {
                const parseResult = parseInferenceRules(old, syntax);
                setErrors(parseResult.errors);
                if (parseResult.errors.size === 0) {
                  setEditing(false);
                }
                return parseResult.rules;
              });
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
      </CardFooter>
    </Card>
  );
}
