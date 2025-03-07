Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add("clickOutside", () => {
  return cy.get("body").click(-50, -50, { force: true });
});

Cypress.Commands.add("derivationIsCorrect", () => {
  return cy.getBySel("container").should("have.css", "background-color", "rgb(236, 252, 203)");
});
