import "@cypress/code-coverage/support";
import "./commands";

beforeEach(() => {
  cy.visit("/");
});
