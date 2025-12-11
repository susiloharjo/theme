const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Routes

// Get all widget templates
app.get('/api/templates', async (req, res) => {
    try {
        const templates = await prisma.widgetTemplate.findMany();
        res.json({
            "message": "success",
            "data": templates
        });
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// Get widgets for a specific dashboard
app.get('/api/dashboard/:dashboardId', async (req, res) => {
    const dashboardId = req.params.dashboardId;
    try {
        const dashboardWidgets = await prisma.dashboardWidget.findMany({
            where: {
                dashboardId: dashboardId
            },
            include: {
                template: true
            }
        });

        // Flatten response structure to match frontend expectations
        const widgets = dashboardWidgets.map(dw => {
            const template = dw.template;
            const instanceConfig = dw.config ? JSON.parse(dw.config) : {};
            const templateConfig = template.defaultConfig ? JSON.parse(template.defaultConfig) : {};

            // Merge: Instance config overrides Template config
            // However, our migration set instance config to null, so we mostly rely on template here.
            // But we need to reconstruct the flat object.

            return {
                id: dw.id,
                dashboardId: dw.dashboardId,
                title: instanceConfig.title || templateConfig.title || template.name,
                type: template.type,
                x: dw.x,
                y: dw.y,
                w: dw.w,
                h: dw.h,

                // Reconstruct legacy fields from config
                value: instanceConfig.value || templateConfig.value,
                content: instanceConfig.content || templateConfig.content,
                icon: instanceConfig.icon || templateConfig.icon,
                color: instanceConfig.color || templateConfig.color,

                // Add template info for future use
                templateId: template.id
            };
        });

        res.json({
            "message": "success",
            "data": widgets
        });
    } catch (err) {
        console.error('Error fetching widgets:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// Save (upsert) widgets for a specific dashboard
app.post('/api/dashboard/:dashboardId', async (req, res) => {
    const dashboardId = req.params.dashboardId;
    const widgets = req.body.widgets;

    if (!widgets || !Array.isArray(widgets)) {
        res.status(400).json({ "error": "Invalid input" });
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Delete all widgets for this dashboard
            await tx.dashboardWidget.deleteMany({
                where: {
                    dashboardId: dashboardId
                }
            });

            // Re-insert new widgets
            if (widgets.length > 0) {
                // Note: This naive implementation assumes we are reusing existing templates or creating new ones?
                // The frontend currently sends flat widget objects. It doesn't know about templateIds yet unless we sent them back in GET.
                // If a widget has a templateId, we link it. If not (new widget), we might need to create a template or find a generic one.
                // For now, let's assume we find/create a template for EVERY widget to keep it simple and consistent with the user request.

                for (const w of widgets) {
                    let templateId = w.templateId;

                    // If no template ID provided (e.g. new generic widget added from UI), create a new template for it
                    // This effectively auto-saves custom widgets as templates as requested ("save and use it").
                    if (!templateId) {
                        const defaultConfig = {
                            title: w.title,
                            icon: w.icon,
                            color: w.color,
                            content: w.content,
                            value: w.value
                        };

                        const newTemplate = await tx.widgetTemplate.create({
                            data: {
                                name: w.title || `New ${w.type}`,
                                type: w.type || 'unknown',
                                defaultConfig: JSON.stringify(defaultConfig)
                            }
                        });
                        templateId = newTemplate.id;
                    }

                    // Config override: For now, we store everything in the template for new widgets.
                    // For existing widgets connected to a template, if we change something, 
                    // should we update the template OR the instance config?
                    // User said "separate widget as template... save the template...".
                    // Let's assume dashboard edits update the INSTANCE overrides, not the template itself, 
                    // unless explicitly "saving as template" (which is a UI feature we don't have yet).
                    // So we save specific properties to 'config'.

                    const instanceConfig = {
                        title: w.title,
                        icon: w.icon,
                        color: w.color,
                        content: w.content,
                        value: w.value
                    };

                    await tx.dashboardWidget.create({
                        data: {
                            id: w.id,
                            dashboardId: dashboardId,
                            templateId: templateId,
                            x: w.x,
                            y: w.y,
                            w: w.w,
                            h: w.h,
                            config: JSON.stringify(instanceConfig)
                        }
                    });
                }
            }
        });

        res.json({ "message": "saved successfully" });
    } catch (err) {
        console.error('Error saving widgets:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

