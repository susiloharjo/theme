/**
 * Embedding Service - Proxy to Agent Search API (Gemini)
 * Replaces local Xenova/transformers to save resources
 */

const AGENT_SEARCH_URL = process.env.AGENT_SEARCH_URL || 'http://agent-search:8000';

/**
 * Initialize - No-op for API proxy
 */
async function initEmbedder() {
    console.log('✅ Embedding service configured (Remote API via Agent Search)');
    return true;
}

/**
 * Generate embedding vector for text via API
 * @param {string} text - Input text
 * @returns {Promise<number[]>} - Vector array
 */
async function generateEmbedding(text) {
    return (await generateEmbeddings([text]))[0];
}

/**
 * Generate embeddings for multiple texts (batch) via API
 * @param {string[]} texts - Array of input texts
 * @returns {Promise<number[][]>} - Array of vectors
 */
async function generateEmbeddings(texts) {
    try {
        const response = await fetch(`${AGENT_SEARCH_URL}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ texts })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embeddings;
    } catch (error) {
        console.error('❌ Error generating embeddings via API:', error.message);
        // Return empty embeddings on failure to prevent crash
        return texts.map(() => []);
    }
}

/**
 * Calculate cosine similarity (utility)
 */
function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
    initEmbedder,
    generateEmbedding,
    generateEmbeddings,
    cosineSimilarity
};
