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
                            { id: 'w1', dashboard_id: 'main', title: 'Total Revenue', type: 'stat', x: 0, y: 0, w: 3, h: 4, value: 'Rp 2.5B', icon: 'dollar-sign', color: 'bg-blue-500' },
                            { id: 'w2', dashboard_id: 'main', title: 'Active Projects', type: 'stat', x: 3, y: 0, w: 3, h: 4, value: '12', icon: 'briefcase', color: 'bg-indigo-500' },
                            { id: 'w3', dashboard_id: 'main', title: 'Pending Approval', type: 'stat', x: 6, y: 0, w: 3, h: 4, value: '5', icon: 'clock', color: 'bg-orange-500' },
                            { id: 'w4', dashboard_id: 'main', title: 'Team Members', type: 'stat', x: 9, y: 0, w: 3, h: 4, value: '48', icon: 'users', color: 'bg-green-500' },
                            { id: 'w5', dashboard_id: 'main', title: 'Revenue Trend', type: 'chart', x: 0, y: 4, w: 6, h: 8, content: 'Chart Placeholder' },
                            { id: 'w6', dashboard_id: 'main', title: 'Project Status', type: 'chart', x: 6, y: 4, w: 6, h: 8, content: 'Pie Chart Placeholder' },
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
