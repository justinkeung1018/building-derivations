import React, { useEffect, useState } from "react";
import { ArgumentInput, ArgumentInputState, getDefaultState } from "./components/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";
import { action, arrowElimination, arrowIntroduction } from "./lib/verifiers/lambda";

export function App() {
  const [valid, setValid] = useState(false);
  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0, null) });

  function verify(index: number): boolean {
    const conclusion = states[index].conclusion;

    if (conclusion === null) {
      return false;
    }

    if (!states[index].premiseIndices.every((index) => verify(index))) {
      return false;
    }

    const premises = states[index].premiseIndices
      .map((index) => states[index].conclusion)
      .filter((premise) => premise !== null);

    return [action, arrowIntroduction, arrowElimination].some((rule) => rule(conclusion, premises));
  }

  useEffect(() => {
    setValid(verify(0));
  }, [states]);

  return (
    <MathJaxContext>
      <div className={`px-20 w-screen h-screen flex items-center justify-center ${valid ? "bg-lime-100" : ""}`}>
        <ArgumentInput index={0} valid={valid} states={states} setStates={setStates} />
      </div>
    </MathJaxContext>
  );
}
