import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { Button } from "./shadcn/Button";
import { Input } from "./shadcn/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./shadcn/Table";
import { SyntaxRule } from "@/lib/types/rules";
import { parseSyntax } from "@/lib/parsers/syntax";
import { latexify } from "@/lib/latexify";

interface SyntaxEditorProps {
  syntax: SyntaxRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
}

function SyntaxEditor({ syntax, setSyntax }: SyntaxEditorProps) {
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
        <TableBody>
          {syntax.map((rule, index) => (
            <TableRow>
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
                  />
                ) : (
                  <MathJax>{`\\(${rule.definitionSanitised.map(latexify).join("\\ |\\ ")}\\)`}</MathJax>
                )}
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
        >
          Add rule
        </Button>
      )}
      <div className="flex justify-end">
        {editing ? (
          <Button
            className="bg-green-500 hover:bg-green-500/80"
            onClick={() => {
              setSyntax((old) => parseSyntax(old));
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

export { SyntaxEditor };
