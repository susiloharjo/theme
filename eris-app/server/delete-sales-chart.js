const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSalesChart() {
    console.log('Deleting Sales Chart template...\n');

    try {
        // Find the Sales Chart template
        const salesChart = await prisma.widgetTemplate.findFirst({
            where: {
                name: 'Sales Chart',
                type: 'chart'
            },
            include: {
                widgets: true
            }
        });

        if (!salesChart) {
            console.log('❌ Sales Chart template not found');
            return;
        }

        console.log(`Found template: "${salesChart.name}" (ID: ${salesChart.id})`);
        console.log(`Used by ${salesChart.widgets.length} widget(s)`);

        if (salesChart.widgets.length > 0) {
            console.log('\n⚠️  This template is used by widgets. Deleting widgets first...');

            for (const widget of salesChart.widgets) {
                console.log(`  Deleting widget: ${widget.id} on dashboard ${widget.dashboardId}`);
                await prisma.dashboardWidget.delete({
                    where: { id: widget.id }
                });
            }
            console.log('  ✓ All widgets deleted');
        }

        // Delete the template
        await prisma.widgetTemplate.delete({
            where: { id: salesChart.id }
        });

        console.log('\n✅ Sales Chart template deleted successfully!');

        // Show remaining templates
        const remaining = await prisma.widgetTemplate.findMany();
        console.log(`\nRemaining templates: ${remaining.length}`);
        remaining.forEach(t => {
            console.log(`  - ${t.type}: "${t.name}"`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteSalesChart();
