// Simple token estimation - not perfect but good enough for rate limiting
export function estimateTokens(text: string): number {
  // Average English word is ~4 characters, and ~1.3 tokens
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

export function formatTokenCount(count: number): string {
  return count.toLocaleString();
} 