declare namespace Cypress {
  interface Chainable {
    getBySel(
      selector: string,
      args?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
    ): Chainable<JQuery>;
    clickOutside(): Chainable<JQuery<HTMLBodyElement>>;
    derivationIsCorrect(): Chainable<JQuery>;
  }
}
