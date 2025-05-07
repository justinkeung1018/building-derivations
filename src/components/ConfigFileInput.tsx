import { parseInferenceRules } from "@/lib/parsers/inference";
import { parseSyntax } from "@/lib/parsers/syntax";
import { JSONFormat } from "@/lib/types/jsonrules";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { cn, defaultInferenceRuleStatement, defaultSyntaxRule } from "@/lib/utils";
import React, { useState } from "react";
import { z } from "zod";

interface ConfigFileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

const ConfigFileInput = React.forwardRef<HTMLInputElement, ConfigFileInputProps>(
  ({ className, setSyntax, setInferenceRules }) => {
    const [fileName, setFileName] = useState<string | undefined>(undefined);

    const schema: z.ZodType<JSONFormat> = z.object({
      syntax: z.array(
        z.object({
          placeholders: z.array(z.string()),
          definition: z.string(),
        }),
      ),
      inferenceRules: z.array(
        z.object({
          name: z.string(),
          premises: z.array(z.string()),
          conclusion: z.string(),
        }),
      ),
    });

    return (
      <div>
        <div className="flex items-center gap-x-2">
          <label
            htmlFor="config-file-input"
            className={cn(
              "flex items-center h-9 px-2 rounded-md text-sm font-medium cursor-pointer transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
              className,
            )}
          >
            Upload JSON
          </label>
          {fileName !== undefined && <span>{fileName} uploaded.</span>}
        </div>
        <input
          id="config-file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files !== null && e.target.files.length > 0) {
              setFileName(e.target.files[0].name);
              e.target.files[0]
                .text()
                .then((text) => {
                  // TODO: display parsing errors
                  const json = schema.parse(JSON.parse(text));
                  const syntax: SyntaxRule[] = json.syntax.map(({ placeholders, definition }) => ({
                    ...defaultSyntaxRule,
                    placeholders,
                    placeholdersUnsanitised: placeholders.join(", "),
                    definitionUnsanitised: definition,
                  }));
                  const inferenceRules: InferenceRule[] = json.inferenceRules.map(({ name, premises, conclusion }) => ({
                    name,
                    premises: premises.map((unsanitised) => ({ ...defaultInferenceRuleStatement, unsanitised })),
                    conclusion: { ...defaultInferenceRuleStatement, unsanitised: conclusion },
                  }));
                  // TODO: display parsing errors
                  const parsedSyntax = parseSyntax(syntax).rules;
                  setSyntax(parseSyntax(syntax).rules);
                  setInferenceRules(parseInferenceRules(inferenceRules, parsedSyntax).rules);
                })
                .catch((reason: unknown) => {
                  console.error(reason);
                });
            } else {
              setFileName(undefined);
            }
          }}
        />
      </div>
    );
  },
);
ConfigFileInput.displayName = "File input";

export { ConfigFileInput };
