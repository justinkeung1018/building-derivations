// import { LowerASCII, UpperASCII, UpperGreek } from "@/lib/parsers/parjs/letter";
// import { Sequent } from "@/lib/parsers/parjs/sequent";
// import { Rule } from "@/lib/verifier";

// const action = new Rule(
//   [],
//   new Sequent(
//     [new UpperGreek("Gamma"), ",", new LowerASCII("x"), ":", new UpperASCII("A")],
//     [new LowerASCII("x"), ":", new UpperASCII("A")],
//   )
// )

// const arrowIntroduction = new Rule(
//   [new Sequent(
//     [new UpperGreek("Gamma"), ",", new LowerASCII("x"), ":", new UpperASCII("A")],
//     [new UpperASCII("M"), ":", new UpperASCII("B")],
//   )],
//   new Sequent(
//     [new UpperGreek("Gamma")],
//     ["\\", new LowerASCII("x"), ".", new UpperASCII("M"), ":", new UpperASCII("A"), "->", new UpperASCII("B")],
//   )
// )

// const arrowElimination = new Rule(
//   [new Sequent(
//     [new UpperGreek("Gamma")],
//     [new UpperASCII("M"), ":", new UpperASCII("A"), "->", new UpperASCII("B")],
//   ), new Sequent([new UpperGreek("Gamma")], [new UpperASCII("N"), ":", new UpperASCII("A")])],
//   new Sequent([new UpperGreek("Gamma")], [new UpperASCII("M"), new UpperASCII("N"), ":", new UpperASCII("B")]),
// )
