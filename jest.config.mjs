export default {
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  transform: {
    "\\.ts$": "esbuild-runner/jest",
  },
  verbose: true,
};
