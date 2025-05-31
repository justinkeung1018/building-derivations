export function normalise(text: string): string {
  // Ensures all LaTeX commands (which take no arguments) are followed by exactly one space
  text = text.replace(/\\([^\s]+)\s*/g, "\\$1 ");

  const aliasMap: Record<string, string[]> = {
    "->": ["\\to\\{\\}", "\\to", "→", "\\rightarrow"],
    "|-": ["\\vdash"],
    "\\varnothing": ["\\emptyset"],
  };

  const aliasPairs: [string, string][] = [];
  for (const [string, aliases] of Object.entries(aliasMap)) {
    for (const alias of aliases) {
      aliasPairs.push([string, alias]);
    }
  }
  aliasPairs.sort(([_a, aliasA], [_b, aliasB]) => aliasB.length - aliasA.length); // Sort in descending length of alias

  for (const [string, alias] of aliasPairs) {
    if (alias.startsWith("\\")) {
      // We want to replace complete LaTeX commands, e.g. \toI should not become -> I
      text = text.replaceAll(alias + " ", string + " ");
    } else {
      text = text.replaceAll(alias, string);
    }
  }

  for (const string of Object.keys(aliasMap)) {
    text = text.replaceAll(string, " " + string + " ");
  }

  text = text.replace(/\s+/g, " ");

  return text.trim();
}

export function latexify(text: string): string {
  return normalise(text)
    .replaceAll("|-", "\\vdash")
    .replaceAll("->", "\\to\\{\\}")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("|", "\\ |\\ ");
}
