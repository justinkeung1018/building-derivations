import React, { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";

interface FocusingInputProps {
  edited: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function FocusingInput({ edited, onBlur }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  }, []);

  return <Input ref={ref} onBlur={onBlur} />;
}

export function ArgumentInput() {
  const [value, setValue] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  // Focus input when we try to edit from the second time onwards
  const [edited, setEdited] = useState(false);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsEditing(false);
    console.log(value);
  };

  return isEditing || value.length == 0 ? (
    <FocusingInput edited={edited} onBlur={onBlur} />
  ) : (
    <MathJax
      onClick={() => {
        setEdited(true);
        setIsEditing(true);
      }}
    >
      {value}
    </MathJax>
  );
}
