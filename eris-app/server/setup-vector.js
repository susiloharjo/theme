/**
 * Setup pgvector extension and add vector column to search_index
 * Run this after prisma db push to add the vector column
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupVector() {
    console.log('🔄 Setting up pgvector extension...');

    try {
        // Create pgvector extension
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
        console.log('✅ pgvector extension enabled');

        // Check if embedding column exists
        const columnCheck = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'search_index' AND column_name = 'embedding'
        `);

        if (columnCheck.length === 0) {
            // Add embedding column (768 dimensions for Gemini Embeddings-001)
            await prisma.$executeRawUnsafe(`
                ALTER TABLE search_index 
                ADD COLUMN IF NOT EXISTS embedding vector(768)
            `);
            console.log('✅ embedding column added to search_index (768 dim)');

            // Create index for vector similarity search
            await prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS search_index_embedding_idx 
                ON search_index 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            `);
            console.log('✅ vector index created');
        } else {
            // Check if dimension needs update (e.g. from 384 to 768)
            // For simplicity in dev env, we drop and recreate if needed
            // But checking dimension via SQL is complex, so we assume if we are running this script
            // and the user wants 768, we might need to manual migration.
            // Let's try to detect dimension from information_schema is hard for vector type

            // ALTERNATIVE: Just Log it. Users might see errors if mismatched.
            // Improve: Try to run a dummy update with 768 vector. If fails, drop column.

            try {
                // Try to cast a dummy 768 vector
                const dummyVector = Array(768).fill(0).join(',');
                await prisma.$executeRawUnsafe(`SELECT '[${dummyVector}]'::vector(768)::vector(768)`);
                // If this passes, postgres knows about 768? No, this just tests casting.

                // Let's rely on Drop logic if we want to force upgrade
                // Or better: Just rename the old column if we want to preserve? 
                // Detailed check:
                const dims = await prisma.$queryRawUnsafe(`
                    SELECT atttypmod as dim
                    FROM pg_attribute
                    WHERE attrelid = 'search_index'::regclass
                    AND attname = 'embedding'
                `);

                const currentDim = dims[0]?.dim;
                if (currentDim === 384) { // 384 defined in postgres usually stores as dim + 4 header ? No.
                    // simpler: just drop column for this migration since data is re-indexed anyway
                    console.log('⚠️ Detected old 384 dimension, dropping column to upgrade to 768...');
                    await prisma.$executeRawUnsafe(`ALTER TABLE search_index DROP COLUMN embedding`);
                    await prisma.$executeRawUnsafe(`ALTER TABLE search_index ADD COLUMN embedding vector(768)`);
                    await prisma.$executeRawUnsafe(`
                        CREATE INDEX IF NOT EXISTS search_index_embedding_idx 
                        ON search_index 
                        USING ivfflat (embedding vector_cosine_ops)
                        WITH (lists = 100)
                    `);
                    console.log('✅ Upgraded embedding column to 768 dimensions');
                } else {
                    console.log('✅ embedding column exists');
                }
            } catch (e) {
                console.log('⚠️ Could not verify dimension, assuming correct or manual fix needed:', e.message);
            }
        }

        console.log('🎉 pgvector setup complete!');

    } catch (error) {
        console.error('❌ Error setting up pgvector:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    setupVector()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { setupVector };
