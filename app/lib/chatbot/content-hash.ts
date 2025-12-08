// ============================================================================
// Content Hashing Utility
// ============================================================================
// What: Generates SHA-256 hash of page content
// Why: Efficient change detection without storing/comparing full text
// How: Uses Web Crypto API (works in both browser and Node.js)

/**
 * Generates a SHA-256 hash of the given content.
 * Used to detect when page content has changed and needs re-indexing.
 *
 * @param content - The text content to hash
 * @returns A hex string representation of the SHA-256 hash
 */
export async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Use crypto.subtle (works in browser and modern Node.js)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Compares a content hash with a stored hash to check if content changed.
 *
 * @param content - The current content
 * @param storedHash - The previously stored hash
 * @returns True if content has changed (hashes don't match)
 */
export async function hasContentChanged(
  content: string,
  storedHash: string
): Promise<boolean> {
  const currentHash = await generateContentHash(content);
  return currentHash !== storedHash;
}
