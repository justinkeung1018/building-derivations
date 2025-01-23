import { anyChar, string, whitespace } from "parjs";
import { Letter, letter } from "./letter";
import { between, many, map, or } from "parjs/combinators";

class Sequent {
  constructor(
    readonly left: (string | Letter)[],
    readonly right: (string | Letter)[],
  ) {}
}

const turnstile = string("|-");
const sequent = turnstile.pipe(
  or(letter),
  or(anyChar()),
  between(whitespace()),
  many(),
  map((symbols) => {
    const left = [];
    const right = [];
    let addToLeft = true;

    for (const symbol of symbols) {
      if (symbol === "|-") {
        addToLeft = false;
      } else if (addToLeft) {
        left.push(symbol);
      } else {
        right.push(symbol);
      }
    }

    return new Sequent(left, right);
  }),
);

export { sequent, Sequent };
