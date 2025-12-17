const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const purchases = [
    {
        id: 'PR-2025-001',
        title: 'Data Center Upgrade',
        requester: 'John Doe',
        department: 'IT',
        requestDate: new Date('2025-12-01'),
        totalAmount: 125000000,
        status: 'Completed',
        steps: [
            { id: 1, title: 'Request Creation', desc: 'Draft & Submission', status: 'completed', date: '2025-12-01', details: ['Submitted by Requester'] },
            { id: 2, title: 'Line Manager Approval', desc: 'Operational Validation', status: 'completed', date: '2025-12-02', details: ['Approved by Manager'] },
            { id: 3, title: 'Procurement Review', desc: 'Vendor & Specs Check', status: 'completed', date: '2025-12-03', details: ['Vendor Selected: PT Indocomp'] },
            { id: 4, title: 'Cost Approval', desc: 'Finance/Management', status: 'completed', date: '2025-12-04', details: ['GM Approved'] },
            { id: 5, title: 'PO Issuance', desc: 'Vendor Confirmation', status: 'completed', date: '2025-12-05', details: ['PO-2025-001 Created'] },
            { id: 6, title: 'Delivery & Receiving', desc: 'QC & Goods Receipt', status: 'completed', date: '2025-12-06', details: ['GRN-8821 Received'] },
            { id: 7, title: 'Invoice Verification', desc: '3-Way Matching', status: 'completed', date: '2025-12-07', details: ['Matched with PO'] },
            { id: 8, title: 'Payment Processing', desc: 'Transfer & Closing', status: 'completed', date: '2025-12-08', details: ['Transfer ID: TRX-999'] }
        ]
    },
    {
        id: 'PR-2025-002',
        title: 'Recruitment Agency Fees',
        requester: 'Jane Smith',
        department: 'HR',
        requestDate: new Date('2025-12-05'),
        totalAmount: 15000000,
        status: 'In Progress',
        steps: [] // Simplified for seed
    },
    {
        id: 'PR-2025-003',
        title: 'Forklift Maintenance',
        requester: 'Robert Brown',
        department: 'Operations',
        requestDate: new Date('2025-12-06'),
        totalAmount: 4500000,
        status: 'Rejected',
        steps: []
    },
    {
        id: 'PR-2025-004',
        title: 'Q4 Marketing Campaign',
        requester: 'Alice Johnson',
        department: 'Marketing',
        requestDate: new Date('2025-12-07'),
        totalAmount: 8500000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-005',
        title: 'Office Furniture',
        requester: 'Michael Chen',
        department: 'Finance',
        requestDate: new Date('2025-11-28'),
        totalAmount: 45000000,
        status: 'Completed',
        steps: []
    },
    {
        id: 'PR-2025-006',
        title: 'CRM License Renewal',
        requester: 'Sarah Williams',
        department: 'Sales',
        requestDate: new Date('2025-12-02'),
        totalAmount: 22000000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-007',
        title: 'Development Laptops',
        requester: 'David Lee',
        department: 'IT',
        requestDate: new Date('2025-12-03'),
        totalAmount: 3200000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-008',
        title: 'Warehouse Racking System',
        requester: 'Emma Davis',
        department: 'Operations',
        requestDate: new Date('2025-11-25'),
        totalAmount: 67000000,
        status: 'Completed',
        steps: []
    },
    {
        id: 'PR-2025-009',
        title: 'Event Booth Construction',
        requester: 'James Wilson',
        department: 'Marketing',
        requestDate: new Date('2025-12-04'),
        totalAmount: 12500000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-010',
        title: 'Employee Training Program',
        requester: 'Olivia Martinez',
        department: 'HR',
        requestDate: new Date('2025-12-06'),
        totalAmount: 5800000,
        status: 'Rejected',
        steps: []
    },
    {
        id: 'PR-2025-011',
        title: 'Annual Audit Services',
        requester: 'William Taylor',
        department: 'Finance',
        requestDate: new Date('2025-11-30'),
        totalAmount: 89000000,
        status: 'Completed',
        steps: []
    },
    {
        id: 'PR-2025-012',
        title: 'Sales Team Tablets',
        requester: 'Sophia Anderson',
        department: 'Sales',
        requestDate: new Date('2025-12-05'),
        totalAmount: 18000000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-013',
        title: 'Cloud Server Expansion',
        requester: 'Benjamin Thomas',
        department: 'IT',
        requestDate: new Date('2025-12-07'),
        totalAmount: 9500000,
        status: 'In Progress',
        steps: []
    },
    {
        id: 'PR-2025-014',
        title: 'Fleet Maintenance',
        requester: 'Isabella Garcia',
        department: 'Operations',
        requestDate: new Date('2025-11-29'),
        totalAmount: 34000000,
        status: 'Completed',
        steps: []
    },
    {
        id: 'PR-2025-015',
        title: 'Social Media Ads',
        requester: 'Lucas Rodriguez',
        department: 'Marketing',
        requestDate: new Date('2025-12-06'),
        totalAmount: 7200000,
        status: 'In Progress',
        steps: []
    }
];

async function main() {
    console.log(`🌱 Seeding ${purchases.length} purchases...`);

    for (const p of purchases) {
        await prisma.purchaseRequest.upsert({
            where: { id: p.id },
            update: {}, // Don't overwrite if exists
            create: p
        });
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
