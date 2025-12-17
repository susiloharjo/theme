const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const backupTemplates = [
    {
        id: 'a9c28248-a1e0-47fa-b6ee-1d34e195ee43',
        name: 'New Pie Chart',
        type: 'pie',
        defaultConfig: JSON.stringify({
            title: "New Pie Chart",
            icon: null,
            color: null,
            content: { subtitle: "Conversion", target: "100%", footer: "Monthly" }
        })
    },
    {
        id: '874486ba-4816-48cd-8f0d-8163f21b4022',
        name: 'PR Request',
        type: 'shortcut',
        defaultConfig: JSON.stringify({
            title: "PR Request",
            icon: "cart",
            color: "bg-orange-500",
            content: { link: "/purchase/request", label: "Go to Home" }
        })
    },
    {
        id: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3',
        name: 'Team Members',
        type: 'stat',
        defaultConfig: JSON.stringify({
            title: "Team Members",
            icon: "users",
            color: "bg-green-500",
            content: {}
        })
    },
    {
        id: '6980438e-f30b-42eb-b5fc-0c39063a3b1d',
        name: 'New Picture',
        type: 'picture',
        defaultConfig: JSON.stringify({
            title: "New Picture",
            icon: null,
            color: null,
            content: {
                src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80",
                caption: "Office Space"
            }
        })
    },
    {
        id: '8157c8ef-b05d-4ebf-b6b3-3090fc99d802',
        name: 'New List',
        type: 'list',
        defaultConfig: JSON.stringify({
            title: "New List",
            icon: null,
            color: null,
            content: {
                listItems: [
                    { label: "Item 1", value: "100", colorClass: "text-green-600" },
                    { label: "Item 2", value: "50", colorClass: "text-red-600" }
                ],
                footer: "Just now"
            }
        })
    },
    {
        id: '0c2f71fc-6c0a-4356-98b1-8ff3f0bb3607',
        name: 'New Bar Chart',
        type: 'bar',
        defaultConfig: JSON.stringify({
            title: "New Bar Chart",
            icon: null,
            color: null,
            content: {
                subtitle: "Sales",
                unit: "M",
                footer: "YTD",
                chartData: [
                    { value: 30, colorClass: "bg-blue-400" },
                    { value: 60, colorClass: "bg-blue-600" },
                    { value: 45, colorClass: "bg-blue-500" }
                ]
            }
        })
    },
    {
        id: 'cdbd05e1-195f-4d1a-9104-58e47e9eb060',
        name: 'Ext. Sales Commissions',
        type: 'line',
        defaultConfig: JSON.stringify({
            title: "Ext. Sales Commissions",
            icon: null,
            color: null,
            content: {
                value1: "70M",
                value2: "45M",
                labelStart: "June",
                labelEnd: "June 30"
            }
        })
    },
    // Only including ONE "New Widget" to ensure uniqueness as per user preference
    {
        id: 'e67eddd4-0ade-4d1b-910c-83d479f59e83',
        name: 'New Widget',
        type: 'stat',
        defaultConfig: JSON.stringify({ title: "New Widget" })
    }
    // Skipped duplicate 'cc0b81ef...'
];

async function restoreTemplates() {
    console.log('Starting template restore from backup data...');

    try {
        let restoredCount = 0;
        let skippedCount = 0;

        for (const tmpl of backupTemplates) {
            // Check if exists by ID
            const existing = await prisma.widgetTemplate.findUnique({
                where: { id: tmpl.id }
            });

            if (existing) {
                console.log(`- Template "${tmpl.name}" (${tmpl.id}) already exists, skipping.`);
                skippedCount++;
            } else {
                await prisma.widgetTemplate.create({
                    data: {
                        id: tmpl.id,
                        name: tmpl.name,
                        type: tmpl.type,
                        defaultConfig: tmpl.defaultConfig
                    }
                });
                console.log(`+ Restored "${tmpl.name}" (${tmpl.type})`);
                restoredCount++;
            }
        }

        console.log(`\nRestore complete.`);
        console.log(`Restored: ${restoredCount}`);
        console.log(`Skipped: ${skippedCount}`);

        // Show final list
        const all = await prisma.widgetTemplate.findMany();
        console.log(`\nTotal Templates in DB: ${all.length}`);
        all.forEach(t => console.log(`  - ${t.name} (${t.type})`));

    } catch (error) {
        console.error('Error restoring templates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreTemplates();
