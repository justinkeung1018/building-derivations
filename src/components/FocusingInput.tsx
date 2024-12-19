import { useEffect, useRef } from "react";
import { Input } from "@/components/shadcn/Input";

interface FocusingInputProps {
  edited: boolean;
}

export default function FocusingInput({ edited }: FocusingInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) {
      ref.current?.focus();
    }
  });

  return <Input ref={ref} />;
}
