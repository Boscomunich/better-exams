export function chunkText(
  text: string,
  chunkSize = 2000,
  overlap = 200,
): string[] {
  const chunks: string[] = [];

  // Clean the text first
  const cleanedText = text
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .replace(/-- \d+ of \d+ --/g, '') // Remove page markers (optional)
    .trim();

  // Split by sentences for better chunk boundaries
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence would exceed chunkSize, save current chunk
    if (
      (currentChunk + sentence).length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from previous
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // ~5 chars per word
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
