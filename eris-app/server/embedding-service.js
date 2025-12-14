/**
 * Embedding Service - Local Multilingual Semantic Search
 * Uses paraphrase-multilingual-MiniLM-L12-v2 for English + Indonesian
 * Model size: ~420MB (cached after first download)
 */

let pipeline = null;
let embedder = null;

/**
 * Initialize the embedding model (lazy load)
 */
async function initEmbedder() {
    if (embedder) return embedder;

    console.log('🔄 Loading multilingual embedding model (first time may take a while)...');

    // Dynamic import for ES module
    const { pipeline: pipelineFn } = await import('@xenova/transformers');
    pipeline = pipelineFn;

    // Load multilingual model - supports 50+ languages including Indonesian
    embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', {
        quantized: true // Use quantized version for smaller size
    });

    console.log('✅ Embedding model loaded successfully');
    return embedder;
}

/**
 * Generate embedding vector for text
 * @param {string} text - Input text (English or Indonesian)
 * @returns {Promise<number[]>} - 384-dimensional vector
 */
async function generateEmbedding(text) {
    const model = await initEmbedder();

    // Truncate text if too long (max ~512 tokens)
    const truncatedText = text.slice(0, 1000);

    const output = await model(truncatedText, {
        pooling: 'mean',
        normalize: true
    });

    // Convert to regular array
    return Array.from(output.data);
}

/**
 * Generate embeddings for multiple texts (batch)
 * @param {string[]} texts - Array of input texts
 * @returns {Promise<number[][]>} - Array of 384-dimensional vectors
 */
async function generateEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
        const embedding = await generateEmbedding(text);
        embeddings.push(embedding);
    }
    return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;

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
