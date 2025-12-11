const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('=== DATABASE CONTENTS ===\n');

    try {
        // Check widget templates
        const templates = await prisma.widgetTemplate.findMany({
            include: {
                widgets: {
                    select: { id: true, dashboardId: true }
                }
            }
        });
        console.log(`📋 Widget Templates: ${templates.length}`);
        templates.forEach(t => {
            console.log(`  - ${t.type}: "${t.name}" (ID: ${t.id})`);
            console.log(`    Used by ${t.widgets.length} widget(s)`);
            if (t.defaultConfig) {
                const config = JSON.parse(t.defaultConfig);
                console.log(`    Config:`, config);
            }
        });

        // Check dashboard widgets
        console.log('\n📊 Dashboard Widgets:');
        const dashboards = await prisma.dashboardWidget.groupBy({
            by: ['dashboardId'],
            _count: true
        });

        for (const dashboard of dashboards) {
            const widgets = await prisma.dashboardWidget.findMany({
                where: { dashboardId: dashboard.dashboardId },
                include: {
                    template: {
                        select: { name: true, type: true }
                    }
                }
            });
            console.log(`\n  Dashboard: "${dashboard.dashboardId}" (${widgets.length} widgets)`);
            widgets.forEach(w => {
                const config = w.config ? JSON.parse(w.config) : {};
                console.log(`    - ${w.id}: ${config.title || 'Untitled'} (${w.template.type})`);
                console.log(`      Position: x=${w.x}, y=${w.y}, w=${w.w}, h=${w.h}`);
                console.log(`      Template: ${w.template.name}`);
            });
        }

        // Check old widgets table (if exists)
        try {
            const oldWidgets = await prisma.widget.findMany();
            if (oldWidgets.length > 0) {
                console.log(`\n⚠️  Old Widgets Table: ${oldWidgets.length} (should be migrated)`);
            }
        } catch (e) {
            // Table might not exist
        }

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
