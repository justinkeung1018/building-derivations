import React, { useCallback, useEffect, useState } from "react";
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
import { CircleHelp } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../shadcn/HoverCard";

interface SyntaxEditorRowProps {
  rule: SyntaxRule;
  index: number;
  editing: boolean;
  errors: ErrorMap;
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  deleteRule: (index: number) => void;
}

function SyntaxEditorRow({ rule, index, editing, errors, setSyntax, deleteRule }: SyntaxEditorRowProps) {
  const [localRule, setLocalRule] = useState(rule);

  useEffect(() => {
    setLocalRule(rule);
  }, [rule]);

  // Used in onBlur of inputs to force the state update to happen after onFocus is called.
  // When the user is focused on an input and clicks on another input,
  // this ensures the same click blurs the first input and focuses the second input
  const delayedSetSyntax = useCallback((value: React.SetStateAction<SyntaxRule[]>) => {
    requestAnimationFrame(() => {
      setSyntax(value);
    });
  }, []);

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
                  deleteRule(index);
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

  const parse = useCallback((isLastChange: boolean, syntax: SyntaxRule[]) => {
    const parseResult = parseSyntax(syntax);
    setErrors(parseResult.errors);
    if (parseResult.errors.size === 0 && isLastChange) {
      setEditing(false);
    }
    setSyntax(parseResult.rules);
  }, []);

  const deleteRule = useCallback(
    (index: number) => {
      parse(
        false,
        syntax.filter((_, i) => i !== index),
      );
    },
    [syntax],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Syntax rules</CardTitle>
          <HoverCard>
            <HoverCardTrigger>
              <CircleHelp size={20} />
            </HoverCardTrigger>
            <HoverCardContent>
              <CardHeader className="p-0 flex flex-row justify-start items-center gap-x-2 space-y-0 mb-3">
                <CircleHelp size={15} />
                <CardTitle>Syntax guide</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="list-disc list-outside ml-4 text-sm space-y-2">
                  <li>Use {"{}"} to represent multisets.</li>
                  <li>
                    Use | to separate alternative definitions. If a definition uses | as a character, type the character
                    in the definition using \vert instead.
                  </li>
                  <li>
                    |- and \vdash both represent <MathJax inline>{"\\(\\vdash\\)"}</MathJax>.
                  </li>
                  <li>
                    {"->"}, \rightarrow, \to, and {"\\to{}"} all represent <MathJax inline>{"\\(\\to\\)"}</MathJax>.
                  </li>
                  <li>
                    Everything else is done in <MathJax inline>{"\\(\\LaTeX\\)"}</MathJax>.
                  </li>
                </ul>
              </CardContent>
            </HoverCardContent>
          </HoverCard>
        </div>
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
              deleteRule={deleteRule}
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
              parse(true, syntax);
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
