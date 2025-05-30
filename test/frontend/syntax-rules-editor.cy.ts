beforeEach(() => {
  cy.getBySel("custom").click();
  cy.getBySel("start").click();
  cy.getBySel("edit-rules-button").click();
  cy.getBySel("edit-syntax-button").click();
});

it("warns users about left-recursive rules", () => {
  cy.getBySel("syntax-def-0").type("abcdef").blur().wait(100);
  cy.getBySel("add-syntax-button").click();
  cy.getBySel("syntax-placeholders-1").type("A").should("have.value", "A").blur().wait(100);
  cy.getBySel("syntax-def-1").type("Abcd").should("have.value", "Abcd").blur().wait(100);
  cy.getBySel("apply-syntax-button").click();
  cy.contains("Left-recursive");
  cy.getBySel("apply-syntax-button").should("exist");
});
