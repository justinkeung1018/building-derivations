import { ImportResult, importRules } from "@/lib/io/rules";
import { cn } from "@/lib/utils";
import React from "react";

interface ConfigFileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  setFileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  callback: (importResult: ImportResult) => void;
}

const ConfigFileInput = React.forwardRef<HTMLInputElement, ConfigFileInputProps>(
  ({ className, setFileName, callback }, ref) => {
    return (
      <>
        <div className="flex items-center gap-x-2">
          <label
            htmlFor="config-file-input"
            className={cn(
              "flex items-center h-9 px-2 rounded-md text-xs lg:text-sm font-medium cursor-pointer transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
              className,
            )}
          >
            Upload JSON
          </label>
        </div>
        <input
          id="config-file-input"
          ref={ref}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files !== null && e.target.files.length > 0) {
              const fileName = e.target.files[0].name;
              setFileName(fileName);
              e.target.files[0]
                .text()
                .then((text) => {
                  // TODO: display parsing errors
                  callback(importRules(text));
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
