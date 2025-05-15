import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Input } from "./shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./shadcn/Table";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { latexify } from "@/lib/latexify";
import { ErrorMap } from "@/lib/types/messagemap";
import { Errors } from "./Errors";
import { DeleteIcon } from "./DeleteIcon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./shadcn/Card";

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
            <TableBody className="group border-b last:border-0">
              <TableRow className="group-hover:bg-muted/50 border-0">
                <TableCell>
                  {index === 0 ? (
                    "Statement"
                  ) : editing ? (
                    <Input
                      key={index}
                      maxLength={50}
                      className="w-24"
                      value={rule.placeholdersUnsanitised}
                      onChange={(e) => {
                        setSyntax((old) => {
                          const newRule = { ...rule, placeholdersUnsanitised: e.target.value };
                          return old.map((r, i) => (i === index ? newRule : r));
                        });
                      }}
                      data-cy={`syntax-placeholders-${index}`}
                    />
                  ) : (
                    <MathJax inline dynamic>{`\\(${rule.placeholders.join(",")}\\)`}</MathJax>
                  )}
                </TableCell>
                <TableCell>
                  <MathJax>{"\\(::=\\)"}</MathJax>
                </TableCell>
                <TableCell>
                  {editing ? (
                    <Input
                      key={index}
                      className="w-full"
                      maxLength={200}
                      value={rule.definitionUnsanitised}
                      onChange={(e) => {
                        setSyntax((old) => {
                          const newRule = { ...rule, definitionUnsanitised: e.target.value };
                          return old.map((r, i) => (i === index ? newRule : r));
                        });
                      }}
                      data-cy={`syntax-def-${index}`}
                    />
                  ) : (
                    <MathJax
                      inline
                      dynamic
                    >{`\\(${rule.definitionSanitised.map(latexify).join("\\ |\\ ")}\\)`}</MathJax>
                  )}
                </TableCell>
                {editing && (
                  <>
                    <TableCell>
                      <MathJax inline dynamic>{`\\(${latexify(rule.definitionUnsanitised)}\\)`}</MathJax>
                    </TableCell>
                    <TableCell>
                      {index > 0 && (
                        <DeleteIcon
                          onClick={() => {
                            setSyntax((old) => old.filter((_, i) => i !== index));
                          }}
                        />
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
              <Errors index={index} errors={errors} />
            </TableBody>
          ))}
        </Table>
        {editing && (
          <Button
            className="w-full mt-2"
            variant="secondary"
            onClick={() => {
              setSyntax((old) => [
                ...old,
                {
                  placeholders: [],
                  definition: [],
                  definitionSanitised: [],
                  placeholdersUnsanitised: "",
                  definitionUnsanitised: "",
                },
              ]);
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
