import React, { useRef, useEffect } from "react";
import { Input } from "../shadcn/Input";

interface FocusingInputProps extends React.ComponentProps<"input"> {
  edited: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function FocusingInput({ edited, autoFocus, onBlur, ...props }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  }, []);

  return <Input ref={ref} autoFocus={autoFocus} onBlur={onBlur} {...props} />;
}
