/**
 * Shared language for the anonymous public site.
 *
 * Keep the promise here so page copy, metadata, structured data, and offer
 * summaries cannot quietly drift apart.
 */
export const PUBLIC_CORE_PROMISE =
  'NeedThisDone helps teams and individuals solve technology problems and simplify repeated work with clear, focused solutions.';

export const PUBLIC_BRAND_PROMISE = 'Your vision, brought to life.';
export const PUBLIC_BRAND_TITLE = 'Your Vision, Brought to Life';

export const PUBLIC_SITE_DESCRIPTION = `${PUBLIC_CORE_PROMISE} ${PUBLIC_BRAND_PROMISE}`;
export const PUBLIC_REPORT_FALLBACK =
  'We checked selected website signals. The results show where a closer review may help.';

export const PUBLIC_SENTENCE_TARGET = 20;
export const PUBLIC_SENTENCE_HARD_LIMIT = 25;

/** Terms that are not suitable for generated, owner-facing report copy. */
export const PUBLIC_REPORT_BANNED_TERMS = [
  /\bAI[- ]powered\b/i,
  /\b(?:LLM|RLS|OpenClaw|Hermes|Codex|worktree)\b/i,
  /\b(?:lawsuit|legal risk)\b/i,
  /\b(?:grade|certif(?:y|ication|ied))\b/i,
  /\bsecurity risk\b/i,
];

function stripExemptContent(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/[^\s)]+/gi, ' URL ')
    .replace(/\bwww\.[^\s)]+/gi, ' URL ')
    .replace(/"[^"\n]*"/g, ' quoted website text ')
    .replace(/“[^”\n]*”/g, ' quoted website text ');
}

export function countPublicWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Find sentences over the target length. Code blocks and URLs are exempt,
 * matching the public copy review rules.
 */
export function findLongPublicSentences(
  text: string,
  target = PUBLIC_SENTENCE_TARGET,
): Array<{ sentence: string; words: number }> {
  const clean = stripExemptContent(text);
  const sentences = clean.match(/[^.!?]+(?:[.!?]+|$)/g) || [];

  return sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => ({ sentence, words: countPublicWords(sentence) }))
    .filter(({ words }) => words > target);
}

export function hasBannedPublicReportTerm(text: string): boolean {
  return PUBLIC_REPORT_BANNED_TERMS.some((pattern) => pattern.test(text));
}

export function isPublicCopyWithinLimit(
  text: string,
  target = PUBLIC_SENTENCE_TARGET,
): boolean {
  return findLongPublicSentences(text, target).length === 0;
}

export function isPublicCopyWithinHardLimit(text: string): boolean {
  return isPublicCopyWithinLimit(text, PUBLIC_SENTENCE_HARD_LIMIT);
}

/**
 * Keep optional model prose only when it meets the public language contract.
 * The deterministic fallback remains the source of truth when it does not.
 */
export function acceptPublicGeneratedCopy(text: string | null | undefined, fallback: string): string {
  const candidate = String(text || '').trim();
  if (
    candidate
    && isPublicCopyWithinLimit(candidate)
    && isPublicCopyWithinHardLimit(candidate)
    && !hasBannedPublicReportTerm(candidate)
  ) {
    return candidate;
  }
  return fallback;
}
