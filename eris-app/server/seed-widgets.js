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
                label: 'New Stat',
                value: '0',
                trend: '+0%',
                trendDirection: 'up',
                icon: 'activity',
                color: 'blue'
            })
        },
        {
            id: 'chart-line-default',
            name: 'Line Chart',
            type: 'chart-line',
            defaultConfig: JSON.stringify({
                title: 'Performance',
                data: [],
                xAxisKey: 'date',
                seriesKey: 'value'
            })
        },
        {
            id: 'chart-bar-default',
            name: 'Bar Chart',
            type: 'chart-bar',
            defaultConfig: JSON.stringify({
                title: 'Comparison',
                data: [],
                xAxisKey: 'category',
                seriesKey: 'value'
            })
        },
        {
            id: 'list-recent-default',
            name: 'Recent Items',
            type: 'list',
            defaultConfig: JSON.stringify({
                title: 'Recent Activity',
                items: []
            })
        },
        {
            id: 'shortcut-default',
            name: 'Shortcut',
            type: 'shortcut',
            defaultConfig: JSON.stringify({
                label: 'Shortcut',
                link: '/dashboard',
                icon: 'link',
                color: 'gray'
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
                        label: 'Total Revenue',
                        value: '$120,500',
                        trend: '+12%',
                        trendDirection: 'up',
                        color: 'green'
                    })
                },
                {
                    id: 'w2',
                    dashboardId: dashboardId,
                    templateId: 'stat-default',
                    x: 3, y: 0, w: 3, h: 2,
                    config: JSON.stringify({
                        label: 'Active Projects',
                        value: '24',
                        trend: '+3',
                        trendDirection: 'up',
                        color: 'blue'
                    })
                },
                {
                    id: 'w3',
                    dashboardId: dashboardId,
                    templateId: 'chart-bar-default',
                    x: 0, y: 2, w: 6, h: 4,
                    config: JSON.stringify({
                        title: 'Monthly Sales'
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
