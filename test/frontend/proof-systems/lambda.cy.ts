it("correctly verifies a basic derivation tree with Curry type assignment", () => {
  cy.visit("/");
  cy.getBySel("edit-rules-button").click();

  // Add typed lambda calculus syntax
  cy.getBySel("edit-syntax-button").click();

  for (let i = 0; i < 5; i++) {
    cy.getBySel("add-syntax-button").click();
  }

  cy.getBySel("syntax-def-0").type("\\Gamma |- M: A");
  cy.getBySel("syntax-placeholders-1").type("\\Gamma");
  cy.getBySel("syntax-def-1").type("{{} var: A {}}");
  cy.getBySel("syntax-placeholders-2").type("A, B");
  cy.getBySel("syntax-def-2").type("\\varphi | (A -> B)");
  cy.getBySel("syntax-placeholders-3").type("\\varphi");
  cy.getBySel("syntax-def-3").type("1 | 2 | 3");
  cy.getBySel("syntax-placeholders-4").type("var");
  cy.getBySel("syntax-def-4").type("x | y | z");
  cy.getBySel("syntax-placeholders-5").type("M, N");
  cy.getBySel("syntax-def-5").type("var | (\\lambda var. M) | (MN)");
  cy.getBySel("apply-syntax-button").click();

  // Add Curry type assignment rules
  cy.getBySel("edit-inference-button").click();

  for (let i = 0; i < 3; i++) {
    cy.getBySel("add-inference-button").click();
  }

  cy.getBySel("inference-name-0").type("Ax");
  cy.getBySel("conclusion-0").type("\\Gamma, var: A |- var: A");
  cy.getBySel("inference-name-1").type("\\to I");
  cy.getBySel("add-premise-button-1").click();
  cy.getBySel("premise-1-0").type("\\Gamma, var: A |- M: B");
  cy.getBySel("conclusion-1").type("\\Gamma |- (\\lambda var. M): (A -> B)");
  cy.getBySel("inference-name-2").type("\\to E");
  cy.getBySel("add-premise-button-2").click();
  cy.getBySel("premise-2-0").type("\\Gamma |- M: (A -> B)");
  cy.getBySel("add-premise-button-2").click();
  cy.getBySel("premise-2-1").type("\\Gamma |- N: A");
  cy.getBySel("conclusion-2").type("\\Gamma |- (MN): B");
  cy.getBySel("apply-inference-button").click();

  cy.clickOutside();

  cy.getBySel("tree-conclusion-0").click().type("z: 1 |- ((\\lambda x. (\\lambda y. x))z): (2 -> 1)");
  cy.getBySel("tree-rule-0").type("\\to E");
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-1").type("z: 1 |- (\\lambda x. (\\lambda y. x)): (1 -> (2 -> 1))");
  cy.getBySel("tree-rule-1").type("\\to I");
  cy.getBySel("tree-add-premise-button-1").click();
  cy.getBySel("tree-conclusion-2").type("x: 1, z: 1 |- (\\lambda y. x): (2 -> 1)");
  cy.getBySel("tree-rule-2").type("\\to I");
  cy.getBySel("tree-add-premise-button-2").click();
  cy.getBySel("tree-conclusion-3").type("x: 1, y: 2, z: 1 |- x: 1");
  cy.getBySel("tree-rule-3").type("Ax");
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-4").type("z: 1 |- z: 1");
  cy.getBySel("tree-rule-4").type("Ax");
});
