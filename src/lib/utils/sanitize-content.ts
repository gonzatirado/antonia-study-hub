const INJECTION_PATTERNS = [
  /^(ignore|forget|disregard)\s+(all\s+)?(previous|prior|above)/i,
  /^you\s+are\s+now/i,
  /^(system|assistant):\s/i,
  /^(new\s+)?instructions?:\s/i,
];

export function sanitizeAIContent(content: string): string {
  const lines = content.split('\n');
  if (lines.length > 10000) {
    throw new Error('Content has too many lines (max 10,000)');
  }
  return lines
    .filter(line => !INJECTION_PATTERNS.some(p => p.test(line.trim())))
    .join('\n');
}
