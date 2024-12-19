import React from "react";
import { ArgumentInput } from "./components/ArgumentInput";
import { MathJaxContext } from "better-react-mathjax";

export function App() {
  return (
    <MathJaxContext>
      <div className="px-20 w-screen h-screen flex items-center justify-center">
        <ArgumentInput />
      </div>
    </MathJaxContext>
  );
}
