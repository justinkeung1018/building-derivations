import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../shadcn/Card";
import { SyntaxRule } from "@/lib/types/rules";
import { latexify } from "@/lib/latexify";
import { MathJax } from "better-react-mathjax";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../shadcn/Table";

interface SyntaxViewerProps {
  syntax: SyntaxRule[];
}

export const SyntaxViewer = memo(function SyntaxViewer({ syntax }: SyntaxViewerProps) {
  return (
    <Card className="h-fit max-h-full verflow-y-auto">
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
            </TableRow>
          </TableHeader>
          {syntax.map((rule, index) => (
            <TableBody className="group border-b last:border-0" key={index}>
              <TableRow className="group-hover:bg-muted/50 border-0">
                <TableCell>
                  {index === 0 ? (
                    "Statement"
                  ) : (
                    <MathJax inline dynamic>{`\\(${latexify(rule.placeholders.join(","))}\\)`}</MathJax>
                  )}
                </TableCell>
                <TableCell>
                  <MathJax>{"\\(::=\\)"}</MathJax>
                </TableCell>
                <TableCell>
                  <MathJax inline dynamic>{`\\(${rule.definitionSanitised.map(latexify).join("\\ |\\ ")}\\)`}</MathJax>
                </TableCell>
              </TableRow>
            </TableBody>
          ))}
        </Table>
      </CardContent>
    </Card>
  );
});
