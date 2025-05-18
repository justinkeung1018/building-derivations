import "jest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainSubstring(substring: string): CustomMatcherResult;
      toEmit(index: number, message: string): CustomMatcherResult;
      toEmitOverall(message: string): CustomMatcherResult;
    }
  }
}
