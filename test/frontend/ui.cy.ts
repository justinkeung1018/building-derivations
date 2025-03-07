describe("Inputs", () => {
  it("switches to displaying LaTeX after clicking away", () => {
    cy.visit("/");
    cy.getBySel("tree-conclusion-0").type("abcde");
    cy.getBySel("tree-rule-0").type("abcde");
    // We have clicked away from the conclusion
    cy.getBySel("tree-conclusion-latex-0").should("exist");
    cy.getBySel("tree-add-premise-button-0").click();
    // We have clicked away from the rule name
    cy.getBySel("tree-rule-latex-0").should("exist");
  });
});
