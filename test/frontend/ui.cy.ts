describe("Inputs", () => {
  it("switches to displaying LaTeX after clicking away", () => {
    cy.visit("/");
    cy.getBySel("custom").click();
    cy.getBySel("start").click();

    cy.getBySel("tree-conclusion-0").type("abcde").blur();
    cy.getBySel("tree-rule-0").type("abcde").blur();
    // We have clicked away from the conclusion
    cy.getBySel("tree-conclusion-latex-0").should("exist");
    cy.getBySel("tree-add-premise-button-0").click();
    // We have clicked away from the rule name
    cy.getBySel("tree-rule-latex-0").should("exist");
  });
});
