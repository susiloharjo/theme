/**
 * Projection Builder - Aggregates data from various sources into search_index table
 * Each projection flattens and standardizes data from source modules
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock data projections (expanded for testing)
const mockData = {
    customers: [
        { objectType: 'CRM', objectId: 'c1', referenceNo: 'CUST-001', title: 'TechSolutions Inc.', subtitle: 'Technology', description: 'Enterprise software client in Jakarta', status: 'active', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 500000000, currency: 'IDR', datePrimary: new Date('2023-01-01'), tags: ['technology', 'enterprise'], searchText: 'TechSolutions Inc. Technology Enterprise software Jakarta', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c2', referenceNo: 'CUST-002', title: 'Global Corp', subtitle: 'Manufacturing', description: 'Large manufacturing company in Surabaya', status: 'active', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', amount: 1200000000, currency: 'IDR', datePrimary: new Date('2023-02-15'), tags: ['manufacturing'], searchText: 'Global Corp Manufacturing Surabaya', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c3', referenceNo: 'CUST-003', title: 'Retail Giant Ltd', subtitle: 'Retail', description: 'Major retail chain in Bandung', status: 'prospect', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 300000000, currency: 'IDR', datePrimary: new Date('2023-11-20'), tags: ['retail'], searchText: 'Retail Giant Ltd Bandung', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c4', referenceNo: 'CUST-004', title: 'Bank Mandiri Digital', subtitle: 'Banking', description: 'Digital banking transformation project', status: 'active', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 2500000000, currency: 'IDR', datePrimary: new Date('2023-05-10'), tags: ['banking', 'fintech'], searchText: 'Bank Mandiri Digital Banking fintech', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c5', referenceNo: 'CUST-005', title: 'Telkom Indonesia', subtitle: 'Telecommunications', description: 'National telecom provider network upgrade', status: 'active', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', amount: 5000000000, currency: 'IDR', datePrimary: new Date('2022-12-01'), tags: ['telecom', 'network'], searchText: 'Telkom Indonesia Telecommunications', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c6', referenceNo: 'CUST-006', title: 'Pertamina Energy', subtitle: 'Oil & Gas', description: 'Oil and gas exploration systems', status: 'active', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 8000000000, currency: 'IDR', datePrimary: new Date('2023-03-20'), tags: ['energy', 'oil'], searchText: 'Pertamina Energy Oil Gas exploration', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'c7', referenceNo: 'CUST-007', title: 'Tokopedia Marketplace', subtitle: 'E-commerce', description: 'E-commerce platform integration', status: 'prospect', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', amount: 1500000000, currency: 'IDR', datePrimary: new Date('2024-01-05'), tags: ['ecommerce', 'marketplace'], searchText: 'Tokopedia Marketplace E-commerce', permissions: ['sales'] },
    ],
    opportunities: [
        { objectType: 'CRM', objectId: 'o1', referenceNo: 'OPP-001', title: 'Q4 Software License Expansion', subtitle: 'TechSolutions Inc.', description: 'Expansion of software licenses for the engineering team', status: 'Proposal', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 50000000, currency: 'IDR', datePrimary: new Date('2023-11-01'), tags: ['license'], searchText: 'Software License Expansion', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'o2', referenceNo: 'OPP-002', title: 'Factory Automation Project', subtitle: 'Global Corp', description: 'Full factory automation implementation', status: 'Negotiation', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', amount: 250000000, currency: 'IDR', datePrimary: new Date('2023-10-15'), tags: ['automation'], searchText: 'Factory Automation Project', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'o3', referenceNo: 'OPP-003', title: 'Cloud Migration Services', subtitle: 'Bank Mandiri', description: 'AWS cloud migration for core banking', status: 'Proposal', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 750000000, currency: 'IDR', datePrimary: new Date('2024-01-10'), tags: ['cloud', 'aws'], searchText: 'Cloud Migration AWS banking', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'o4', referenceNo: 'OPP-004', title: 'Cybersecurity Implementation', subtitle: 'Telkom Indonesia', description: 'Network security and SOC setup', status: 'Won', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', amount: 1200000000, currency: 'IDR', datePrimary: new Date('2023-09-01'), tags: ['security', 'network'], searchText: 'Cybersecurity SOC security', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'o5', referenceNo: 'OPP-005', title: 'Mobile App Development', subtitle: 'Tokopedia', description: 'New mobile application for sellers', status: 'Proposal', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', amount: 350000000, currency: 'IDR', datePrimary: new Date('2024-02-01'), tags: ['mobile', 'app'], searchText: 'Mobile App Development aplikasi', permissions: ['sales'] },
    ],
    leads: [
        { objectType: 'CRM', objectId: 'l1', referenceNo: 'LEAD-001', title: 'Future Tech Ltd', subtitle: 'Website Lead', description: 'Interested in ERP module', status: 'Qualified', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', tags: ['erp'], searchText: 'Future Tech ERP module', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'l2', referenceNo: 'LEAD-002', title: 'Mega Industries', subtitle: 'LinkedIn Lead', description: 'Looking for HR solution', status: 'New', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', tags: ['hr'], searchText: 'Mega Industries HR solution', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'l3', referenceNo: 'LEAD-003', title: 'Astra International', subtitle: 'Referral', description: 'Automotive supply chain management', status: 'Contacted', ownerId: 'u1', ownerName: 'John Sales', department: 'Sales', tags: ['automotive'], searchText: 'Astra International Automotive supply chain', permissions: ['sales'] },
        { objectType: 'CRM', objectId: 'l4', referenceNo: 'LEAD-004', title: 'Indofood Group', subtitle: 'Event Lead', description: 'Food manufacturing ERP needs', status: 'Qualified', ownerId: 'u2', ownerName: 'Jane Manager', department: 'Sales', tags: ['food', 'manufacturing'], searchText: 'Indofood Food manufacturing ERP', permissions: ['sales'] },
    ],
    projects: [
        { objectType: 'PMO', objectId: 'p1', referenceNo: 'PRJ-2024-001', title: 'Sunrise Tower Development', subtitle: 'Commercial Building', description: '45-story commercial tower in Jakarta CBD', status: 'In Progress', ownerId: 'pm1', ownerName: 'Michael Chen', department: 'PMO', amount: 850000000000, currency: 'IDR', datePrimary: new Date('2023-03-15'), tags: ['construction', 'jakarta'], searchText: 'Sunrise Tower Commercial Jakarta CBD', permissions: ['pmo'] },
        { objectType: 'PMO', objectId: 'p2', referenceNo: 'PRJ-2024-002', title: 'Green Valley Industrial', subtitle: 'Industrial Complex', description: 'Industrial manufacturing complex in Cikarang', status: 'In Planning', ownerId: 'pm2', ownerName: 'Sarah Kim', department: 'PMO', amount: 420000000000, currency: 'IDR', datePrimary: new Date('2024-01-10'), tags: ['industrial', 'cikarang'], searchText: 'Green Valley Industrial Cikarang', permissions: ['pmo'] },
        { objectType: 'PMO', objectId: 'p3', referenceNo: 'PRJ-2024-003', title: 'MRT Extension Phase 3', subtitle: 'Infrastructure', description: 'Mass Rapid Transit extension to Tangerang', status: 'In Progress', ownerId: 'pm1', ownerName: 'Michael Chen', department: 'PMO', amount: 15000000000000, currency: 'IDR', datePrimary: new Date('2023-06-01'), tags: ['transportation', 'infrastructure'], searchText: 'MRT Extension Transportation Infrastructure Tangerang', permissions: ['pmo'] },
        { objectType: 'PMO', objectId: 'p4', referenceNo: 'PRJ-2024-004', title: 'Hospital Renovation PIK', subtitle: 'Healthcare', description: 'Hospital renovation and expansion project', status: 'In Planning', ownerId: 'pm2', ownerName: 'Sarah Kim', department: 'PMO', amount: 250000000000, currency: 'IDR', datePrimary: new Date('2024-02-20'), tags: ['healthcare', 'renovation'], searchText: 'Hospital Renovation Healthcare PIK', permissions: ['pmo'] },
        { objectType: 'PMO', objectId: 'p5', referenceNo: 'PRJ-2024-005', title: 'Data Center Construction', subtitle: 'Technology', description: 'Tier-4 data center in Batam', status: 'In Progress', ownerId: 'pm1', ownerName: 'Michael Chen', department: 'PMO', amount: 500000000000, currency: 'IDR', datePrimary: new Date('2023-09-15'), tags: ['datacenter', 'technology'], searchText: 'Data Center Technology Batam', permissions: ['pmo'] },
        { objectType: 'PMO', objectId: 'p6', referenceNo: 'PRJ-2024-006', title: 'Apartment Complex BSD', subtitle: 'Residential', description: 'Luxury apartment complex in BSD City', status: 'Completed', ownerId: 'pm2', ownerName: 'Sarah Kim', department: 'PMO', amount: 320000000000, currency: 'IDR', datePrimary: new Date('2022-01-10'), tags: ['residential', 'apartment'], searchText: 'Apartment Complex BSD Residential', permissions: ['pmo'] },
    ],
    trainingRequests: [
        { objectType: 'Training', objectId: 't1', referenceNo: 'TR-2024-001', title: 'Angular Advanced Training', subtitle: 'Technical Training', description: 'Advanced Angular framework training for development team', status: 'Approved', ownerId: 'e1', ownerName: 'Ahmad Wijaya', department: 'IT', amount: 15000000, currency: 'IDR', datePrimary: new Date('2024-02-15'), tags: ['angular', 'technical'], searchText: 'Angular Advanced Training Technical kursus', permissions: ['hr'] },
        { objectType: 'Training', objectId: 't2', referenceNo: 'TR-2024-002', title: 'Project Management Professional', subtitle: 'Certification', description: 'PMP certification training program', status: 'Pending', ownerId: 'e2', ownerName: 'Budi Santoso', department: 'PMO', amount: 25000000, currency: 'IDR', datePrimary: new Date('2024-03-01'), tags: ['pmp', 'certification'], searchText: 'Project Management Professional PMP pelatihan', permissions: ['hr'] },
        { objectType: 'Training', objectId: 't3', referenceNo: 'TR-2024-003', title: 'AWS Cloud Practitioner', subtitle: 'Cloud Training', description: 'AWS certification for IT team', status: 'Approved', ownerId: 'e3', ownerName: 'Dewi Lestari', department: 'IT', amount: 18000000, currency: 'IDR', datePrimary: new Date('2024-02-20'), tags: ['aws', 'cloud'], searchText: 'AWS Cloud Practitioner Training kursus', permissions: ['hr'] },
        { objectType: 'Training', objectId: 't4', referenceNo: 'TR-2024-004', title: 'Leadership Development', subtitle: 'Soft Skills', description: 'Leadership training for managers', status: 'Completed', ownerId: 'e4', ownerName: 'Rina Kartika', department: 'HR', amount: 30000000, currency: 'IDR', datePrimary: new Date('2024-01-15'), tags: ['leadership', 'management'], searchText: 'Leadership Development Training pelatihan manager', permissions: ['hr'] },
        { objectType: 'Training', objectId: 't5', referenceNo: 'TR-2024-005', title: 'Data Science Bootcamp', subtitle: 'Technical Training', description: 'Python and machine learning training', status: 'Pending', ownerId: 'e5', ownerName: 'Fajar Nugroho', department: 'IT', amount: 45000000, currency: 'IDR', datePrimary: new Date('2024-04-01'), tags: ['datascience', 'python'], searchText: 'Data Science Bootcamp Python Machine Learning kursus', permissions: ['hr'] },
        { objectType: 'Training', objectId: 't6', referenceNo: 'TR-2024-006', title: 'Excel Advanced Workshop', subtitle: 'Office Skills', description: 'Advanced Excel for finance team', status: 'Approved', ownerId: 'e6', ownerName: 'Sari Indah', department: 'Finance', amount: 8000000, currency: 'IDR', datePrimary: new Date('2024-02-28'), tags: ['excel', 'office'], searchText: 'Excel Advanced Workshop Finance pelatihan', permissions: ['hr'] },
    ],
    purchaseRequests: [
        { objectType: 'Purchase', objectId: 'pr1', referenceNo: 'PR-2024-001', title: 'Office Equipment Procurement', subtitle: 'IT Equipment', description: 'Laptops and monitors for new hires', status: 'Pending', ownerId: 'e2', ownerName: 'Budi Santoso', department: 'Procurement', amount: 75000000, currency: 'IDR', datePrimary: new Date('2024-01-20'), tags: ['equipment', 'laptop'], searchText: 'Office Equipment Procurement Laptops monitors pembelian', permissions: ['procurement'] },
        { objectType: 'Purchase', objectId: 'pr2', referenceNo: 'PR-2024-002', title: 'Server Infrastructure', subtitle: 'Data Center', description: 'New servers for data center expansion', status: 'Approved', ownerId: 'e3', ownerName: 'Dewi Lestari', department: 'IT', amount: 500000000, currency: 'IDR', datePrimary: new Date('2024-02-01'), tags: ['server', 'infrastructure'], searchText: 'Server Infrastructure Data Center pembelian', permissions: ['procurement'] },
        { objectType: 'Purchase', objectId: 'pr3', referenceNo: 'PR-2024-003', title: 'Office Furniture', subtitle: 'Facilities', description: 'Ergonomic chairs and standing desks', status: 'Pending', ownerId: 'e4', ownerName: 'Rina Kartika', department: 'HR', amount: 120000000, currency: 'IDR', datePrimary: new Date('2024-02-10'), tags: ['furniture', 'office'], searchText: 'Office Furniture Ergonomic chairs desks pembelian', permissions: ['procurement'] },
        { objectType: 'Purchase', objectId: 'pr4', referenceNo: 'PR-2024-004', title: 'Software Licenses', subtitle: 'IT Software', description: 'Microsoft 365 and Adobe licenses renewal', status: 'Approved', ownerId: 'e5', ownerName: 'Fajar Nugroho', department: 'IT', amount: 250000000, currency: 'IDR', datePrimary: new Date('2024-01-25'), tags: ['software', 'license'], searchText: 'Software Licenses Microsoft Adobe pembelian aplikasi', permissions: ['procurement'] },
        { objectType: 'Purchase', objectId: 'pr5', referenceNo: 'PR-2024-005', title: 'Company Vehicle Fleet', subtitle: 'Transportation', description: 'New vehicles for sales team', status: 'In Review', ownerId: 'e6', ownerName: 'Sari Indah', department: 'Procurement', amount: 1500000000, currency: 'IDR', datePrimary: new Date('2024-02-15'), tags: ['vehicle', 'fleet'], searchText: 'Company Vehicle Fleet Transportation pembelian mobil', permissions: ['procurement'] },
        { objectType: 'Purchase', objectId: 'pr6', referenceNo: 'PR-2024-006', title: 'Security Cameras System', subtitle: 'Security', description: 'CCTV system for all office locations', status: 'Pending', ownerId: 'e1', ownerName: 'Ahmad Wijaya', department: 'Facilities', amount: 85000000, currency: 'IDR', datePrimary: new Date('2024-02-20'), tags: ['security', 'cctv'], searchText: 'Security Cameras CCTV System pembelian', permissions: ['procurement'] },
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

        const allItems = [];

        // 1. Fetch & Map Projects (PMO)
        const projects = await prisma.pmoProject.findMany();
        projects.forEach(p => {
            allItems.push({
                objectType: 'PMO',
                objectId: p.id,
                referenceNo: p.id, // ID is often the reference like "PRJ-001"
                title: p.name,
                subtitle: p.type,
                description: p.description,
                status: p.status,
                ownerName: p.manager,
                department: 'PMO',
                amount: null, // Budget is string in schema, complicate parsing, skip for now or parse
                datePrimary: p.startDate,
                updatedAt: p.updatedAt,
                searchText: `${p.name} ${p.manager} ${p.status} ${p.description || ''} ${p.client || ''}`
            });
        });

        // 2. Fetch & Map Customers (CRM)
        const customers = await prisma.crmCustomer.findMany();
        customers.forEach(c => {
            allItems.push({
                objectType: 'CRM',
                objectId: c.id,
                referenceNo: c.code,
                title: c.name,
                subtitle: c.industry,
                description: `Customer in ${c.industry}`,
                status: c.status,
                ownerName: c.ownerName,
                department: 'Sales',
                amount: c.revenue ? Number(c.revenue) : null,
                datePrimary: c.createdAt,
                updatedAt: c.updatedAt,
                searchText: `${c.name} ${c.industry} ${c.status}`
            });
        });

        // 3. Fetch & Map Opportunities (CRM)
        const opportunities = await prisma.crmOpportunity.findMany();
        opportunities.forEach(o => {
            allItems.push({
                objectType: 'CRM',
                objectId: o.id,
                referenceNo: 'OPP-' + o.id.substring(0, 8),
                title: o.name,
                subtitle: o.account,
                description: `Opportunity for ${o.account}`,
                status: o.stage,
                department: 'Sales',
                amount: o.amount ? Number(o.amount) : null,
                datePrimary: o.closeDate,
                updatedAt: o.updatedAt,
                searchText: `${o.name} ${o.account} ${o.stage}`
            });
        });

        // 4. Fetch & Map Training Sessions (Training)
        const trainings = await prisma.trainingSession.findMany();
        trainings.forEach(t => {
            allItems.push({
                objectType: 'Training',
                objectId: t.id,
                referenceNo: 'TR-' + t.id,
                title: t.topic,
                subtitle: t.provider,
                description: `Training by ${t.provider}`,
                status: t.status,
                department: 'HR',
                datePrimary: t.startDate,
                updatedAt: t.updatedAt,
                searchText: `${t.topic} ${t.provider} ${t.type} ${t.location}`
            });
        });

        // 5. Fetch & Map Purchase Requests (Purchase)
        const purchases = await prisma.purchaseRequest.findMany();
        purchases.forEach(pr => {
            allItems.push({
                objectType: 'Purchase',
                objectId: pr.id,
                referenceNo: pr.id,
                title: pr.title,
                subtitle: pr.department,
                description: `Purchase for ${pr.department}`,
                status: pr.status,
                ownerName: pr.requester,
                department: pr.department,
                amount: pr.totalAmount ? Number(pr.totalAmount) : null,
                datePrimary: pr.requestDate,
                updatedAt: pr.updatedAt,
                searchText: `${pr.title} ${pr.requester} ${pr.department} ${pr.status}`
            });
        });

        console.log(`📥 Fetched ${allItems.length} total items from database`);

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

                    console.log(`  📝 Embedded: ${item.referenceNo || 'ID-' + item.objectId} - ${item.title}`);
                } catch (embErr) {
                    console.warn(`  ⚠️ Embedding failed for ${item.title}:`, embErr.message);
                }
            }
            count++;
        }

        console.log(`✅ Indexed ${count} real items from DB`);
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
