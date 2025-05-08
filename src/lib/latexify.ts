export function latexify(text: string): string {
  return text
    .replaceAll("|-", "\\vdash")
    .replaceAll("->", "\\to")
    .replaceAll("→", "\\to")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("|", "\\ |\\ ");
}
