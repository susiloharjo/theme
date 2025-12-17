const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const projects = [
    {
        id: 'PROJ-001',
        name: 'ERP Implementation Phase 1',
        manager: 'Sarah Connor',
        type: 'IT Infrastructure',
        status: 'In Progress',
        progress: 65,
        health: 'Good',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'), // ISO string to Date
        budget: 'Rp 1,500,000,000',
        description: 'Implementation of the core ERP modules including Finance, Procurement, and Inventory. Phase 1 focuses on headquarters rollout.',
        client: 'Internal - Ops',
        priority: 'High',
        location: 'Jakarta HQ',
        budgetStats: {
            timelineProgress: 55,
            forecastCompletion: 115,
            burnRateMessage: 'Overspending +10%',
            status: 'Overspending'
        },
        riskStats: { high: 2, med: 1, low: 3 },
        taskStats: { open: 22, inProgress: 14, overdue: 6, completed: 35 },
        activityFeed: [
            { message: 'Task "Requirement Gathering" completed', timestamp: '2h ago', type: 'success' },
            { message: 'Risk added: Vendor delay potential', timestamp: '4h ago', type: 'warning' },
            { message: 'File uploaded: architecture_v2.pdf', timestamp: 'Yesterday', type: 'info' }
        ],
        team: [
            { name: 'Kyle Reese', role: 'Tech Lead', avatar: 'https://ui-avatars.com/api/?name=Kyle+Reese&background=random' },
            { name: 'T-800', role: 'System Architect', avatar: 'https://ui-avatars.com/api/?name=T+800&background=random' },
            { name: 'John Connor', role: 'Business Analyst', avatar: 'https://ui-avatars.com/api/?name=John+Connor&background=random' }
        ],
        suppliers: [
            { name: 'Oracle Corp', service: 'Software License', status: 'Active' },
            { name: 'AWS', service: 'Cloud Hosting', status: 'Active' }
        ],
        procurements: [
            { id: 'PO-001', item: 'Server Racks', vendor: 'Dell', status: 'Received', amount: 'Rp 250,000,000', date: '2024-02-10' },
            { id: 'PO-002', item: 'Software Licenses', vendor: 'Oracle', status: 'Ordered', amount: 'Rp 500,000,000', date: '2024-03-01' }
        ],
        risks: [
            { description: 'Data Migration Failure', category: 'Operational', probability: 'Medium', impact: 'High', mitigation: 'Full backup and dry run before cutover.', status: 'Active' },
            { description: 'Budget Overrun due to Licensing', category: 'Financial', probability: 'Low', impact: 'Medium', mitigation: 'Fixed price contract negotiated with Oracle.', status: 'Mitigated' },
            { description: 'User Resistance to Change', category: 'Operational', probability: 'High', impact: 'Medium', mitigation: 'Comprehensive training and change management program.', status: 'Active' }
        ]
    },
    {
        id: 'PROJ-002',
        name: 'New Warehouse Construction',
        manager: 'John Matrix',
        type: 'Construction',
        status: 'In Planning',
        progress: 10,
        health: 'Good',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-20'),
        budget: 'Rp 5,000,000,000',
        description: 'Construction of a new distribution center in Cikarang industrial estate. Includes land clearing, foundation, and main structure.',
        client: 'Logistics Dept',
        priority: 'High',
        location: 'Cikarang',
        budgetStats: {
            timelineProgress: 20,
            forecastCompletion: 98,
            burnRateMessage: 'On Track',
            status: 'On Track'
        },
        riskStats: { high: 0, med: 1, low: 4 },
        taskStats: { open: 15, inProgress: 8, overdue: 0, completed: 5 },
        activityFeed: [
            { message: 'Project Charter Approved', timestamp: '2 days ago', type: 'success' }
        ],
        team: [
            { name: 'Cindy', role: 'Civil Engineer', avatar: 'https://ui-avatars.com/api/?name=Cindy&background=random' },
            { name: 'Bennett', role: 'Safety Officer', avatar: 'https://ui-avatars.com/api/?name=Bennett&background=random' }
        ],
        suppliers: [
            { name: 'Holcim', service: 'Concrete', status: 'Pending' },
            { name: 'Krakatau Steel', service: 'Steel Beams', status: 'Active' }
        ],
        risks: [
            { description: 'Workplace Accident', category: 'Safety', probability: 'Medium', impact: 'High', mitigation: 'Strict HSE protocols and daily safety briefings.', status: 'Active' },
            { description: 'Weather Delays', category: 'Environmental', probability: 'High', impact: 'Medium', mitigation: 'Flexible schedule and rain shelters.', status: 'Active' }
        ]
    },
    {
        id: 'PROJ-003',
        name: 'Digital Marketing Campaign Q2',
        manager: 'Ellen Ripley',
        type: 'Marketing',
        status: 'Completed',
        progress: 100,
        health: 'Good',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-30'),
        budget: 'Rp 250,000,000',
        description: 'Social media and SEO campaign for the new product launch. Targeting Gen Z demographic across TikTok and Instagram.',
        client: 'Marketing Dept',
        priority: 'Medium',
        location: 'Remote',
        budgetStats: {
            timelineProgress: 100,
            forecastCompletion: 98,
            burnRateMessage: 'Underbudget -2%',
            status: 'Underbudget'
        },
        riskStats: { high: 0, med: 0, low: 0 },
        taskStats: { open: 0, inProgress: 0, overdue: 0, completed: 25 },
        activityFeed: [
            { message: 'Final Report Submitted', timestamp: '1 week ago', type: 'success' }
        ],
        team: [
            { name: 'Newt', role: 'Content Creator', avatar: 'https://ui-avatars.com/api/?name=Newt&background=random' },
            { name: 'Bishop', role: 'Analytics', avatar: 'https://ui-avatars.com/api/?name=Bishop&background=random' }
        ]
    },
    {
        id: 'PROJ-004',
        name: 'HR Policy Revisions',
        manager: 'Peter Venkman',
        type: 'Internal Process',
        status: 'On Hold',
        progress: 45,
        health: 'At Risk',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-05-30'),
        budget: 'Rp 50,000,000',
        description: 'Comprehensive review and update of company employment policies to align with new labor regulations.',
        client: 'HR Dept',
        priority: 'Low',
        location: 'Jakarta HQ',
        budgetStats: {
            timelineProgress: 35,
            forecastCompletion: 105,
            burnRateMessage: 'Slight Overspend',
            status: 'Overspending'
        },
        riskStats: { high: 1, med: 3, low: 2 },
        taskStats: { open: 8, inProgress: 4, overdue: 2, completed: 12 },
        activityFeed: [
            { message: 'Project put on hold pending review', timestamp: '1 month ago', type: 'warning' }
        ],
        team: [
            { name: 'Egon Spengler', role: 'Legal Advisor', avatar: 'https://ui-avatars.com/api/?name=Egon+Spengler&background=random' },
            { name: 'Dana Barrett', role: 'HR Manager', avatar: 'https://ui-avatars.com/api/?name=Dana+Barrett&background=random' }
        ]
    },
    {
        id: 'PROJ-005',
        name: 'Mobile App Development',
        manager: 'Neo Anderson',
        type: 'Software Development',
        status: 'In Progress',
        progress: 30,
        health: 'Critical',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-11-30'),
        budget: 'Rp 800,000,000',
        description: 'Development of the customer-facing mobile application for iOS and Android. Features include order tracking and loyalty points.',
        client: 'Retail Div',
        priority: 'High',
        location: 'Bandung Hub',
        budgetStats: {
            timelineProgress: 40,
            forecastCompletion: 130,
            burnRateMessage: 'Overspending +30%',
            status: 'Overspending'
        },
        riskStats: { high: 4, med: 2, low: 1 },
        taskStats: { open: 45, inProgress: 15, overdue: 12, completed: 10 },
        activityFeed: [
            { message: 'Critical bug reported in login module', timestamp: '1h ago', type: 'warning' }
        ],
        team: [
            { name: 'Trinity', role: 'UI/UX Designer', avatar: 'https://ui-avatars.com/api/?name=Trinity&background=random' },
            { name: 'Morpheus', role: 'Backend Lead', avatar: 'https://ui-avatars.com/api/?name=Morpheus&background=random' }
        ]
    }
];

const customers = [
    {
        code: 'CUST-001', name: 'TechSolutions Inc.', industry: 'Technology',
        status: 'active', ownerName: 'John Sales',
        revenue: 500000.0, createdAt: new Date('2023-01-01')
    },
    {
        code: 'CUST-002', name: 'Global Corp', industry: 'Manufacturing',
        status: 'active', ownerName: 'Jane Manager',
        revenue: 1200000.0, createdAt: new Date('2023-02-15')
    },
    {
        code: 'CUST-003', name: 'Retail Giant Ltd', industry: 'Retail',
        status: 'prospect', ownerName: 'John Sales',
        revenue: 300000.0, createdAt: new Date('2023-11-20')
    }
];

const opportunities = [
    {
        name: 'Q4 Software License Expansion', account: 'TechSolutions Inc.', stage: 'Proposal',
        amount: 50000000.0, closeDate: new Date('2023-12-31')
    },
    {
        name: 'Factory Automation Project', account: 'Global Corp', stage: 'Negotiation',
        amount: 250000000.0, closeDate: new Date('2024-01-15')
    },
    {
        name: 'New Retail POS System', account: 'Retail Giant Ltd', stage: 'Qualification',
        amount: 75000000.0, closeDate: new Date('2024-02-01')
    }
];

const trainings = [
    {
        id: '1', topic: 'Advanced Angular Development', provider: 'Udemy', type: 'Technical Skills',
        location: 'Online', startDate: new Date('2024-12-10'), endDate: new Date('2024-12-12'),
        status: 'Pending Approval', cost: '1,500,000'
    },
    {
        id: '2', topic: 'Leadership 101', provider: 'Internal HR', type: 'Management',
        location: 'Jakarta Office', startDate: new Date('2024-11-05'), endDate: new Date('2024-11-05'),
        status: 'Approved', cost: 'Free'
    },
    {
        id: '3', topic: 'Safety & Compliance 2024', provider: 'E-Learning', type: 'Compliance',
        location: 'Online', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'),
        status: 'In Progress', cost: 'Free'
    },
    {
        id: '4', topic: 'Cybersecurity Fundamentals', provider: 'Coursera', type: 'Technical Skills',
        location: 'Online', startDate: new Date('2024-02-15'), endDate: new Date('2024-02-20'),
        status: 'Pending Approval', cost: '2,000,000'
    },
    {
        id: '5', topic: 'Project Management Professional', provider: 'PMI', type: 'Certification',
        location: 'Singapore', startDate: new Date('2024-05-10'), endDate: new Date('2024-05-15'),
        status: 'Approved', cost: '15,000,000'
    }
];

async function main() {
    console.log('🌱 Starting Full Seed...');

    // CLEANUP
    console.log('Summary: Cleaning up old data...');
    await prisma.pmoProject.deleteMany();
    await prisma.crmCustomer.deleteMany();
    await prisma.crmOpportunity.deleteMany();
    await prisma.trainingSession.deleteMany();
    await prisma.searchIndex.deleteMany();

    // SEED PMO
    console.log('Seeding Projects...');
    for (const p of projects) {
        await prisma.pmoProject.create({
            data: {
                id: p.id,
                name: p.name,
                manager: p.manager,
                type: p.type,
                status: p.status,
                progress: p.progress,
                health: p.health,
                startDate: p.startDate,
                endDate: p.endDate,
                budget: p.budget,
                description: p.description,
                client: p.client,
                priority: p.priority,
                location: p.location,
                budgetStats: p.budgetStats,
                riskStats: p.riskStats,
                taskStats: p.taskStats,
                team: p.team,
                suppliers: p.suppliers,
                procurements: p.procurements,
                risks: p.risks,
                activityFeed: p.activityFeed
            }
        });

        // Add to Search Index
        await prisma.searchIndex.create({
            data: {
                objectType: 'PMO',
                objectId: p.id,
                referenceNo: p.id,
                title: p.name,
                subtitle: p.type,
                description: p.description,
                status: p.status,
                ownerName: p.manager,
                department: 'PMO',
                amount: parseFloat((p.budget || '0').replace(/[^0-9]/g, '')),
                currency: 'IDR',
                currency: 'IDR',
                datePrimary: p.startDate,
                tags: [p.type.toLowerCase(), p.client.toLowerCase()],
                searchText: `${p.name} ${p.type} ${p.description} ${p.manager} ${p.client}`
            }
        });
    }

    // SEED CRM CUSTOMERS
    console.log('Seeding Customers...');
    for (const c of customers) {
        const created = await prisma.crmCustomer.create({
            data: c
        });

        await prisma.searchIndex.create({
            data: {
                objectType: 'CRM',
                objectId: created.id,
                referenceNo: c.code,
                title: c.name,
                subtitle: c.industry,
                description: `Customer in ${c.industry}`,
                status: c.status,
                ownerName: c.ownerName,
                department: 'Sales',
                amount: c.revenue,
                currency: 'IDR',
                currency: 'IDR',
                datePrimary: c.createdAt,
                tags: [c.industry.toLowerCase()],
                searchText: `${c.name} ${c.code} ${c.industry} ${c.ownerName}`
            }
        });
    }

    // SEED CRM OPPORTUNITIES
    console.log('Seeding Opportunities...');
    for (const o of opportunities) {
        const created = await prisma.crmOpportunity.create({
            data: o
        });

        await prisma.searchIndex.create({
            data: {
                objectType: 'CRM',
                objectId: created.id,
                referenceNo: 'OPP-???',
                title: o.name,
                subtitle: o.account,
                description: `Opportunity for ${o.account}`,
                status: o.stage,
                department: 'Sales',
                amount: o.amount,
                currency: 'IDR',
                currency: 'IDR',
                datePrimary: o.closeDate,
                tags: ['opportunity'],
                searchText: `${o.name} ${o.account} ${o.stage}`
            }
        });
    }

    // SEED TRAINING
    console.log('Seeding Training...');
    for (const t of trainings) {
        await prisma.trainingSession.create({
            data: {
                id: t.id,
                topic: t.topic,
                provider: t.provider,
                type: t.type,
                location: t.location,
                startDate: t.startDate,
                endDate: t.endDate,
                status: t.status,
                cost: t.cost
            }
        });

        // Safe float parse for cost
        let amount = 0;
        if (t.cost && t.cost !== 'Free') {
            amount = parseFloat(t.cost.replace(/[^0-9]/g, ''));
        }

        await prisma.searchIndex.create({
            data: {
                objectType: 'Training',
                objectId: t.id,
                referenceNo: `TR-${t.id}`,
                title: t.topic,
                subtitle: t.provider,
                description: `${t.type} training at ${t.location}`,
                status: t.status,
                department: 'HR',
                amount: amount,
                currency: 'IDR',
                currency: 'IDR',
                datePrimary: t.startDate,
                tags: [t.type.toLowerCase(), t.location.toLowerCase()],
                searchText: `${t.topic} ${t.provider} ${t.type} ${t.location}`
            }
        });
    }

    console.log('✅ Full Seeding Complete!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
