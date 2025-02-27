export default {
  collectCoverage: true,
  collectCoverageFrom: ["src/lib/**"],
  coverageDirectory: "jest-coverage",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  transform: {
    "\\.ts$": "esbuild-runner/jest",
  },
  verbose: true,
};
