import { importRules } from "@/lib/io/rules";
import { InferenceRule, SyntaxRule } from "@/lib/types/rules";
import { SearchParams } from "@/lib/types/url";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface ConfigFileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  setSyntax?: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules?: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
  setSearch?: React.Dispatch<React.SetStateAction<SearchParams>>;
}

const ConfigFileInput = React.forwardRef<HTMLInputElement, ConfigFileInputProps>(
  ({ className, setSyntax, setInferenceRules, setSearch }, ref) => {
    const [fileName, setFileName] = useState<string | undefined>(undefined);

    return (
      <>
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
          ref={ref}
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
                  const { json, parsedSyntax, parsedInferenceRules } = importRules(text);
                  if (setSyntax) {
                    setSyntax(parsedSyntax.rules);
                  }
                  if (setInferenceRules) {
                    setInferenceRules(parsedInferenceRules.rules);
                  }
                  if (setSearch) {
                    if (parsedSyntax.errors.size === 0 && parsedInferenceRules.errors.size === 0) {
                      setSearch({ mode: "json", ...json });
                    } else {
                      setSearch({ mode: "none" });
                    }
                  }
                })
                .catch((reason: unknown) => {
                  console.error(reason);
                });
            } else {
              setFileName(undefined);
            }
            e.target.value = ""; // Trigger onChange even when user selects the same file multiple times
          }}
        />
      </>
    );
  },
);
ConfigFileInput.displayName = "File input";

export { ConfigFileInput };
