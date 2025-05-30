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
import { v4 as uuidv4 } from "uuid";

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
    <TableBody key={`${rule.id}-tablebody`} className="group border-b last:border-0">
      <TableRow key={`${rule.id}-tablerow`} className="group-hover:bg-muted/50 border-0">
        <TableCell key={`${rule.id}-tablecell-rulenameeditor`}>
          <RuleNameEditor
            key={`${rule.id}-rulenameeditor`}
            editing={editing}
            rule={localRule}
            index={index}
            setLocalRule={setLocalRule}
            setInferenceRules={setInferenceRules}
          />
        </TableCell>
        <TableCell key={`${rule.id}-tablecell-definitioneditor`}>
          <DefinitionEditor
            key={`${rule.id}-definitioneditor`}
            editing={editing}
            rule={localRule}
            index={index}
            setLocalRule={setLocalRule}
            setInferenceRules={setInferenceRules}
          />
        </TableCell>
        {editing && [
          <TableCell key={`${rule.id}-tablecell-definitionpreview`}>
            <DefinitionPreview key={`${rule.id}-definitionpreview`} rule={localRule} />
          </TableCell>,
          <TableCell key={`${rule.id}-tablecell-deleteicon`}>
            <DeleteIcon
              key={`${rule.id}-deleteicon`}
              onClick={() => {
                setInferenceRules((old) => old.filter((_, i) => i !== index));
              }}
            />
          </TableCell>,
        ]}
      </TableRow>
      <Errors key={`${rule.id}-errors`} index={index} errors={errors} />
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

  // Used in onBlur of inputs to force the state update to happen after onFocus is called.
  // When the user is focused on an input and clicks on another input,
  // this ensures the same click blurs the first input and focuses the second input
  function delayedSetInferenceRules(value: React.SetStateAction<InferenceRule[]>) {
    requestAnimationFrame(() => {
      setInferenceRules(value);
    });
  }

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
              key={`${rule.id}-inferenceruleeditorrow`}
              editing={editing}
              index={index}
              rule={rule}
              setInferenceRules={delayedSetInferenceRules}
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
                    id: uuidv4(),
                  },
                  id: uuidv4(),
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
