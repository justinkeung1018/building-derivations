import React, { useEffect, useState } from "react";
import { ArgumentInput, ArgumentInputState, getDefaultState } from "./components/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";

export function App() {
  const [states, setStates] = useState<Record<number, ArgumentInputState>>({ 0: getDefaultState(0) });

  useEffect(() => {
    console.log(states);
  }, [states]);

  return (
    <MathJaxContext>
      <div className="px-20 w-screen h-screen flex items-center justify-center">
        <ArgumentInput index={0} states={states} setStates={setStates} />
      </div>
    </MathJaxContext>
  );
}
