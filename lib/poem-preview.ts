export interface PoemPreviewResult {
  text: string;
  lines: string[];
  truncated: boolean;
}

function normalizePoemLine(line: string): string {
  return line.replace(/[ \t]+/g, " ").trim();
}

export function formatPoemPreview(text: string, maxLines = 4): PoemPreviewResult {
  const normalizedText = text.replace(/\r\n?/g, "\n").trim();
  const meaningfulLines = normalizedText
    .split("\n")
    .map(normalizePoemLine)
    .filter(Boolean);

  const visibleLines = meaningfulLines.slice(0, maxLines);
  const truncated = meaningfulLines.length > maxLines;

  return {
    text: visibleLines.join("\n"),
    lines: visibleLines,
    truncated,
  };
}

export function getPoemPreview(text: string, maxCouplets = 2): PoemPreviewResult {
  return formatPoemPreview(text, maxCouplets * 2);
}
