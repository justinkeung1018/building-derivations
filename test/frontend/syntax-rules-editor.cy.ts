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

it("lets me add multiple rules", () => {
  for (let i = 0; i < 10; i++) {
    if (i > 0) {
      cy.getBySel("add-syntax-button").click();
      cy.getBySel(`syntax-placeholders-${i}`)
        .type("a" + String(i))
        .should("have.value", "a" + String(i))
        .blur()
        .wait(300);
    }
    cy.getBySel(`syntax-def-${i}`).type(String(i)).should("have.value", String(i)).blur().wait(300);
  }
  cy.getBySel("apply-syntax-button").wait(300).click().wait(300);
  cy.getBySel("apply-syntax-button").should("not.exist");
});
