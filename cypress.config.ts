import { defineConfig } from "cypress";
import coverageTask from "@cypress/code-coverage/task";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      coverageTask(on, config);
      return config;
    },
    specPattern: "test/frontend/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "test/frontend/support/e2e.{js,jsx,ts,tsx}",
    viewportWidth: 1080,
    video: true,
  },
  env: {
    codeCoverage: {
      reportDir: "cypress-coverage",
      include: ["src/**"],
      exclude: ["src/lib/**"],
    },
  },
});
