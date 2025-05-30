beforeEach(() => {
  cy.getBySel("predefined-sequent").click();
  cy.start();
});

it("correctly verifies a basic derivation in the sequent calculus", () => {
  // TODO: add a derivation
});

it("fails to verify wrong derivations", () => {
  cy.getBySel("tree-conclusion-0").click().type("(x -> y), x |- y").blur();
  cy.getBySel("tree-rule-0").type("\\to L").blur();
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-1").type("x |- x").blur();
  cy.getBySel("tree-rule-1").type("Ax").blur();
  cy.getBySel("tree-add-premise-button-0").click();
  cy.getBySel("tree-conclusion-2").type("z |- z").blur();
  cy.getBySel("tree-rule-2").type("Ax").blur();

  cy.derivationIsWrong();
});
