const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAPPINGS = [
    // Pie: Sales Contract -> New Pie Chart
    { from: '25a315cf-33a4-414e-a0b4-62c8c88ea2b0', to: 'a9c28248-a1e0-47fa-b6ee-1d34e195ee43' },

    // Shortcut: Training Request -> PR Request
    { from: '13c6447c-e0ac-4bf9-a774-0bce24b9c459', to: '874486ba-4816-48cd-8f0d-8163f21b4022' },

    // Stat: All others -> Team Members
    { from: '7cc708c6-c320-4422-92aa-6584df688f75', to: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3' }, // Critical Issues
    { from: 'c2619442-8754-40af-bf61-26bdaca1e34e', to: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3' }, // Conversion Rate
    { from: 'eafb22c8-8038-4e0d-a9e7-b9b464810f34', to: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3' }, // Pending Approval
    { from: 'd6b0a40e-bede-4fee-a9b9-23bacd3da92d', to: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3' }, // Total Revenue
    { from: 'b88f416a-9a7f-4e60-81dc-6416cfb73d42', to: '592650e6-a7d5-4ef8-b9d7-5c00c9d491b3' }, // New Stat

    // List: New List #2 -> New List #1
    { from: 'df40458f-68d1-4229-b7f1-897991e81e36', to: '8157c8ef-b05d-4ebf-b6b3-3090fc99d802' },

    // Line: New Line Chart -> Ext. Sales Commissions
    { from: '6eb7c77f-19a4-457b-8c00-cd1ca4330135', to: 'cdbd05e1-195f-4d1a-9104-58e47e9eb060' }
];

async function main() {
    console.log('Starting template deduplication...');

    for (const { from, to } of MAPPINGS) {
        const sourceTemplate = await prisma.widgetTemplate.findUnique({ where: { id: from } });
        const targetTemplate = await prisma.widgetTemplate.findUnique({ where: { id: to } });

        if (!sourceTemplate) {
            console.log(`Source template ${from} not found, skipping.`);
            continue;
        }

        if (!targetTemplate) {
            console.log(`Target template ${to} not found, skipping mapping for ${from}.`);
            continue;
        }

        console.log(`Migrating instances from "${sourceTemplate.name}" (${from}) to "${targetTemplate.name}" (${to})...`);

        // Find instances using the source template
        const instances = await prisma.dashboardWidget.findMany({ where: { templateId: from } });

        for (const instance of instances) {
            // Determine the configuration to save
            // If instance has specific config, keep it. 
            // If instance config is null/empty, we MUST copy the source template's default config
            // to preserve the look (because now it will point to a DIFFERENT template).

            let finalConfig = {};
            const sourceDefault = sourceTemplate.defaultConfig ? JSON.parse(sourceTemplate.defaultConfig) : {};
            const instanceConfig = instance.config ? JSON.parse(instance.config) : {};

            // Merge: Instance > SourceDefault
            // We do not care about TargetDefault here, because we want to preserve "what it looked like before".
            // So we explicitly set the config to "SourceDefault + InstanceOverrides".
            finalConfig = { ...sourceDefault, ...instanceConfig };

            await prisma.dashboardWidget.update({
                where: { id: instance.id },
                data: {
                    templateId: to,
                    config: JSON.stringify(finalConfig)
                }
            });
        }

        // Delete the old template
        await prisma.widgetTemplate.delete({ where: { id: from } });
        console.log(`Deleted template "${sourceTemplate.name}".`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
