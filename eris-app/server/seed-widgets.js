const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting widget seeding...');

    // 1. Define default Widget Templates
    const templates = [
        {
            id: 'stat-default',
            name: 'Stat Card',
            type: 'stat',
            defaultConfig: JSON.stringify({
                title: 'New Stat',
                value: '0',
                icon: 'activity',
                color: 'text-blue-600',
                content: {
                    trend: '+0%',
                    trendDirection: 'up'
                }
            })
        },
        {
            id: 'chart-line-default',
            name: 'Line Chart',
            type: 'line',
            defaultConfig: JSON.stringify({
                title: 'Performance',
                content: {
                    value1: 'High',
                    value2: 'Low',
                    labelStart: 'Jan',
                    labelEnd: 'Dec'
                }
            })
        },
        {
            id: 'chart-bar-default',
            name: 'Bar Chart',
            type: 'bar',
            defaultConfig: JSON.stringify({
                title: 'Comparison',
                value: '1,250',
                content: {
                    unit: 'Units',
                    footer: 'Last 30 days',
                    chartData: [
                        { value: 40, colorClass: 'bg-blue-300' },
                        { value: 70, colorClass: 'bg-blue-400' },
                        { value: 55, colorClass: 'bg-blue-300' },
                        { value: 85, colorClass: 'bg-blue-500' },
                        { value: 60, colorClass: 'bg-blue-300' }
                    ]
                }
            })
        },
        {
            id: 'list-recent-default',
            name: 'Recent Items',
            type: 'list',
            defaultConfig: JSON.stringify({
                title: 'Recent Activity',
                content: {
                    listItems: [
                        { label: 'Project Alpha', value: 'Active', colorClass: 'text-green-600' },
                        { label: 'Design Review', value: 'Pending', colorClass: 'text-orange-500' },
                        { label: 'Client Meeting', value: 'Today', colorClass: 'text-blue-600' }
                    ],
                    footer: 'View all'
                }
            })
        },
        {
            id: 'picture-default',
            name: 'Picture Frame',
            type: 'picture',
            defaultConfig: JSON.stringify({
                title: 'Gallery',
                content: {
                    src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
                    caption: 'Beautiful View'
                }
            })
        },
        {
            id: 'shortcut-default',
            name: 'Shortcut',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                title: 'Dashboard',
                link: '/dashboard',
                icon: 'link',
                color: 'text-blue-600'
            })
        }
    ];

    // 2. Upsert Templates
    for (const t of templates) {
        await prisma.widgetTemplate.upsert({
            where: { id: t.id },
            update: t,
            create: t
        });
        console.log(`✅ Template synced: ${t.name}`);
    }

    // 3. Optional: Seed Default Dashboard Widgets if empty
    // Check if dashboard widgets exist for default dashboard 'home'
    const dashboardId = 'home';
    const count = await prisma.dashboardWidget.count();

    if (count === 0) {
        console.log('📝 Seeding default dashboard widgets...');

        await prisma.dashboardWidget.createMany({
            data: [
                {
                    id: 'w1',
                    dashboardId: dashboardId,
                    templateId: 'stat-default',
                    x: 0, y: 0, w: 3, h: 2,
                    config: JSON.stringify({
                        title: 'Total Revenue',
                        value: '$120,500',
                        color: 'text-green-600',
                        content: {
                            trend: '+12%',
                            trendDirection: 'up'
                        }
                    })
                },
                {
                    id: 'w2',
                    dashboardId: dashboardId,
                    templateId: 'stat-default',
                    x: 3, y: 0, w: 3, h: 2,
                    config: JSON.stringify({
                        title: 'Active Projects',
                        value: '24',
                        color: 'text-blue-600',
                        content: {
                            trend: '+3',
                            trendDirection: 'up'
                        }
                    })
                },
                {
                    id: 'w3',
                    dashboardId: dashboardId,
                    templateId: 'chart-bar-default',
                    x: 0, y: 2, w: 6, h: 4,
                    config: JSON.stringify({
                        title: 'Monthly Sales',
                        value: '4,500'
                    })
                }
            ]
        });
        console.log('✅ Default dashboard widgets created');
    } else {
        console.log('ℹ️ Dashboard widgets already exist, skipping seed');
    }

    console.log('🌱 Widget seeding completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
