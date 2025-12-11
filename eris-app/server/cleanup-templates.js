const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateTemplates() {
    console.log('Starting template cleanup...\n');

    try {
        // Get all templates
        const allTemplates = await prisma.widgetTemplate.findMany({
            include: {
                widgets: {
                    select: { id: true, dashboardId: true }
                }
            }
        });

        console.log(`Found ${allTemplates.length} total templates\n`);

        // Group templates by type
        const templatesByType = {};
        for (const template of allTemplates) {
            if (!templatesByType[template.type]) {
                templatesByType[template.type] = [];
            }
            templatesByType[template.type].push(template);
        }

        // For each type, keep only one template and migrate widgets
        for (const [type, templates] of Object.entries(templatesByType)) {
            console.log(`\n--- Processing type: ${type} ---`);
            console.log(`Found ${templates.length} templates of this type`);

            if (templates.length <= 1) {
                console.log(`Only 1 template, skipping...`);
                continue;
            }

            // Sort by creation (oldest first) and pick the first one to keep
            templates.sort((a, b) => a.id.localeCompare(b.id));
            const templateToKeep = templates[0];
            const templatesToDelete = templates.slice(1);

            console.log(`Keeping template: ${templateToKeep.id} (${templateToKeep.name})`);
            console.log(`Will delete ${templatesToDelete.length} duplicate templates`);

            // Migrate all widgets from duplicate templates to the one we're keeping
            for (const duplicateTemplate of templatesToDelete) {
                console.log(`\n  Migrating ${duplicateTemplate.widgets.length} widgets from template ${duplicateTemplate.id} (${duplicateTemplate.name})`);

                if (duplicateTemplate.widgets.length > 0) {
                    await prisma.dashboardWidget.updateMany({
                        where: { templateId: duplicateTemplate.id },
                        data: { templateId: templateToKeep.id }
                    });
                    console.log(`  ✓ Migrated widgets to template ${templateToKeep.id}`);
                }

                // Delete the duplicate template
                await prisma.widgetTemplate.delete({
                    where: { id: duplicateTemplate.id }
                });
                console.log(`  ✓ Deleted duplicate template ${duplicateTemplate.id}`);
            }
        }

        console.log('\n\n=== Cleanup Summary ===');
        const finalTemplates = await prisma.widgetTemplate.findMany();
        console.log(`Final template count: ${finalTemplates.length}`);

        for (const template of finalTemplates) {
            const widgetCount = await prisma.dashboardWidget.count({
                where: { templateId: template.id }
            });
            console.log(`  - ${template.type}: "${template.name}" (${widgetCount} widgets using it)`);
        }

        console.log('\n✅ Cleanup completed successfully!');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicateTemplates();
