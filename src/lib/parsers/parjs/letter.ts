import { anyStringOf, lower, string, upper } from "parjs";
import { map, or, then } from "parjs/combinators";

class UpperGreek {
  constructor(readonly letter: string) {}
}

class LowerASCII {
  constructor(readonly letter: string) {}
}

class UpperASCII {
  constructor(readonly letter: string) {}
}

type Letter = UpperGreek | LowerASCII | UpperASCII;

// TODO: ensure there is space after the command unless it is the end of the input, or not?
const upperGreek = string("\\").pipe(
  then(anyStringOf("Gamma", "Sigma", "Delta", "Pi")),
  map(([_slash, letter]) => new UpperGreek(letter)),
);
const lowerASCII = lower().pipe(map((letter) => new LowerASCII(letter)));
const upperASCII = upper().pipe(map((letter) => new UpperASCII(letter)));

const letter = upperGreek.pipe(or(lowerASCII), or(upperASCII));

export { letter, UpperGreek, LowerASCII, UpperASCII };
export type { Letter };
