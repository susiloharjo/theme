const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const dbPath = path.resolve(__dirname, 'dashboard.db');

app.use(cors());
app.use(bodyParser.json());

// Database Setup
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create new table for Gridstack
        db.run(`CREATE TABLE IF NOT EXISTS widgets_v2 (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT,
      title TEXT,
      type TEXT,
      x INTEGER,
      y INTEGER,
      w INTEGER,
      h INTEGER,
      value TEXT,
      content TEXT,
      icon TEXT,
      color TEXT
    )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                // Seed default data if empty for 'main' dashboard
                db.get("SELECT count(*) as count FROM widgets_v2 WHERE dashboard_id = 'main'", (err, row) => {
                    if (row.count === 0) {
                        console.log("Seeding default widgets for main dashboard...");
                        const defaults = [
                            // Stats (Row 1)
                            { id: 'w1', dashboard_id: 'main', title: 'Total Revenue', type: 'stat', x: 0, y: 0, w: 2, h: 4, value: 'Rp 2.5B', icon: 'dollar-sign', color: 'bg-blue-500' },
                            { id: 'w2', dashboard_id: 'main', title: 'Active Projects', type: 'stat', x: 2, y: 0, w: 2, h: 4, value: '12', icon: 'briefcase', color: 'bg-indigo-500' },
                            { id: 'w3', dashboard_id: 'main', title: 'Pending Approval', type: 'stat', x: 4, y: 0, w: 2, h: 4, value: '5', icon: 'clock', color: 'bg-orange-500' },
                            { id: 'w4', dashboard_id: 'main', title: 'Team Members', type: 'stat', x: 6, y: 0, w: 2, h: 4, value: '48', icon: 'users', color: 'bg-green-500' },
                            { id: 'w5', dashboard_id: 'main', title: 'Conversion Rate', type: 'stat', x: 8, y: 0, w: 2, h: 4, value: '65.5', icon: 'trending-up', color: 'bg-green-600' },
                            { id: 'w6', dashboard_id: 'main', title: 'Critical Issues', type: 'stat', x: 10, y: 0, w: 2, h: 4, value: '3', icon: 'alert-triangle', color: 'bg-red-500' },

                            // Row 2
                            // List Widget
                            {
                                id: 'w7', dashboard_id: 'main', title: 'Sales Order Fulfilment', type: 'list', x: 0, y: 4, w: 3, h: 6,
                                content: JSON.stringify({
                                    listItems: [
                                        { label: 'Incomplete Data', value: '8.03K', colorClass: 'text-green-600' },
                                        { label: 'Delivery Issue', value: '4.49K', colorClass: 'text-red-600' },
                                        { label: 'Invoicing Issue', value: '3.8K', colorClass: 'text-orange-500' }
                                    ],
                                    footer: 'Now'
                                })
                            },
                            // Bar Chart
                            {
                                id: 'w8', dashboard_id: 'main', title: 'Incoming Sales Orders', type: 'bar', x: 3, y: 4, w: 3, h: 6,
                                value: '2.3',
                                content: JSON.stringify({
                                    subtitle: 'EMEA',
                                    unit: 'M',
                                    footer: 'EUR, Year to Date',
                                    chartData: [
                                        { value: 30, colorClass: 'bg-blue-400' },
                                        { value: 50, colorClass: 'bg-blue-500' },
                                        { value: 40, colorClass: 'bg-blue-600' },
                                        { value: 60, colorClass: 'bg-blue-700' },
                                        { value: 80, colorClass: 'bg-gray-500' }
                                    ]
                                })
                            },
                            // Pie Chart
                            {
                                id: 'w9', dashboard_id: 'main', title: 'Sales Contract Fulfilment', type: 'pie', x: 6, y: 4, w: 3, h: 6,
                                value: '1.8M',
                                content: JSON.stringify({
                                    subtitle: 'EMEA',
                                    target: '3M',
                                    footer: 'EUR, Year to Date'
                                })
                            },
                            // Line/Area Chart
                            {
                                id: 'w10', dashboard_id: 'main', title: 'Ext. Sales Commissions', type: 'line', x: 9, y: 4, w: 3, h: 6,
                                content: JSON.stringify({
                                    value1: '70M',
                                    value2: '45M',
                                    labelStart: 'June',
                                    labelEnd: 'June 30'
                                })
                            },
                        ];
                        const stmt = db.prepare("INSERT INTO widgets_v2 (id, dashboard_id, title, type, x, y, w, h, value, content, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        defaults.forEach(w => {
                            stmt.run(w.id, w.dashboard_id, w.title, w.type, w.x, w.y, w.w, w.h, w.value, w.content, w.icon, w.color);
                        });
                        stmt.finalize();
                    }
                });
            }
        });
    }
});

// Routes

// Get widgets for a specific dashboard
app.get('/api/dashboard/:dashboardId', (req, res) => {
    const dashboardId = req.params.dashboardId;
    db.all("SELECT * FROM widgets_v2 WHERE dashboard_id = ?", [dashboardId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        // If empty for a new dashboard, maybe seed it or return empty
        // For now returning whatever is there
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Save (upsert) widgets for a specific dashboard
// We expect the FULL list of widgets for that dashboard to replace/update state
app.post('/api/dashboard/:dashboardId', (req, res) => {
    const dashboardId = req.params.dashboardId;
    const widgets = req.body.widgets;

    if (!widgets || !Array.isArray(widgets)) {
        res.status(400).json({ "error": "Invalid input" });
        return;
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // We could delete all for this dashboard and re-insert, or upsert.
        // Deleting and re-inserting is safer for "cleanup" of removed widgets.
        db.run("DELETE FROM widgets_v2 WHERE dashboard_id = ?", [dashboardId], (err) => {
            if (err) {
                console.error("Error clearing old widgets", err);
                // rollback?
            }
        });

        const stmt = db.prepare("INSERT INTO widgets_v2 (id, dashboard_id, title, type, x, y, w, h, value, content, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        widgets.forEach(w => {
            // Ensure we use the path param dashboardId
            stmt.run(w.id, dashboardId, w.title, w.type, w.x, w.y, w.w, w.h, w.value, w.content, w.icon, w.color);
        });

        stmt.finalize();
        db.run("COMMIT", (err) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "saved successfully" });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
