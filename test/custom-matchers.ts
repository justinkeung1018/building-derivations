import { MessageMap } from "@/lib/types/messagemap";
import prettyFormat from "pretty-format";

expect.extend({
  toContainSubstring(actual: string[], substring: string) {
    return {
      pass: actual.some((x) => x.includes(substring)),
      message: () =>
        `expected list to contain an element with the substring "${substring}"\n\nactual list: ${prettyFormat(actual)}`,
    };
  },
  toEmit(actual: MessageMap, index: number, message: string) {
    return {
      pass: actual.has(index) && actual.get(index).some((x) => x.includes(message)),
      message: () =>
        `expected index ${index} to emit a message with the substring "${message}"\n\nactual messages: ${prettyFormat(actual)}`,
    };
  },
  toEmitOverall(actual: MessageMap, message: string) {
    return {
      pass: actual.getOverall().some((x) => x.includes(message)),
      message: () =>
        `expected an overall message with the substring "${message}"\n\nactual messages: ${prettyFormat(actual)}`,
    };
  },
});
