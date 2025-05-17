export class MessageMap extends Map<number, string[]> {
  private overallMessages: string[];

  constructor() {
    super();
    this.overallMessages = [];
  }

  get(index: number): string[] {
    let messages = super.get(index);
    if (messages !== undefined) {
      return messages;
    }
    messages = [];
    this.set(index, messages);
    return messages;
  }

  get size(): number {
    return super.size + this.overallMessages.length;
  }

  push(index: number, message: string) {
    this.get(index).push(message);
  }

  pushOverall(message: string) {
    this.overallMessages.push(message);
  }

  getOverall(): string[] {
    return this.overallMessages;
  }
}

export class ErrorMap extends MessageMap {
  pushError(index: number, error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    this.get(index).push(error.message);
  }
}
