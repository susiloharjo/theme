const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Cleanup existing data
    await prisma.dashboardWidget.deleteMany();
    await prisma.widgetTemplate.deleteMany();

    console.log('Creating widget templates...');

    // ===== STAT TEMPLATES =====
    const revenueTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Revenue',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Revenue',
                icon: 'dollar-sign',
                color: 'bg-green-500',
                content: { value: '$12.5M', label: 'Total revenue this year' }
            })
        }
    });

    const usersTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Users',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Users',
                icon: 'users',
                color: 'bg-blue-500',
                content: { value: '36K', label: 'Total active users' }
            })
        }
    });

    const visitsTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Visits',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Visits',
                icon: 'eye',
                color: 'bg-purple-500',
                content: { value: '1.2M', label: 'Total site visits' }
            })
        }
    });

    const conversionTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Conversion Rate',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Conversion Rate',
                icon: 'trending-up',
                color: 'bg-indigo-500',
                content: { value: '65.5%', label: 'Current quarter' }
            })
        }
    });

    const ordersTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Orders',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Orders',
                icon: 'cart',
                color: 'bg-orange-500',
                content: { value: '2,543', label: 'This month' }
            })
        }
    });

    const bounceRateTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Bounce Rate',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'Bounce Rate',
                icon: 'activity',
                color: 'bg-red-500',
                content: { value: '42%', label: 'Average bounce rate' }
            })
        }
    });

    // ===== LIST TEMPLATES =====
    const deliveryDelayTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Delivery Status',
            type: 'list',
            defaultConfig: JSON.stringify({
                title: 'Predicted Delivery Delay',
                content: {
                    listItems: [
                        { label: 'On Time', value: '65%', colorClass: 'text-green-600' },
                        { label: 'Delayed', value: '10%', colorClass: 'text-red-600' },
                        { label: 'Invoicing Issue', value: '25%', colorClass: 'text-orange-600' }
                    ],
                    footer: '5 min ago'
                }
            })
        }
    });

    const taskListTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Task Progress',
            type: 'list',
            defaultConfig: JSON.stringify({
                title: 'Project Tasks',
                content: {
                    listItems: [
                        { label: 'Completed', value: '45', colorClass: 'text-green-600' },
                        { label: 'In Progress', value: '12', colorClass: 'text-blue-600' },
                        { label: 'Pending', value: '8', colorClass: 'text-gray-600' }
                    ],
                    footer: 'Updated 2 min ago'
                }
            })
        }
    });

    // ===== CHART TEMPLATES =====
    const salesChartTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Sales Chart',
            type: 'chart',
            defaultConfig: JSON.stringify({
                title: 'Monthly Sales',
                icon: 'pie-chart',
                color: 'bg-blue-500',
                content: {
                    chartType: 'line',
                    data: [12, 19, 15, 25, 22, 30, 28]
                }
            })
        }
    });

    const performanceChartTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Performance Chart',
            type: 'chart',
            defaultConfig: JSON.stringify({
                title: 'Team Performance',
                icon: 'activity',
                color: 'bg-green-500',
                content: {
                    chartType: 'bar',
                    data: [85, 92, 78, 95, 88]
                }
            })
        }
    });

    // ===== SHORTCUT TEMPLATES =====
    const trainingShortcutTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Training Shortcut',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                title: 'Training',
                icon: 'link',
                color: 'bg-indigo-500',
                content: { link: '/training', label: 'Go to Training' }
            })
        }
    });

    const profileShortcutTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'Profile Shortcut',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                title: 'My Profile',
                icon: 'user',
                color: 'bg-purple-500',
                content: { link: '/profile', label: 'View Profile' }
            })
        }
    });

    const crmShortcutTemplate = await prisma.widgetTemplate.create({
        data: {
            name: 'CRM Shortcut',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                title: 'CRM',
                icon: 'users',
                color: 'bg-blue-500',
                content: { link: '/crm', label: 'Open CRM' }
            })
        }
    });

    console.log('Creating dashboard widgets...');

    // ===== DEFAULT DASHBOARD =====
    await prisma.dashboardWidget.createMany({
        data: [
            // Row 1: Stats
            {
                id: 'widget-revenue',
                dashboardId: 'default',
                templateId: revenueTemplate.id,
                x: 0, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Revenue',
                    icon: 'dollar-sign',
                    color: 'bg-green-500',
                    content: { value: '$12.5M' }
                })
            },
            {
                id: 'widget-users',
                dashboardId: 'default',
                templateId: usersTemplate.id,
                x: 2, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Users',
                    icon: 'users',
                    color: 'bg-blue-500',
                    content: { value: '36K' }
                })
            },
            {
                id: 'widget-visits',
                dashboardId: 'default',
                templateId: visitsTemplate.id,
                x: 4, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Visits',
                    icon: 'eye',
                    color: 'bg-purple-500',
                    content: { value: '1.2M' }
                })
            },

            // Row 2: Delivery Status List + Conversion Stat
            {
                id: 'widget-delivery',
                dashboardId: 'default',
                templateId: deliveryDelayTemplate.id,
                x: 0, y: 2, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Predicted Delivery Delay',
                    content: {
                        listItems: [
                            { label: 'On Time', value: '65%', colorClass: 'text-green-600' },
                            { label: 'Delayed', value: '10%', colorClass: 'text-red-600' },
                            { label: 'Invoicing Issue', value: '25%', colorClass: 'text-orange-600' }
                        ],
                        footer: '5 min ago'
                    }
                })
            },
            {
                id: 'widget-conversion',
                dashboardId: 'default',
                templateId: conversionTemplate.id,
                x: 2, y: 2, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Quotation Conversion Rate',
                    icon: 'trending-up',
                    color: 'bg-green-500',
                    content: { value: '65.5 MM' }
                })
            },

            // Row 3: Sales Chart
            {
                id: 'widget-sales-chart',
                dashboardId: 'default',
                templateId: salesChartTemplate.id,
                x: 0, y: 4, w: 3, h: 2,
                config: JSON.stringify({
                    title: 'Monthly Sales',
                    icon: 'pie-chart',
                    color: 'bg-blue-500'
                })
            },

            // Row 3: Shortcuts
            {
                id: 'widget-training',
                dashboardId: 'default',
                templateId: trainingShortcutTemplate.id,
                x: 3, y: 4, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Training Shortcut',
                    icon: 'link',
                    color: 'bg-indigo-500',
                    content: { link: '/training', label: 'Go to Training' },
                    action: { type: 'navigate', payload: '/training' }
                })
            },
            {
                id: 'widget-profile',
                dashboardId: 'default',
                templateId: profileShortcutTemplate.id,
                x: 5, y: 4, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'My Profile',
                    icon: 'user',
                    color: 'bg-purple-500',
                    content: { link: '/profile', label: 'View Profile' },
                    action: { type: 'navigate', payload: '/profile' }
                })
            }
        ]
    });

    // ===== MAIN DASHBOARD =====
    await prisma.dashboardWidget.createMany({
        data: [
            {
                id: 'main-revenue',
                dashboardId: 'main',
                templateId: revenueTemplate.id,
                x: 0, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Revenue',
                    icon: 'dollar-sign',
                    color: 'bg-green-500',
                    content: { value: '$12.5M' }
                })
            },
            {
                id: 'main-orders',
                dashboardId: 'main',
                templateId: ordersTemplate.id,
                x: 2, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Orders',
                    icon: 'cart',
                    color: 'bg-orange-500',
                    content: { value: '2,543' }
                })
            },
            {
                id: 'main-tasks',
                dashboardId: 'main',
                templateId: taskListTemplate.id,
                x: 4, y: 0, w: 2, h: 2,
                config: JSON.stringify({
                    title: 'Project Tasks',
                    content: {
                        listItems: [
                            { label: 'Completed', value: '45', colorClass: 'text-green-600' },
                            { label: 'In Progress', value: '12', colorClass: 'text-blue-600' },
                            { label: 'Pending', value: '8', colorClass: 'text-gray-600' }
                        ],
                        footer: 'Updated 2 min ago'
                    }
                })
            }
        ]
    });

    console.log('✅ Seeding finished successfully!');
    console.log(`Created ${await prisma.widgetTemplate.count()} widget templates`);
    console.log(`Created ${await prisma.dashboardWidget.count()} dashboard widgets`);
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
