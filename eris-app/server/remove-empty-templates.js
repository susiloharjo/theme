const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeEmptyTemplates() {
    console.log('Checking for empty or blank templates...\n');

    try {
        const templates = await prisma.widgetTemplate.findMany({
            include: {
                widgets: {
                    select: { id: true, dashboardId: true }
                }
            }
        });

        console.log(`Found ${templates.length} total templates\n`);

        for (const template of templates) {
            const config = template.defaultConfig ? JSON.parse(template.defaultConfig) : {};
            const hasContent = config.title || config.content || config.value;

            console.log(`Template: "${template.name}" (${template.type})`);
            console.log(`  Config:`, config);
            console.log(`  Has content: ${hasContent}`);
            console.log(`  Used by ${template.widgets.length} widgets`);

            // Check if template is essentially empty (no meaningful content)
            if (!hasContent || !config.title) {
                console.log(`  ⚠️  This template appears to be empty/incomplete`);

                if (template.widgets.length === 0) {
                    console.log(`  🗑️  Deleting unused empty template...`);
                    await prisma.widgetTemplate.delete({
                        where: { id: template.id }
                    });
                    console.log(`  ✓ Deleted`);
                } else {
                    console.log(`  ⚠️  Cannot delete - still used by ${template.widgets.length} widgets`);
                }
            }
            console.log('');
        }

        const remaining = await prisma.widgetTemplate.findMany();
        console.log(`\n✅ Cleanup complete. ${remaining.length} templates remaining.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

removeEmptyTemplates();
