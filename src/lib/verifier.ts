// import { Sequent } from "./parsers/parjs/sequent";

// class Rule {
//   constructor(
//     readonly premises: Sequent[],
//     readonly conclusion: Sequent,
//   ) {}
// }

// // function verify(rule: Rule, premises: Sequent[], conclusion: Sequent): boolean {
// //   const mapping: Record<string, (string | Letter)[]> = {};
// //   let j = 0;

// //   for (let i = 0; i < rule.conclusion.right.length; i++) {
// //     const token = rule.conclusion.right[i];
// //     if (typeof token === "string") {
// //       if (conclusion.right[j] !== token) {
// //         return false;
// //       }
// //       j++;
// //     } else if (i === rule.conclusion.right.length - 1) {
// //       if (token instanceof UpperGreek) {
// //         // idk
// //       } else if (token instanceof LowerASCII) {
// //         if (j !== conclusion.right.length - 1) {
// //           // A variable can only be one letter long
// //           return false;
// //         }
// //         mapping[token.letter] = [conclusion.right[j]];
// //       } else if (token instanceof UpperASCII) {
// //         mapping[token.letter] = conclusion.right.slice(j);
// //       }
// //     } else {
// //       while (conclusion.right)
// //     }
// //   }

// //   console.log(mapping);

// //   return true;
// // }

// export { Rule };
