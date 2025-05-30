it("correctly verifies a basic derivation tree with natural deduction rules", () => {
  cy.getBySel("predefined-natural-deduction").click();
  cy.start();

  // Construct a correct derivation tree
  cy.getBySel("tree-conclusion-0").click().type("z, (z -> y) |- (x -> y)").blur(); // Need to .click() otherwise the text won't be typed and the test will fail
  cy.getBySel("tree-rule-0").type("\\to I").blur();
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-1").type("x, z, (z -> y) |- y").blur();
  cy.getBySel("tree-rule-1").type("\\to E").blur();
  cy.getBySel("tree-add-premise-button-1").click();
  cy.getBySel("tree-conclusion-2").type("x, z, (z -> y) |- (z -> y)").blur();
  cy.getBySel("tree-rule-2").type("Ax").blur();
  cy.getBySel("tree-add-premise-button-1").click();
  cy.getBySel("tree-conclusion-3").type("x, z, (z -> y) |- z").blur();
  cy.getBySel("tree-rule-3").type("Ax").blur();

  cy.derivationIsCorrect();
});
