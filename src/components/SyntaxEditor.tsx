import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Input } from "./shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./shadcn/Table";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { latexify } from "@/lib/latexify";
import { ErrorMap } from "@/lib/types/messagemap";
import { CircleAlert } from "lucide-react";

interface SyntaxEditorProps {
  syntax: SyntaxRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
}

export function SyntaxEditor({ syntax, setSyntax }: SyntaxEditorProps) {
  const [errors, setErrors] = useState(new ErrorMap());
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-2">
      <h1 className="text-center text-lg font-semibold">Syntax rules</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Placeholders</TableHead>
            <TableHead>
              <MathJax>{"\\(::=\\)"}</MathJax>
            </TableHead>
            <TableHead className="w-48">Definition</TableHead>
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
                  <MathJax>{`\\(${rule.placeholders.join(",")}\\)`}</MathJax>
                )}
              </TableCell>
              <TableCell>
                <MathJax>{"\\(::=\\)"}</MathJax>
              </TableCell>
              <TableCell>
                {editing ? (
                  <Input
                    key={index}
                    className="w-48"
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
                  <MathJax>{`\\(${rule.definitionSanitised.map(latexify).join("\\ |\\ ")}\\)`}</MathJax>
                )}
              </TableCell>
            </TableRow>
            {errors.has(index) && (
              <TableRow className="group-hover:bg-muted/50 border-0 mt-20">
                <TableCell className="pt-0" colSpan={3}>
                  <div className="flex flex-col gap-y-1">
                    {errors.get(index).map((message) => (
                      <div className="flex items-center gap-x-2 text-red-600 font-bold">
                        <CircleAlert size={20} />
                        {message}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        ))}
      </Table>
      {editing && (
        <Button
          className="w-full"
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
      <div className="flex justify-end">
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
      </div>
    </div>
  );
}
