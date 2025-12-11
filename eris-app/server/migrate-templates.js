const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting migration: Widgets -> Templates & DashboardWidgets');

    // 1. Fetch all existing widgets
    const widgets = await prisma.widget.findMany();
    console.log(`Found ${widgets.length} existing widgets.`);

    if (widgets.length === 0) {
        console.log('No widgets to migrate.');
        return;
    }

    // 2. Identify unique templates based on 'type' (or title/type combo)
    // Simple strategy: Create a template for each unique existing widget to preserve exact look, 
    // OR group by type. 
    // User asked to "keep this widget table as widget template". 
    // Let's create a template for each unique "Type" and maybe "Title" if it looks generic, 
    // BUT user wants to reuse. 
    // Better approach: 
    // Create a Template for each widget that exists now, so they become the "library".
    // Then link the DashboardWidget to it.

    for (const w of widgets) {
        // Check if a template with this name/type already exists? 
        // Or just create one per widget to be safe initially.
        // Let's create a template for each existing widget to ensure 1:1 migration without data loss.
        // We can clean up duplicates later or user can.

        // Construct default config from specific fields
        const defaultConfig = {
            title: w.title,
            icon: w.icon,
            color: w.color,
            content: w.content
        };

        const template = await prisma.widgetTemplate.create({
            data: {
                name: w.title || `Template ${w.type}`,
                type: w.type || 'unknown',
                defaultConfig: JSON.stringify(defaultConfig)
            }
        });

        // Create Dashboard Instance
        // We put specific overrides in 'config' if they differ from template, 
        // but here we just made the template match exactly. 
        // So 'config' can be empty or null for now, meaning "use template default".
        // Or we can duplicate the config to be safe. Let's start with null to prove inheritance.

        await prisma.dashboardWidget.create({
            data: {
                id: w.id,
                dashboardId: w.dashboardId,
                templateId: template.id,
                x: w.x,
                y: w.y,
                w: w.w,
                h: w.h,
                config: null // Inherit everything from template
            }
        });

        console.log(`Migrated widget ${w.id} -> Template ${template.id} / Instance ${w.id}`);
    }
}

migrate()
    .catch((e) => {
        console.error('Migration failed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('Migration finished.');
    });
