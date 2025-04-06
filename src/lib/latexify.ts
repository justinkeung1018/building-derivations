export function latexify(sanitised: string): string {
  return sanitised
    .replaceAll("|-", "\\vdash")
    .replaceAll("->", "\\to")
    .replaceAll("→", "\\to")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}");
}
