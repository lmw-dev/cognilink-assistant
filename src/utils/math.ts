/**
 * Calculates the cosine distance between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns The cosine distance between the vectors
 */
export function cosineDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
        return 1;
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    // Convert similarity to distance (1 - similarity)
    return 1 - similarity;
} 