import React from "react";
import { Input } from "@/components/shadcn/Input";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";

export function ArgumentInput() {
  const [value, setValue] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsEditing(false);
    console.log(value);
  };

  return isEditing ? (
    <Input onBlur={onBlur} />
  ) : (
    <MathJax
      onClick={() => {
        setIsEditing(true);
      }}
    >
      {value}
    </MathJax>
  );
}
