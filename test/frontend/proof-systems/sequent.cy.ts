it("correctly verifies a basic derivation in the sequent calculus", () => {
  cy.getBySel("edit-rules-button").click();
  cy.getBySel("predefined-sequent").click();
  cy.clickOutside();
  // TODO: add a derivation
});
