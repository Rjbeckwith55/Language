/** Normalize text for fuzzy comparison (Bengali + Latin). */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[।.,!?;:'"()[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein-based similarity ratio 0–1. */
export function similarity(a: string, b: string): number {
  const sa = normalizeText(a);
  const sb = normalizeText(b);
  if (sa === sb) return 1;
  if (!sa.length || !sb.length) return 0;

  const matrix: number[][] = Array.from({ length: sa.length + 1 }, () =>
    Array(sb.length + 1).fill(0),
  );

  for (let i = 0; i <= sa.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= sb.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= sa.length; i++) {
    for (let j = 1; j <= sb.length; j++) {
      const cost = sa[i - 1] === sb[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[sa.length][sb.length];
  const maxLen = Math.max(sa.length, sb.length);
  return 1 - distance / maxLen;
}

export function splitWords(transliteration: string): string[] {
  return transliteration
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
