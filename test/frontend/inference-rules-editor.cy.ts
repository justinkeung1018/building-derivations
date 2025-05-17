it("lets me add multiple rules", () => {
  cy.getBySel("custom").click();
  cy.getBySel("start").click();
  cy.getBySel("edit-rules-button").click();
  cy.getBySel("edit-inference-button").click();

  for (let i = 0; i < 10; i++) {
    cy.getBySel("add-inference-button").click();
  }

  cy.getBySel("apply-inference-button").click();
});
