it("correctly verifies a basic derivation tree with Curry type assignment", () => {
  cy.getBySel("predefined-lambda").click();
  cy.start();

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

  cy.clickOutside();
  cy.derivationIsCorrect();
});
