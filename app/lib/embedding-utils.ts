/**
 * Get the length of an embedding, handling different types
 * @param embedding - The embedding data, which could be an array, string, or other type
 * @returns The length of the array, 'string' if it's a string, or 0 for other types
 */
export function getEmbeddingLength(
  embedding: any
): number | 'string' {
  if (Array.isArray(embedding)) {
    return embedding.length;
  }
  
  if (typeof embedding === 'string') {
    return 'string';
  }
  
  return 0;
}