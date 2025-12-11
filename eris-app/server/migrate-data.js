const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const dbPath = path.resolve(__dirname, 'dashboard.db');

const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database for migration.');
});

async function migrate() {
    console.log('Starting migration from SQLite to PostgreSQL...');

    const widgets = await new Promise((resolve, reject) => {
        sqliteDb.all("SELECT * FROM widgets_v2", [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });

    console.log(`Found ${widgets.length} widgets in SQLite.`);

    if (widgets.length > 0) {
        // Clear existing postgres data to avoid duplicates if re-running
        // await prisma.widget.deleteMany({}); 

        for (const w of widgets) {
            await prisma.widget.create({
                data: {
                    id: w.id,
                    dashboardId: w.dashboard_id,
                    title: w.title,
                    type: w.type,
                    x: w.x,
                    y: w.y,
                    w: w.w,
                    h: w.h,
                    value: w.value ? String(w.value) : null,
                    content: w.content,
                    icon: w.icon,
                    color: w.color
                }
            });
        }
        console.log(`Successfully migrated ${widgets.length} widgets.`);
    } else {
        console.log('No widgets found to migrate.');
    }
}

migrate()
    .catch((e) => {
        console.error('Migration failed:', e);
    })
    .finally(async () => {
        sqliteDb.close();
        await prisma.$disconnect();
        console.log('Migration finished.');
    });
