import { MessageMap } from "@/lib/types/messagemap";

expect.extend({
  toEmit(actual: MessageMap, index: number, message: string) {
    return {
      pass: actual.has(index) && actual.get(index).some((x) => x.toLowerCase().includes(message)),
      message: () => `expected index ${index} to emit an error containing "${message}" in the message`,
    };
  },
  toEmitOverall(actual: MessageMap, message: string) {
    return {
      pass: actual.getOverall().some((x) => x.toLowerCase().includes(message)),
      message: () => `expected an overall error containing "${message}" in the message`,
    };
  },
});
