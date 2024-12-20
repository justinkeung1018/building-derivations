import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { lex } from "@/lib/lexer";
import { latexify } from "@/lib/latexify";
import { Argument, parseArgument } from "@/lib/parsers/argument";
import { Button } from "./shadcn/Button";
import { Plus } from "lucide-react";

interface FocusingInputProps extends React.ComponentProps<"input"> {
  edited: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FocusingInput({ edited, onBlur, ...props }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  }, []);

  return <Input ref={ref} onBlur={onBlur} {...props} />;
}

interface ArgumentInputProps {
  propagate?: (conclusion: Argument | null) => void;
}

export function ArgumentInput({ propagate }: ArgumentInputProps) {
  const [value, setValue] = useState("");
  const [latex, setLatex] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [conclusion, setConclusion] = useState<Argument | null>(null);
  const [premises, setPremises] = useState<(Argument | null)[]>([]); // eslint-disable-line
  const [premiseInputs, setPremiseInputs] = useState<React.JSX.Element[]>([]);

  // Focus input when we try to edit from the second time onwards
  const [edited, setEdited] = useState(false);

  const updateConclusion = (arg: Argument | null) => {
    if (propagate) propagate(arg);
    setConclusion(arg);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setLatex(`\\(${latexify(lex(e.target.value))}\\)`); // Inline LaTeX
    try {
      const arg = parseArgument(e.target.value);
      updateConclusion(arg);
    } catch {
      updateConclusion(null);
      // TODO: display input error
    }
    setIsEditing(false);
  };

  return isEditing || value.length == 0 ? (
    <FocusingInput
      value={value}
      edited={edited}
      onBlur={onBlur}
      onChange={(e) => {
        setValue(e.target.value);
        console.log(e.target.value);
      }}
    />
  ) : (
    <div className="flex flex-col items-center">
      {conclusion && (
        <div className="w-full">
          <div className="flex space-x-4 items-end justify-center">
            {premiseInputs}
            <Button
              variant="secondary"
              onClick={() => {
                setPremiseInputs((inputs) => [
                  ...inputs,
                  <ArgumentInput
                    propagate={(conclusion) => {
                      setPremises((premises) => {
                        premises[inputs.length] = conclusion;
                        return premises;
                      });
                    }}
                  />,
                ]);
              }}
            >
              <Plus />
            </Button>
          </div>
          <hr className="my-2 h-px border-black text-black bg-black" />
        </div>
      )}
      <div className="px-4">
        <MathJax
          onClick={() => {
            setEdited(true);
            setIsEditing(true);
          }}
        >
          {latex}
        </MathJax>
      </div>
    </div>
  );
}
