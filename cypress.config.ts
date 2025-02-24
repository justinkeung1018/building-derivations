import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "test/frontend/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "test/frontend/support/e2e.{js,jsx,ts,tsx}",
  },
});
