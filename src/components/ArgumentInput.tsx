import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { lex } from "@/lib/lexer";
import { latexify } from "@/lib/latexify";

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

export function ArgumentInput() {
  const [value, setValue] = useState("");
  const [latex, setLatex] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  // Focus input when we try to edit from the second time onwards
  const [edited, setEdited] = useState(false);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setLatex(`\\(${latexify(lex(e.target.value))}\\)`); // Inline LaTeX
    setIsEditing(false);
  };

  return isEditing || value.length == 0 ? (
    <FocusingInput
      value={value}
      edited={edited}
      onBlur={onBlur}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    />
  ) : (
    <MathJax
      onClick={() => {
        setEdited(true);
        setIsEditing(true);
      }}
    >
      {latex}
    </MathJax>
  );
}
