const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Dashboard ID to seed
    const dashboardId = 'default';

    // Cleanup existing data
    await prisma.dashboardWidget.deleteMany();
    await prisma.widgetTemplate.deleteMany();

    // 1. Users Widget Template
    const usersTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Users Widget',
            type: 'stat', // Fixed: was metric
            defaultConfig: JSON.stringify({
                title: 'Users',
                icon: 'users',
                color: 'blue',
                content: {
                    value: '36K',
                    label: 'Total active users'
                }
            })
        }
    });

    // 2. Revenue Widget Template
    const revenueTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Revenue Widget',
            type: 'stat', // Fixed: was metric
            defaultConfig: JSON.stringify({
                title: 'Revenue',
                icon: 'dollar-sign',
                color: 'green',
                content: {
                    value: '$12.5M',
                    label: 'Total revenue this year'
                }
            })
        }
    });

    // 3. Visits Widget Template
    const visitsTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Visits Widget',
            type: 'stat', // Fixed: was metric
            defaultConfig: JSON.stringify({
                title: 'Visits',
                icon: 'eye',
                color: 'purple',
                content: {
                    value: '1.2M',
                    label: 'Total site visits'
                }
            })
        }
    });

    // 4. Bounce Rate Widget Template
    const bounceTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Bounce Rate Widget',
            type: 'stat', // Fixed: was metric
            defaultConfig: JSON.stringify({
                title: 'Bounce Rate',
                icon: 'activity',
                color: 'red',
                content: {
                    value: '42%',
                    label: 'Average bounce rate'
                }
            })
        }
    });

    // 5. Shortcut Widget Template
    const shortcutTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Shortcut Widget',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                title: 'Training Shortcut',
                icon: 'link',
                color: 'bg-indigo-500',
                content: { link: '/training', label: 'Go to Training' }
            })
        }
    });

    // 6. Predicted Delivery Delay (List)
    const deliveryDelayTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Predicted Delivery Delay',
            type: 'list',
            defaultConfig: JSON.stringify({
                title: 'Predicted Delivery Delay',
                content: {
                    listItems: [
                        { label: "On Time", value: "65%", colorClass: "text-green-600" },
                        { label: "Delayed", value: "10%", colorClass: "text-red-600" },
                        { label: "Invoicing Issue", value: "25%", colorClass: "text-orange-600" }
                    ],
                    footer: "5 min ago"
                }
            })
        }
    });

    // 7. Quotation Conversion Rate (Stat)
    const quotationTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Quotation Conversion Rate',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Quotation Conversion Rate',
                icon: 'trending-up',
                color: 'bg-green-100 text-green-600', // Adjusted for styling
                content: {
                    value: '65.5 MM',
                    label: 'Current Quarter'
                }
            })
        }
    });

    // Create Dashboard Instances
    await prisma.dashboardWidget.createMany({
        data: [
            {
                id: 'widget-1',
                dashboardId: dashboardId,
                templateId: usersTemplate.id,
                x: 0, y: 0, w: 1, h: 1,
                config: JSON.stringify({ title: 'Active Members' })
            },
            {
                id: 'widget-2',
                dashboardId: dashboardId,
                templateId: revenueTemplate.id,
                x: 1, y: 0, w: 1, h: 1,
                config: null
            },
            {
                id: 'widget-3',
                dashboardId: dashboardId,
                templateId: visitsTemplate.id,
                x: 2, y: 0, w: 1, h: 1,
                config: null
            },
            {
                id: 'widget-4',
                dashboardId: dashboardId,
                templateId: bounceTemplate.id,
                x: 0, y: 1, w: 1, h: 1,
                config: null
            },
            {
                id: 'widget-5',
                dashboardId: dashboardId,
                templateId: shortcutTemplate.id,
                x: 1, y: 1, w: 2, h: 2,
                config: null
            },
            {
                id: 'widget-6',
                dashboardId: dashboardId,
                templateId: deliveryDelayTemplate.id,
                x: 3, y: 0, w: 2, h: 2,
                config: null
            },
            {
                id: 'widget-7',
                dashboardId: dashboardId,
                templateId: quotationTemplate.id,
                x: 3, y: 2, w: 2, h: 1, // Start small
                config: null
            }
        ]
    });

    console.log('Seeding finished.');
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
