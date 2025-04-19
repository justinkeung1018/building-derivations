import "jest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toEmit(index: number, message: string): CustomMatcherResult;
      toEmitOverall(message: string): CustomMatcherResult;
      toWarn(index: number, message: string): CustomMatcherResult;
    }
  }
}
