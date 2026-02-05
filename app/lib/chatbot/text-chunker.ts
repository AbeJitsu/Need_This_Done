// ============================================================================
// Text Chunking Utility
// ============================================================================
// What: Splits long text into manageable chunks for embedding
// Why: OpenAI has token limits (~8191 for text-embedding-3-small)
// How: Splits on sentence boundaries with overlap for context continuity

/**
 * A single chunk of text with its position in the original content.
 */
export interface TextChunk {
  text: string;
  index: number;
}

/**
 * Configuration options for text chunking.
 */
export interface ChunkOptions {
  maxChunkSize?: number;   // Maximum characters per chunk (default: 6000)
  overlapSize?: number;    // Characters of overlap between chunks (default: 200)
}

/**
 * Splits text into chunks suitable for embedding generation.
 *
 * The chunker tries to break at sentence boundaries when possible,
 * and includes overlap between chunks so context isn't lost at boundaries.
 *
 * @param text - The full text content to chunk
 * @param options - Chunking configuration
 * @returns Array of text chunks with their indices
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const {
    maxChunkSize = 1500,  // ~300-400 tokens, semantically focused chunks
    overlapSize = 100     // Smaller overlap for focused chunks
  } = options;

  // Normalize whitespace (collapse multiple spaces/newlines)
  const normalized = text.replace(/\s+/g, ' ').trim();

  // If text fits in one chunk, return it directly
  if (normalized.length <= maxChunkSize) {
    return normalized.length > 0 ? [{ text: normalized, index: 0 }] : [];
  }

  const chunks: TextChunk[] = [];
  let startPos = 0;
  let chunkIndex = 0;

  while (startPos < normalized.length) {
    let endPos = startPos + maxChunkSize;

    // Don't exceed text length
    if (endPos >= normalized.length) {
      endPos = normalized.length;
    } else {
      // Try to break at sentence boundary (period followed by space)
      const sentenceEnd = findSentenceBreak(normalized, startPos, endPos);
      if (sentenceEnd > startPos + maxChunkSize / 2) {
        endPos = sentenceEnd;
      } else {
        // Fallback: break at word boundary
        const wordBreak = normalized.lastIndexOf(' ', endPos);
        if (wordBreak > startPos) {
          endPos = wordBreak;
        }
      }
    }

    // Extract and clean the chunk
    const chunk = normalized.substring(startPos, endPos).trim();
    if (chunk.length > 0) {
      chunks.push({ text: chunk, index: chunkIndex++ });
    }

    // Move start position, accounting for overlap
    // Overlap ensures context isn't lost at chunk boundaries
    const nextStart = endPos - overlapSize;
    startPos = Math.max(nextStart, startPos + 1); // Prevent infinite loop

    // Safety check: if we're not making progress, break
    if (startPos >= normalized.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Finds the best sentence break point within a range.
 *
 * @param text - The full text
 * @param start - Start of the range
 * @param end - End of the range
 * @returns Position after the sentence-ending punctuation, or -1 if not found
 */
function findSentenceBreak(text: string, start: number, end: number): number {
  // Look for sentence-ending punctuation followed by space
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];

  let bestBreak = -1;

  for (const ending of sentenceEndings) {
    const pos = text.lastIndexOf(ending, end);
    if (pos > start + (end - start) / 2 && pos > bestBreak) {
      bestBreak = pos + 1; // Include the period, not the space
    }
  }

  return bestBreak;
}

/**
 * Estimates the token count for a given text.
 * Uses a rough approximation (4 characters per token on average).
 *
 * @param text - The text to estimate
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  // OpenAI's tokenizer averages ~4 characters per token for English
  return Math.ceil(text.length / 4);
}
