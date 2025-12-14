/**
 * Projection Builder - Aggregates data from various sources into search_index table
 * Each projection flattens and standardizes data from source modules
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock data projections (mirrors CrmDataService mock data)
const mockData = {
    customers: [
        {
            objectType: 'CRM',
            objectId: 'c1',
            referenceNo: 'CUST-001',
            title: 'TechSolutions Inc.',
            subtitle: 'Technology',
            description: 'Enterprise software client in Jakarta',
            status: 'active',
            ownerId: 'u1',
            ownerName: 'John Sales',
            department: 'Sales',
            amount: 500000000,
            currency: 'IDR',
            datePrimary: new Date('2023-01-01'),
            tags: ['technology', 'enterprise', 'jakarta'],
            searchText: 'CUST-001 TechSolutions Inc. Technology Enterprise software client Jakarta John Sales active',
            permissions: ['sales', 'manager']
        },
        {
            objectType: 'CRM',
            objectId: 'c2',
            referenceNo: 'CUST-002',
            title: 'Global Corp',
            subtitle: 'Manufacturing',
            description: 'Large manufacturing company in Surabaya',
            status: 'active',
            ownerId: 'u2',
            ownerName: 'Jane Manager',
            department: 'Sales',
            amount: 1200000000,
            currency: 'IDR',
            datePrimary: new Date('2023-02-15'),
            tags: ['manufacturing', 'enterprise', 'surabaya'],
            searchText: 'CUST-002 Global Corp Manufacturing Large manufacturing company Surabaya Jane Manager active',
            permissions: ['sales', 'manager']
        },
        {
            objectType: 'CRM',
            objectId: 'c3',
            referenceNo: 'CUST-003',
            title: 'Retail Giant Ltd',
            subtitle: 'Retail',
            description: 'Major retail chain in Bandung',
            status: 'prospect',
            ownerId: 'u1',
            ownerName: 'John Sales',
            department: 'Sales',
            amount: 300000000,
            currency: 'IDR',
            datePrimary: new Date('2023-11-20'),
            tags: ['retail', 'prospect', 'bandung'],
            searchText: 'CUST-003 Retail Giant Ltd Retail Major retail chain Bandung John Sales prospect',
            permissions: ['sales', 'manager']
        }
    ],
    opportunities: [
        {
            objectType: 'CRM',
            objectId: 'o1',
            referenceNo: 'OPP-001',
            title: 'Q4 Software License Expansion',
            subtitle: 'TechSolutions Inc.',
            description: 'Expansion of software licenses for the engineering team',
            status: 'Proposal',
            ownerId: 'u1',
            ownerName: 'John Sales',
            department: 'Sales',
            amount: 50000000,
            currency: 'IDR',
            datePrimary: new Date('2023-11-01'),
            dateSecondary: new Date('2023-12-31'),
            tags: ['opportunity', 'software', 'expansion'],
            searchText: 'OPP-001 Q4 Software License Expansion TechSolutions Inc. Proposal John Sales',
            permissions: ['sales', 'manager']
        },
        {
            objectType: 'CRM',
            objectId: 'o2',
            referenceNo: 'OPP-002',
            title: 'Factory Automation Project',
            subtitle: 'Global Corp',
            description: 'Full factory automation implementation',
            status: 'Negotiation',
            ownerId: 'u2',
            ownerName: 'Jane Manager',
            department: 'Sales',
            amount: 250000000,
            currency: 'IDR',
            datePrimary: new Date('2023-10-15'),
            dateSecondary: new Date('2024-01-15'),
            tags: ['opportunity', 'automation', 'factory'],
            searchText: 'OPP-002 Factory Automation Project Global Corp Negotiation Jane Manager',
            permissions: ['sales', 'manager']
        }
    ],
    leads: [
        {
            objectType: 'CRM',
            objectId: 'l1',
            referenceNo: 'LEAD-001',
            title: 'Future Tech Ltd',
            subtitle: 'Website Lead',
            description: 'Interested in ERP module',
            status: 'Qualified',
            ownerId: 'u1',
            ownerName: 'John Sales',
            department: 'Sales',
            tags: ['lead', 'erp', 'qualified'],
            searchText: 'LEAD-001 Future Tech Ltd Website Lead Interested in ERP module Qualified John Sales',
            permissions: ['sales', 'manager']
        },
        {
            objectType: 'CRM',
            objectId: 'l2',
            referenceNo: 'LEAD-002',
            title: 'Mega Industries',
            subtitle: 'LinkedIn Lead',
            description: 'Looking for HR solution',
            status: 'New',
            ownerId: 'u2',
            ownerName: 'Jane Manager',
            department: 'Sales',
            tags: ['lead', 'hr', 'new'],
            searchText: 'LEAD-002 Mega Industries LinkedIn Lead Looking for HR solution New Jane Manager',
            permissions: ['sales', 'manager']
        }
    ],
    projects: [
        {
            objectType: 'PMO',
            objectId: 'p1',
            referenceNo: 'PRJ-2024-001',
            title: 'Sunrise Tower Development',
            subtitle: 'Commercial Building',
            description: '45-story commercial tower in Jakarta CBD',
            status: 'In Progress',
            ownerId: 'pm1',
            ownerName: 'Michael Chen',
            department: 'PMO',
            amount: 850000000000,
            currency: 'IDR',
            datePrimary: new Date('2023-03-15'),
            dateSecondary: new Date('2025-12-31'),
            tags: ['construction', 'commercial', 'jakarta'],
            searchText: 'PRJ-2024-001 Sunrise Tower Development Commercial Building Jakarta CBD Michael Chen In Progress',
            permissions: ['pmo', 'manager']
        },
        {
            objectType: 'PMO',
            objectId: 'p2',
            referenceNo: 'PRJ-2024-002',
            title: 'Green Valley Industrial',
            subtitle: 'Industrial Complex',
            description: 'Industrial manufacturing complex in Cikarang',
            status: 'In Planning',
            ownerId: 'pm2',
            ownerName: 'Sarah Kim',
            department: 'PMO',
            amount: 420000000000,
            currency: 'IDR',
            datePrimary: new Date('2024-01-10'),
            dateSecondary: new Date('2026-06-30'),
            tags: ['construction', 'industrial', 'cikarang'],
            searchText: 'PRJ-2024-002 Green Valley Industrial Industrial Complex Cikarang Sarah Kim In Planning',
            permissions: ['pmo', 'manager']
        }
    ],
    trainingRequests: [
        {
            objectType: 'Training',
            objectId: 't1',
            referenceNo: 'TR-2024-001',
            title: 'Angular Advanced Training',
            subtitle: 'Technical Training',
            description: 'Advanced Angular framework training for development team',
            status: 'Approved',
            ownerId: 'e1',
            ownerName: 'Ahmad Wijaya',
            department: 'IT',
            amount: 15000000,
            currency: 'IDR',
            datePrimary: new Date('2024-02-15'),
            tags: ['training', 'angular', 'technical'],
            searchText: 'TR-2024-001 Angular Advanced Training Technical Training Ahmad Wijaya Approved',
            permissions: ['hr', 'manager']
        }
    ],
    purchaseRequests: [
        {
            objectType: 'Purchase',
            objectId: 'pr1',
            referenceNo: 'PR-2024-001',
            title: 'Office Equipment Procurement',
            subtitle: 'IT Equipment',
            description: 'Laptops and monitors for new hires',
            status: 'Pending',
            ownerId: 'e2',
            ownerName: 'Budi Santoso',
            department: 'Procurement',
            amount: 75000000,
            currency: 'IDR',
            datePrimary: new Date('2024-01-20'),
            tags: ['purchase', 'equipment', 'it'],
            searchText: 'PR-2024-001 Office Equipment Procurement IT Equipment Laptops monitors Budi Santoso Pending',
            permissions: ['procurement', 'manager']
        }
    ]
};

/**
 * Build search index from all sources with embeddings
 */
async function buildSearchIndex() {
    console.log('🔄 Starting search index rebuild with embeddings...');

    // Lazy load embedding service
    let generateEmbedding = null;
    try {
        const embeddingService = require('./embedding-service');
        generateEmbedding = embeddingService.generateEmbedding;
        console.log('✅ Embedding service loaded');
    } catch (error) {
        console.warn('⚠️ Embedding service not available, skipping semantic indexing');
    }

    try {
        // Clear existing index
        await prisma.searchIndex.deleteMany({});
        console.log('✅ Cleared existing index');

        // Flatten all mock data
        const allItems = [
            ...mockData.customers,
            ...mockData.opportunities,
            ...mockData.leads,
            ...mockData.projects,
            ...mockData.trainingRequests,
            ...mockData.purchaseRequests
        ];

        // Insert all items with embeddings
        let count = 0;
        for (const item of allItems) {
            // Create the search index record first
            const created = await prisma.searchIndex.create({
                data: item
            });

            // Generate and store embedding if available
            if (generateEmbedding) {
                try {
                    // Create text for embedding (combine important fields)
                    const textForEmbedding = [
                        item.title,
                        item.subtitle || '',
                        item.description || '',
                        item.referenceNo || ''
                    ].filter(Boolean).join(' ');

                    const embedding = await generateEmbedding(textForEmbedding);

                    // Store embedding using raw SQL (Prisma doesn't support vector type)
                    const embeddingStr = `[${embedding.join(',')}]`;
                    await prisma.$executeRawUnsafe(`
                        UPDATE search_index 
                        SET embedding = '${embeddingStr}'::vector 
                        WHERE id = '${created.id}'
                    `);

                    count++;
                    console.log(`  📝 Embedded: ${item.referenceNo} - ${item.title}`);
                } catch (embErr) {
                    console.warn(`  ⚠️ Embedding failed for ${item.referenceNo}:`, embErr.message);
                }
            } else {
                count++;
            }
        }

        console.log(`✅ Indexed ${count} items`);
        console.log('🎉 Search index rebuild complete!');

        return { success: true, count };
    } catch (error) {
        console.error('❌ Error building search index:', error);
        throw error;
    }
}

/**
 * Update single item in search index (for real-time updates)
 */
async function updateSearchIndexItem(item) {
    try {
        await prisma.searchIndex.upsert({
            where: {
                id: item.id || `${item.objectType}-${item.objectId}`
            },
            update: item,
            create: item
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating search index item:', error);
        throw error;
    }
}

/**
 * Remove item from search index
 */
async function removeFromSearchIndex(objectType, objectId) {
    try {
        await prisma.searchIndex.deleteMany({
            where: {
                objectType,
                objectId
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error removing from search index:', error);
        throw error;
    }
}

module.exports = {
    buildSearchIndex,
    updateSearchIndexItem,
    removeFromSearchIndex,
    mockData
};

// Run directly if called as script
if (require.main === module) {
    buildSearchIndex()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
