import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "../shadcn/Button";
import { Input } from "../shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../shadcn/Table";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { latexify } from "@/lib/latexify";
import { ErrorMap } from "@/lib/types/messagemap";
import { Errors } from "./Errors";
import { DeleteIcon } from "./DeleteIcon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../shadcn/Card";
import { getDefaultSyntaxRule } from "@/lib/utils";

interface SyntaxEditorRowProps {
  rule: SyntaxRule;
  index: number;
  editing: boolean;
  errors: ErrorMap;
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
}

function SyntaxEditorRow({ rule, index, editing, errors, setSyntax }: SyntaxEditorRowProps) {
  const [localRule, setLocalRule] = useState(rule);

  // Used in onBlur of inputs to force the state update to happen after onFocus is called.
  // When the user is focused on an input and clicks on another input,
  // this ensures the same click blurs the first input and focuses the second input
  function delayedSetSyntax(value: React.SetStateAction<SyntaxRule[]>) {
    requestAnimationFrame(() => {
      setSyntax(value);
    });
  }

  return (
    <TableBody key={`${rule.id}-tablebody`} className="group border-b last:border-0">
      <TableRow key={`${rule.id}-tablerow`} className="group-hover:bg-muted/50 border-0">
        <TableCell key={`${rule.id}-tablecell-placeholder`}>
          {index === 0 ? (
            "Statement"
          ) : editing ? (
            <Input
              key={`${rule.id}-placeholder-input`}
              maxLength={50}
              className="w-24"
              value={localRule.placeholdersUnsanitised}
              onChange={(e) => {
                setLocalRule((old) => ({ ...old, placeholdersUnsanitised: e.target.value }));
              }}
              onBlur={() => {
                delayedSetSyntax((old) => old.map((r, i) => (i === index ? localRule : r)));
              }}
              data-cy={`syntax-placeholders-${index}`}
            />
          ) : (
            <MathJax
              key={`${rule.id}-placeholder-latex`}
              inline
              dynamic
            >{`\\(${latexify(localRule.placeholders.join(","))}\\)`}</MathJax>
          )}
        </TableCell>
        <TableCell key={`${rule.id}-tablecell-defines-symbol`}>
          <MathJax key={`${rule.id}-defines-symbol`}>{"\\(::=\\)"}</MathJax>
        </TableCell>
        <TableCell key={`${rule.id}-tablecell-definition`}>
          {editing ? (
            <Input
              key={`${rule.id}-definition-input`}
              className="w-full"
              maxLength={200}
              value={localRule.definitionUnsanitised}
              onChange={(e) => {
                setLocalRule((old) => ({ ...old, definitionUnsanitised: e.target.value }));
              }}
              onBlur={() => {
                delayedSetSyntax((old) => old.map((r, i) => (i === index ? localRule : r)));
              }}
              data-cy={`syntax-def-${index}`}
            />
          ) : (
            <MathJax
              key={`${rule.id}-definition-latex`}
              inline
              dynamic
            >{`\\(${localRule.definitionSanitised.map(latexify).join("\\ |\\ ")}\\)`}</MathJax>
          )}
        </TableCell>
        {editing && [
          <TableCell key={`${rule.id}-tablecell-definitionpreview`}>
            <MathJax
              key={`${rule.id}-tablecell-definitionpreview`}
              inline
              dynamic
            >{`\\(${latexify(localRule.definitionUnsanitised)}\\)`}</MathJax>
          </TableCell>,
          <TableCell key={`${rule.id}-tablecell-deleteicon`}>
            {index > 0 && (
              <DeleteIcon
                key={`${rule.id}-deleteicon`}
                onClick={() => {
                  setSyntax((old) => old.filter((_, i) => i !== index));
                }}
              />
            )}
          </TableCell>,
        ]}
      </TableRow>
      <Errors key={`${rule.id}-errors`} index={index} errors={errors} />
    </TableBody>
  );
}

interface SyntaxEditorProps {
  syntax: SyntaxRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
}

export function SyntaxEditor({ syntax, setSyntax }: SyntaxEditorProps) {
  const [errors, setErrors] = useState(new ErrorMap());
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syntax rules</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Placeholders</TableHead>
              <TableHead>
                <MathJax>{"\\(::=\\)"}</MathJax>
              </TableHead>
              <TableHead className="min-w-48">Definition</TableHead>
              {editing && <TableHead>Preview</TableHead>}
            </TableRow>
          </TableHeader>
          {syntax.map((rule, index) => (
            <SyntaxEditorRow
              key={`${rule.id}-syntaxeditorrow`}
              rule={rule}
              index={index}
              editing={editing}
              errors={errors}
              setSyntax={setSyntax}
            />
          ))}
        </Table>
        {editing && (
          <Button
            className="w-full mt-2"
            variant="secondary"
            onClick={() => {
              setSyntax((old) => [...old, getDefaultSyntaxRule()]);
            }}
            data-cy="add-syntax-button"
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
              setSyntax((old) => {
                const parseResult = parseSyntax(old);
                setErrors(parseResult.errors);
                if (parseResult.errors.size === 0) {
                  setEditing(false);
                }
                return parseResult.rules;
              });
            }}
            data-cy="apply-syntax-button"
          >
            Apply changes
          </Button>
        ) : (
          <Button
            className="bg-red-500 hover:bg-red-500/80"
            onClick={() => {
              setEditing(true);
            }}
            data-cy="edit-syntax-button"
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
