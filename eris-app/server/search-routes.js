/**
 * Search Routes - Super Search API with Hybrid (Keyword + Semantic) Search
 * Provides search, facets, and index management
 */
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { buildSearchIndex } = require('./projection-builder');

const router = express.Router();
const prisma = new PrismaClient();

// Lazy load embedding service
let embeddingService = null;
async function getEmbeddingService() {
    if (embeddingService === null) {
        try {
            embeddingService = require('./embedding-service');
            await embeddingService.initEmbedder();
        } catch (error) {
            console.warn('⚠️ Embedding service not available:', error.message);
            embeddingService = false; // Mark as unavailable
        }
    }
    return embeddingService || null;
}

/**
 * POST /api/search
 * Main search endpoint with ranking and faceting
 */
router.post('/', async (req, res) => {
    try {
        const startTime = Date.now();
        const { query = '', filters = {}, page = 1, size = 20 } = req.body;

        // Build where clause
        const where = {};

        // Apply filters
        if (filters.objectType && filters.objectType.length > 0) {
            where.objectType = { in: filters.objectType };
        }
        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }
        if (filters.ownerId) {
            where.ownerId = filters.ownerId;
        }
        if (filters.department) {
            where.department = filters.department;
        }

        // Date range filter
        if (filters.dateRange) {
            const now = new Date();
            let dateFrom;
            switch (filters.dateRange) {
                case '7days': dateFrom = new Date(now.setDate(now.getDate() - 7)); break;
                case '14days': dateFrom = new Date(now.setDate(now.getDate() - 14)); break;
                case '30days': dateFrom = new Date(now.setDate(now.getDate() - 30)); break;
                case '90days': dateFrom = new Date(now.setDate(now.getDate() - 90)); break;
                case '1year': dateFrom = new Date(now.setFullYear(now.getFullYear() - 1)); break;
                case '3years': dateFrom = new Date(now.setFullYear(now.getFullYear() - 3)); break;
            }
            if (dateFrom) {
                where.datePrimary = { gte: dateFrom };
            }
        }

        // Search query - add OR conditions for keyword search
        const searchQuery = query.trim().toLowerCase();

        // For semantic search, we need to get all items and score them
        // If no query, just get all with filters
        let allResults;
        let semanticResults = null;

        if (searchQuery) {
            // Try semantic search first
            const embedding = await getEmbeddingService();
            if (embedding) {
                try {
                    // Generate embedding for query
                    const queryEmbedding = await embedding.generateEmbedding(searchQuery);
                    const embeddingStr = `[${queryEmbedding.join(',')}]`;

                    // Get semantic matches using pgvector cosine similarity
                    semanticResults = await prisma.$queryRawUnsafe(`
                        SELECT id, 1 - (embedding <=> '${embeddingStr}'::vector) as similarity
                        FROM search_index
                        WHERE embedding IS NOT NULL
                        ORDER BY similarity DESC
                        LIMIT 100
                    `);
                    console.log(`🔍 Semantic search found ${semanticResults.length} matches`);
                } catch (err) {
                    console.warn('⚠️ Semantic search failed, falling back to keyword:', err.message);
                }
            }

            // Keyword search (always run as fallback/hybrid)
            where.OR = [
                { referenceNo: { contains: searchQuery, mode: 'insensitive' } },
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { subtitle: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { searchText: { contains: searchQuery, mode: 'insensitive' } },
                { ownerName: { contains: searchQuery, mode: 'insensitive' } },
                { status: { contains: searchQuery, mode: 'insensitive' } }
            ];
        }

        // Get keyword matches
        allResults = await prisma.searchIndex.findMany({
            where,
            take: 500,
            orderBy: [{ updatedAt: 'desc' }]
        });

        // If keyword search returned nothing but semantic search found matches,
        // load all items and rank purely by semantic score
        if (allResults.length === 0 && semanticResults && semanticResults.length > 0) {
            console.log('📌 No keyword matches, using semantic-only results');
            // Get IDs from semantic results
            const semanticIds = semanticResults.map(r => r.id);
            // Load those items
            allResults = await prisma.searchIndex.findMany({
                where: { id: { in: semanticIds } }
            });
        }

        // Build semantic score map
        const semanticScoreMap = {};
        if (semanticResults) {
            semanticResults.forEach(r => {
                semanticScoreMap[r.id] = parseFloat(r.similarity) || 0;
            });
        }

        // Apply hybrid ranking (keyword + semantic)
        if (searchQuery) {
            allResults = allResults.map(item => {
                let keywordScore = 0;
                let semanticScore = semanticScoreMap[item.id] || 0;

                // Keyword scoring (same as before)
                if (item.referenceNo && item.referenceNo.toLowerCase() === searchQuery) {
                    keywordScore += 1000;
                } else if (item.referenceNo && item.referenceNo.toLowerCase().startsWith(searchQuery)) {
                    keywordScore += 800;
                } else if (item.referenceNo && item.referenceNo.toLowerCase().includes(searchQuery)) {
                    keywordScore += 500;
                }

                if (item.title && item.title.toLowerCase() === searchQuery) {
                    keywordScore += 400;
                } else if (item.title && item.title.toLowerCase().startsWith(searchQuery)) {
                    keywordScore += 200;
                } else if (item.title && item.title.toLowerCase().includes(searchQuery)) {
                    keywordScore += 100;
                }

                if (item.objectId && item.objectId.toLowerCase() === searchQuery) {
                    keywordScore += 50;
                }

                // Status scoring
                if (item.status && item.status.toLowerCase() === searchQuery) {
                    keywordScore += 300; // Exact status match
                } else if (item.status && item.status.toLowerCase().includes(searchQuery)) {
                    keywordScore += 150; // Partial status match
                }

                // Recency bonus
                const daysSinceUpdate = (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                keywordScore += Math.max(0, 10 - daysSinceUpdate);

                // Semantic relevance boost: high similarity gets extra points
                let semanticBoost = 0;
                if (semanticScore > 0.7) semanticBoost = 500;       // Very high relevance
                else if (semanticScore > 0.5) semanticBoost = 200;  // High relevance
                else if (semanticScore > 0.3) semanticBoost = 100;  // Medium relevance

                // Indonesian-English term mapping for objectType boost
                const termTypeMap = {
                    'pembelian': 'Purchase', 'beli': 'Purchase', 'procurement': 'Purchase', 'purchase': 'Purchase',
                    'pelatihan': 'Training', 'training': 'Training', 'kursus': 'Training',
                    'proyek': 'PMO', 'project': 'PMO', 'konstruksi': 'PMO', 'construction': 'PMO',
                    'pelanggan': 'CRM', 'customer': 'CRM', 'client': 'CRM', 'klien': 'CRM'
                };
                const matchedType = termTypeMap[searchQuery.trim()];
                if (matchedType && item.objectType === matchedType) {
                    semanticBoost += 1000; // Large boost for matching objectType
                }

                // Title keyword boost for software-related queries
                const softwareTerms = ['aplikasi', 'software', 'application', 'app', 'program', 'licence', 'license'];
                const queryLower = searchQuery.trim().toLowerCase();
                if (softwareTerms.includes(queryLower)) {
                    const titleLower = (item.title || '').toLowerCase() + ' ' + (item.description || '').toLowerCase();
                    if (titleLower.includes('software') || titleLower.includes('license') ||
                        titleLower.includes('application') || titleLower.includes('app')) {
                        semanticBoost += 800; // Boost for software-related content
                    }
                }

                // Hybrid score: 10% keyword + 90% semantic (prioritize meaning)
                const normalizedKeyword = keywordScore / 1000;
                const hybridScore = semanticScore > 0
                    ? (0.1 * normalizedKeyword + 0.9 * semanticScore) * 1000 + semanticBoost
                    : keywordScore;

                return { ...item, _score: hybridScore, _keywordScore: keywordScore, _semanticScore: semanticScore };
            });

            // Sort by hybrid score descending
            allResults.sort((a, b) => b._score - a._score);

            // Filter out low-relevance results based on final score
            // Keep items with good keyword match OR good hybrid score
            if (semanticResults && semanticResults.length > 0) {
                const originalCount = allResults.length;
                // Keep if: keyword score >= 100 OR hybrid score >= 100
                allResults = allResults.filter(r => r._keywordScore >= 100 || r._score >= 100);
                if (allResults.length < originalCount) {
                    console.log(`📉 Filtered ${originalCount - allResults.length} low-relevance items`);
                }
            }
        }

        // Total count from ranked results
        const totalCount = allResults.length;

        // Apply pagination AFTER ranking
        const skip = (page - 1) * size;
        const paginatedResults = allResults.slice(skip, skip + size);

        // Compute facets from ALL results (not just paginated)
        const objectTypeCounts = {};
        const statusCounts = {};
        allResults.forEach(item => {
            if (item.objectType) {
                objectTypeCounts[item.objectType] = (objectTypeCounts[item.objectType] || 0) + 1;
            }
            if (item.status) {
                statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
            }
        });

        const duration = Date.now() - startTime;
        console.log(`Search "${query}" took ${duration}ms, found ${totalCount} results`);

        res.json({
            results: paginatedResults.map(r => ({
                id: r.id,
                objectType: r.objectType,
                objectId: r.objectId,
                referenceNo: r.referenceNo,
                title: r.title,
                subtitle: r.subtitle,
                description: r.description,
                status: r.status,
                ownerId: r.ownerId,
                ownerName: r.ownerName,
                department: r.department,
                amount: r.amount,
                currency: r.currency,
                datePrimary: r.datePrimary,
                dateSecondary: r.dateSecondary,
                tags: r.tags,
                updatedAt: r.updatedAt
            })),
            facets: {
                objectType: Object.entries(objectTypeCounts).map(([value, count]) => ({ value, count })),
                status: Object.entries(statusCounts).map(([value, count]) => ({ value, count }))
            },
            totalCount,
            page,
            size,
            durationMs: duration
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', message: error.message });
    }
});

/**
 * GET /api/search/facets
 * Get all available facet values
 */
router.get('/facets', async (req, res) => {
    try {
        const [objectTypes, statuses, departments, owners] = await Promise.all([
            prisma.searchIndex.groupBy({
                by: ['objectType'],
                _count: { objectType: true }
            }),
            prisma.searchIndex.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.searchIndex.groupBy({
                by: ['department'],
                _count: { department: true }
            }),
            prisma.searchIndex.groupBy({
                by: ['ownerName'],
                _count: { ownerName: true }
            })
        ]);

        res.json({
            objectType: objectTypes.map(f => ({ value: f.objectType, count: f._count.objectType })),
            status: statuses.filter(f => f.status).map(f => ({ value: f.status, count: f._count.status })),
            department: departments.filter(f => f.department).map(f => ({ value: f.department, count: f._count.department })),
            owner: owners.filter(f => f.ownerName).map(f => ({ value: f.ownerName, count: f._count.ownerName }))
        });

    } catch (error) {
        console.error('Facets error:', error);
        res.status(500).json({ error: 'Failed to get facets', message: error.message });
    }
});

/**
 * POST /api/search/rebuild
 * Trigger search index rebuild
 */
router.post('/rebuild', async (req, res) => {
    try {
        const result = await buildSearchIndex();
        res.json({ message: 'Index rebuilt successfully', ...result });
    } catch (error) {
        console.error('Index rebuild error:', error);
        res.status(500).json({ error: 'Index rebuild failed', message: error.message });
    }
});

/**
 * GET /api/search/stats
 * Get index statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalCount = await prisma.searchIndex.count();
        const byType = await prisma.searchIndex.groupBy({
            by: ['objectType'],
            _count: { objectType: true }
        });

        res.json({
            totalCount,
            byType: byType.map(t => ({ type: t.objectType, count: t._count.objectType }))
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats', message: error.message });
    }
});

module.exports = router;
