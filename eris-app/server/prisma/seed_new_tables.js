const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding new tables...');

    // --- CRM CUSTOMERS ---
    const customers = [
        // Generating ~15 dummy customers
        { code: 'CUST-001', name: 'Acme Corp', industry: 'Manufacturing', status: 'active', ownerName: 'John Doe', lastActivity: new Date('2023-12-10'), revenue: 500000 },
        { code: 'CUST-002', name: 'Globex Inc', industry: 'Technologu', status: 'active', ownerName: 'Jane Smith', lastActivity: new Date('2023-12-12'), revenue: 1200000 },
        { code: 'CUST-003', name: 'Soylent Corp', industry: 'Food & Bev', status: 'dormant', ownerName: 'John Doe', lastActivity: new Date('2023-10-01'), revenue: 50000 },
        { code: 'CUST-004', name: 'Initech', industry: 'Software', status: 'active', ownerName: 'Peter Gibbons', lastActivity: new Date('2023-12-14'), revenue: 750000 },
        { code: 'CUST-005', name: 'Umbrella Corp', industry: 'Pharma', status: 'blocked', ownerName: 'Albert Wesker', lastActivity: new Date('2023-11-20'), revenue: 9000000 },
        { code: 'CUST-006', name: 'Stark Ind', industry: 'Defense', status: 'active', ownerName: 'Tony Stark', lastActivity: new Date('2023-12-15'), revenue: 50000000 },
        { code: 'CUST-007', name: 'Wayne Ent', industry: 'Conglomerate', status: 'active', ownerName: 'Bruce Wayne', lastActivity: new Date('2023-12-01'), revenue: 45000000 },
        { code: 'CUST-008', name: 'Cyberdyne', industry: 'Technology', status: 'prospect', ownerName: 'Miles Dyson', lastActivity: new Date('2023-09-10'), revenue: 0 },
        { code: 'CUST-009', name: 'Massive Dynamic', industry: 'Science', status: 'active', ownerName: 'William Bell', lastActivity: new Date('2023-11-15'), revenue: 3000000 },
        { code: 'CUST-010', name: 'Hooli', industry: 'Technology', status: 'active', ownerName: 'Gavin Belson', lastActivity: new Date('2023-12-05'), revenue: 800000 },
        { code: 'CUST-011', name: 'Pied Piper', industry: 'Technology', status: 'prospect', ownerName: 'Richard Hendricks', lastActivity: new Date('2023-12-16'), revenue: 10000 },
        { code: 'CUST-012', name: 'E Corp', industry: 'Finance', status: 'active', ownerName: 'Tyrell Wellick', lastActivity: new Date('2023-12-11'), revenue: 99000000 },
        { code: 'CUST-013', name: 'Aperture Science', industry: 'Research', status: 'dormant', ownerName: 'Cave Johnson', lastActivity: new Date('2023-08-20'), revenue: 100000 },
        { code: 'CUST-014', name: 'Black Mesa', industry: 'Research', status: 'active', ownerName: 'Gordon Freeman', lastActivity: new Date('2023-12-08'), revenue: 2000000 },
        { code: 'CUST-015', name: 'Tyrell Corp', industry: 'Biotech', status: 'active', ownerName: 'Eldon Tyrell', lastActivity: new Date('2023-12-02'), revenue: 8500000 },
    ];

    console.log('Seeding Customers...');
    await prisma.crmCustomer.deleteMany({}); // Clean slate
    await prisma.crmCustomer.createMany({ data: customers });


    // --- CRM OPPORTUNITIES ---
    const opportunities = [
        { name: 'Q4 Software License', account: 'TechSolutions Inc.', stage: 'Proposal', amount: 45000, closeDate: new Date('2023-12-15') },
        { name: 'Consulting Project', account: 'Global Corp', stage: 'Negotiation', amount: 120000, closeDate: new Date('2023-11-30') },
        { name: 'Cloud Migration', account: 'StartUp Hub', stage: 'Qualification', amount: 25000, closeDate: new Date('2024-01-20') },
        { name: 'System Integration', account: 'Enterprise Systems', stage: 'Closed Won', amount: 85000, closeDate: new Date('2023-10-15') },
        { name: 'Support Contract', account: 'Cloud Services Ltd', stage: 'Proposal', amount: 15000, closeDate: new Date('2023-12-01') },
        { name: 'Data Analytics Upgrade', account: 'Alpha Inc', stage: 'Qualification', amount: 30000, closeDate: new Date('2024-02-10') },
        { name: 'Security Audit', account: 'Beta Corp', stage: 'Closed Won', amount: 50000, closeDate: new Date('2023-09-01') },
        { name: 'Mobile App Dev', account: 'Gamma Ltd', stage: 'Negotiation', amount: 90000, closeDate: new Date('2024-03-15') },
        { name: 'ERP Implementation', account: 'Delta LLC', stage: 'Proposal', amount: 200000, closeDate: new Date('2024-06-01') },
        { name: 'Training Program', account: 'Epsilon SA', stage: 'Qualification', amount: 10000, closeDate: new Date('2024-01-05') },
        { name: 'Website Redesign', account: 'Zeta Gmbh', stage: 'Closed Won', amount: 15000, closeDate: new Date('2023-11-10') },
        { name: 'IT Infrastructure', account: 'Eta Pvt', stage: 'Negotiation', amount: 60000, closeDate: new Date('2024-04-20') }
    ];

    console.log('Seeding Opportunities...');
    await prisma.crmOpportunity.deleteMany({});
    await prisma.crmOpportunity.createMany({ data: opportunities });


    // --- PMO PROJECTS ---
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
            endDate: new Date('2024-06-30'),
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
            description: 'Construction of a new distribution center in Cikarang industrial estate.',
            client: 'Logistics Dept',
            priority: 'High',
            location: 'Cikarang',
            budgetStats: { timelineProgress: 20, forecastCompletion: 98, burnRateMessage: 'On Track', status: 'On Track' },
            riskStats: { high: 0, med: 1, low: 4 },
            taskStats: { open: 15, inProgress: 8, overdue: 0, completed: 5 },
            team: [
                { name: 'Cindy', role: 'Civil Engineer', avatar: 'https://ui-avatars.com/api/?name=Cindy&background=random' },
                { name: 'Bennett', role: 'Safety Officer', avatar: 'https://ui-avatars.com/api/?name=Bennett&background=random' }
            ],
            suppliers: [
                { name: 'Holcim', service: 'Concrete', status: 'Pending' }
            ],
            activityFeed: [
                { message: 'Project Charter Approved', timestamp: '2 days ago', type: 'success' }
            ],
            risks: [
                { description: 'Workplace Accident', category: 'Safety', probability: 'Medium', impact: 'High', mitigation: 'Strict HSE protocols.', status: 'Active' },
                { description: 'Weather Delays', category: 'Environmental', probability: 'High', impact: 'Medium', mitigation: 'Flexible schedule.', status: 'Active' }
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
            description: 'Social media and SEO campaign for the new product launch.',
            client: 'Marketing Dept',
            priority: 'Medium',
            location: 'Remote',
            budgetStats: { timelineProgress: 100, forecastCompletion: 98, burnRateMessage: 'Underbudget -2%', status: 'Underbudget' },
            riskStats: { high: 0, med: 0, low: 0 },
            taskStats: { open: 0, inProgress: 0, overdue: 0, completed: 25 },
            activityFeed: [{ message: 'Final Report Submitted', timestamp: '1 week ago', type: 'success' }],
            team: [], suppliers: [], risks: []
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
            description: 'Comprehensive review and update of company employment policies.',
            client: 'HR Dept',
            priority: 'Low',
            location: 'Jakarta HQ',
            budgetStats: { timelineProgress: 35, forecastCompletion: 105, burnRateMessage: 'Slight Overspend', status: 'Overspending' },
            riskStats: { high: 1, med: 3, low: 2 },
            taskStats: { open: 8, inProgress: 4, overdue: 2, completed: 12 },
            activityFeed: [{ message: 'Project put on hold pending review', timestamp: '1 month ago', type: 'warning' }],
            team: [], suppliers: [], risks: []
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
            description: 'Development of the customer-facing mobile application.',
            client: 'Retail Div',
            priority: 'High',
            location: 'Bandung Hub',
            budgetStats: { timelineProgress: 40, forecastCompletion: 130, burnRateMessage: 'Overspending +30%', status: 'Overspending' },
            riskStats: { high: 4, med: 2, low: 1 },
            taskStats: { open: 45, inProgress: 15, overdue: 12, completed: 10 },
            activityFeed: [{ message: 'Critical bug reported in login module', timestamp: '1h ago', type: 'warning' }],
            team: [], suppliers: [], risks: []
        },
        {
            id: 'PROJ-006',
            name: 'Customer Loyalty Program',
            manager: 'Dana Scully',
            type: 'Business Development',
            status: 'In Planning',
            progress: 0,
            health: 'Good',
            startDate: new Date('2024-07-01'),
            endDate: new Date('2024-12-31'),
            budget: 'Rp 300,000,000',
            description: 'Designing a new tiered loyalty program.',
            client: 'Sales Dept',
            priority: 'Medium',
            location: 'Jakarta HQ',
            budgetStats: { timelineProgress: 15, forecastCompletion: 95, burnRateMessage: 'Underbudget -5%', status: 'Underbudget' },
            riskStats: { high: 0, med: 2, low: 1 },
            taskStats: { open: 5, inProgress: 2, overdue: 0, completed: 8 },
            activityFeed: [], team: [], suppliers: [], risks: []
        }
    ];

    console.log('Seeding Projects...');
    await prisma.pmoProject.deleteMany({});
    await prisma.pmoProject.createMany({ data: projects });


    // --- TRAINING SESSIONS ---
    const trainings = [
        { id: '1', topic: 'Advanced Angular Development', provider: 'Udemy', type: 'Technical Skills', location: 'Online', startDate: new Date('2024-12-10'), endDate: new Date('2024-12-12'), status: 'Pending Approval', cost: '1,500,000' },
        { id: '2', topic: 'Leadership 101', provider: 'Internal HR', type: 'Management', location: 'Jakarta Office', startDate: new Date('2024-11-05'), endDate: new Date('2024-11-05'), status: 'Approved', cost: 'Free' },
        { id: '3', topic: 'Safety & Compliance 2024', provider: 'E-Learning', type: 'Compliance', location: 'Online', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'In Progress', cost: 'Free' },
        { id: '4', topic: 'Cybersecurity Fundamentals', provider: 'Coursera', type: 'Technical Skills', location: 'Online', startDate: new Date('2024-02-15'), endDate: new Date('2024-02-20'), status: 'Pending Approval', cost: '2,000,000' },
        { id: '5', topic: 'Project Management Professional', provider: 'PMI', type: 'Certification', location: 'Singapore', startDate: new Date('2024-05-10'), endDate: new Date('2024-05-15'), status: 'Approved', cost: '15,000,000' },
        { id: '6', topic: 'Effective Communication', provider: 'Internal HR', type: 'Soft Skills', location: 'Bali Office', startDate: new Date('2024-03-01'), endDate: new Date('2024-03-02'), status: 'In Progress', cost: 'Free' },
        { id: '7', topic: 'Data Analysis with Python', provider: 'DataCamp', type: 'Technical Skills', location: 'Online', startDate: new Date('2024-06-01'), endDate: new Date('2024-06-30'), status: 'Approved', cost: '300,000' },
        { id: '8', topic: 'Conflict Resolution', provider: 'Internal HR', type: 'Soft Skills', location: 'Jakarta Office', startDate: new Date('2024-07-10'), endDate: new Date('2024-07-11'), status: 'Pending Approval', cost: 'Free' },
        { id: '9', topic: 'AWS Solutions Architect', provider: 'A Cloud Guru', type: 'Technical Skills', location: 'Online', startDate: new Date('2024-08-01'), endDate: new Date('2024-09-15'), status: 'In Progress', cost: '2,500,000' },
        { id: '10', topic: 'Agile Methodologies', provider: 'Scrum Alliance', type: 'Certification', location: 'Bandung', startDate: new Date('2024-04-20'), endDate: new Date('2024-04-22'), status: 'Approved', cost: '5,000,000' },
        { id: '11', topic: 'Public Speaking Masterclass', provider: 'Udemy', type: 'Soft Skills', location: 'Online', startDate: new Date('2024-09-05'), endDate: new Date('2024-09-06'), status: 'Pending Approval', cost: '200,000' },
        { id: '12', topic: 'Machine Learning Basics', provider: 'Coursera', type: 'Technical Skills', location: 'Online', startDate: new Date('2024-10-01'), endDate: new Date('2024-11-01'), status: 'In Progress', cost: '1,200,000' },
        { id: '13', topic: 'Time Management', provider: 'Internal HR', type: 'Soft Skills', location: 'Jakarta Office', startDate: new Date('2024-01-15'), endDate: new Date('2024-01-15'), status: 'Approved', cost: 'Free' },
        { id: '14', topic: 'Financial Accounting 101', provider: 'EdX', type: 'Finance', location: 'Online', startDate: new Date('2024-05-01'), endDate: new Date('2024-05-20'), status: 'Pending Approval', cost: '800,000' },
        { id: '15', topic: 'Business English', provider: 'EF', type: 'Language', location: 'Online', startDate: new Date('2024-02-01'), endDate: new Date('2024-04-01'), status: 'Approved', cost: '3,000,000' }
    ];

    console.log('Seeding Training Sessions...');
    await prisma.trainingSession.deleteMany({});
    await prisma.trainingSession.createMany({ data: trainings });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
