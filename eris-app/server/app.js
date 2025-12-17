const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bodyParser = require('body-parser');
const searchRoutes = require('./search-routes');

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Mount search routes
app.use('/api/search', searchRoutes);

// Routes

// Get all widget templates
app.get('/api/templates', async (req, res) => {
    try {
        const templates = await prisma.widgetTemplate.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({
            "message": "success",
            "data": templates
        });
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// Update a widget template
app.put('/api/templates/:id', async (req, res) => {
    const id = req.params.id;
    const { defaultConfig } = req.body;

    try {
        const updatedTemplate = await prisma.widgetTemplate.update({
            where: { id: id },
            data: {
                defaultConfig: defaultConfig
            }
        });
        res.json({ "message": "success", "data": updatedTemplate });
    } catch (err) {
        console.error('Error updating template:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// Delete a widget template
app.delete('/api/templates/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Check if template is in use
        const usageCount = await prisma.dashboardWidget.count({
            where: { templateId: id }
        });

        console.log(`[DELETE TEMPLATE] Template ID: ${id}, Usage Count: ${usageCount}`);

        if (usageCount > 0) {
            // Get details of which widgets are using this template
            const usingWidgets = await prisma.dashboardWidget.findMany({
                where: { templateId: id },
                select: { id: true, dashboardId: true }
            });
            console.log(`[DELETE TEMPLATE] Blocked - Widgets using this template:`, usingWidgets);

            // Create a helpful error message showing which dashboards
            const dashboards = [...new Set(usingWidgets.map(w => w.dashboardId))];
            const dashboardList = dashboards.join(', ');

            return res.status(409).json({
                "error": `Template is currently used by ${usageCount} widget(s) on dashboard(s): ${dashboardList}. Please remove them first.`
            });
        }

        await prisma.widgetTemplate.delete({
            where: { id: id }
        });
        console.log(`[DELETE TEMPLATE] Successfully deleted template: ${id}`);
        res.json({ "message": "success" });
    } catch (err) {
        console.error('Error deleting template:', err);
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
                for (const w of widgets) {
                    let templateId = w.templateId;

                    // If no template ID provided, try to find an existing template of the same type
                    // Only create a new template if none exists for this type
                    if (!templateId) {
                        // Try to find an existing template of the same type
                        const existingTemplate = await tx.widgetTemplate.findFirst({
                            where: { type: w.type || 'unknown' }
                        });

                        if (existingTemplate) {
                            // Reuse existing template
                            templateId = existingTemplate.id;
                            console.log(`[SAVE WIDGET] Reusing existing template ${templateId} for type ${w.type}`);
                        } else {
                            // Create a new template only if none exists for this type
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
                            console.log(`[SAVE WIDGET] Created new template ${templateId} for type ${w.type}`);
                        }
                    }

                    // Store instance-specific overrides in config
                    // This allows the same template to be reused with different titles/values
                    const instanceConfig = {
                        title: w.title,
                        icon: w.icon,
                        color: w.color,
                        content: w.content,
                        value: w.value,
                        action: w.action // Include action config
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

// --- CRM ROUTES ---

// Get all customers
app.get('/api/crm/customers', async (req, res) => {
    try {
        const customers = await prisma.crmCustomer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ "message": "success", "data": customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// Get all opportunities
app.get('/api/crm/opportunities', async (req, res) => {
    try {
        const opportunities = await prisma.crmOpportunity.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ "message": "success", "data": opportunities });
    } catch (err) {
        console.error('Error fetching opportunities:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// --- PMO ROUTES ---

// Get all projects
app.get('/api/pmo/projects', async (req, res) => {
    try {
        const projects = await prisma.pmoProject.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Parse JSON fields
        const parsedProjects = projects.map(p => ({
            ...p,
            budgetStats: p.budgetStats ? JSON.parse(JSON.stringify(p.budgetStats)) : null,
            riskStats: p.riskStats ? JSON.parse(JSON.stringify(p.riskStats)) : null,
            taskStats: p.taskStats ? JSON.parse(JSON.stringify(p.taskStats)) : null,
            team: p.team ? JSON.parse(JSON.stringify(p.team)) : [],
            suppliers: p.suppliers ? JSON.parse(JSON.stringify(p.suppliers)) : [],
            procurements: p.procurements ? JSON.parse(JSON.stringify(p.procurements)) : [],
            risks: p.risks ? JSON.parse(JSON.stringify(p.risks)) : [],
            activityFeed: p.activityFeed ? JSON.parse(JSON.stringify(p.activityFeed)) : []
        }));
        res.json({ "message": "success", "data": parsedProjects });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

// --- TRAINING ROUTES ---

// Get all training sessions
app.get('/api/training/sessions', async (req, res) => {
    try {
        const sessions = await prisma.trainingSession.findMany({
            orderBy: { startDate: 'asc' }
        });
        res.json({ "message": "success", "data": sessions });
    } catch (err) {
        console.error('Error fetching training sessions:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});


// --- PURCHASE ROUTES ---

// Get all purchase requests
app.get('/api/purchases', async (req, res) => {
    try {
        const purchases = await prisma.purchaseRequest.findMany({
            orderBy: { requestDate: 'desc' }
        });

        // Parse JSON fields
        const parsedPurchases = purchases.map(p => ({
            ...p,
            steps: p.steps ? JSON.parse(JSON.stringify(p.steps)) : []
        }));

        res.json({ "message": "success", "data": parsedPurchases });
    } catch (err) {
        console.error('Error fetching purchases:', err);
        res.status(500).json({ "error": "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

