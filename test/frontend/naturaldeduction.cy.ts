it("correctly verifies a basic derivation tree with natural deduction rules", () => {
  cy.visit("/");
  cy.getBySel("edit-rules-button").click();

  // Add natural deduction syntax
  cy.getBySel("edit-syntax-button").click();

  for (let i = 0; i < 3; i++) {
    cy.getBySel("add-syntax-button").click();
  }

  cy.getBySel("syntax-def-0").type("\\Gamma |- A");
  cy.getBySel("syntax-placeholders-1").type("\\Gamma");
  cy.getBySel("syntax-def-1").type("{{} A {}}");
  cy.getBySel("syntax-placeholders-2").type("A, B");
  cy.getBySel("syntax-def-2").type("\\varphi | (A -> B)");
  cy.getBySel("syntax-placeholders-3").type("\\varphi");
  cy.getBySel("syntax-def-3").type("x | y | z");
  cy.getBySel("apply-syntax-button").click();

  // Add natural deduction inference rules
  cy.getBySel("edit-inference-button").click();

  for (let i = 0; i < 3; i++) {
    cy.getBySel("add-inference-button").click();
  }

  cy.getBySel("inference-name-0").type("Ax");
  cy.getBySel("conclusion-0").type("\\Gamma, A |- A");
  cy.getBySel("inference-name-1").type("\\to I");
  cy.getBySel("add-premise-button-1").click();
  cy.getBySel("premise-1-0").type("\\Gamma, A |- B");
  cy.getBySel("conclusion-1").type("\\Gamma |- (A -> B)");
  cy.getBySel("inference-name-2").type("\\to E");
  cy.getBySel("add-premise-button-2").click();
  cy.getBySel("premise-2-0").type("\\Gamma |- (A -> B)");
  cy.getBySel("add-premise-button-2").click();
  cy.getBySel("premise-2-1").type("\\Gamma |- A");
  cy.getBySel("conclusion-2").type("\\Gamma |- B");
  cy.getBySel("apply-inference-button").click();

  cy.clickOutside();

  // Construct a correct derivation tree
  cy.getBySel("tree-conclusion-0").type("z, (z -> y) |- (x -> y)");
  cy.getBySel("tree-rule-0").type("\\to I");
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-1").type("x, z, (z -> y) |- y");
  cy.getBySel("tree-rule-1").type("\\to E");
  cy.getBySel("tree-add-premise-button-1").click();
  cy.getBySel("tree-conclusion-2").type("x, z, (z -> y) |- (z -> y)");
  cy.getBySel("tree-rule-2").type("Ax");
  cy.getBySel("tree-add-premise-button-1").click();
  cy.getBySel("tree-conclusion-3").type("x, z, (z -> y) |- z");
  cy.getBySel("tree-rule-3").type("Ax");

  cy.derivationIsCorrect();
});
