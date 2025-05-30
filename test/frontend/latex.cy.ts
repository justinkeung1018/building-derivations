describe("LaTeX alternatives are recognised identically", () => {
  it("recognises different names for inference rules", () => {
    cy.on("uncaught:exception", () => {
      return false;
    });

    cy.getBySel("predefined-lambda").click();
    cy.start();

    cy.getBySel("tree-conclusion-0").click().type("\\varnothing |- (\\lambda x. x): (1 -> 1)").blur();
    cy.getBySel("tree-rule-0").type("\\to I").blur();
    cy.getBySel("tree-add-premise-button-0").click();
    cy.getBySel("tree-conclusion-1").type("x:1 |- x:1").blur();
    cy.getBySel("tree-rule-1").type("Ax").blur();
    cy.getBySel("errors-rule-0").should("not.exist");

    cy.getBySel("tree-rule-latex-0").click(); // This line throws an uncaught exception only in Cypress, somehow
    cy.getBySel("tree-rule-0").clear().type("->I").blur();
    cy.getBySel("errors-rule-0").should("not.exist");
  });
});
