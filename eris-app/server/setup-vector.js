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
            // Add embedding column (384 dimensions for MiniLM)
            await prisma.$executeRawUnsafe(`
                ALTER TABLE search_index 
                ADD COLUMN IF NOT EXISTS embedding vector(384)
            `);
            console.log('✅ embedding column added to search_index');

            // Create index for vector similarity search
            await prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS search_index_embedding_idx 
                ON search_index 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            `);
            console.log('✅ vector index created');
        } else {
            console.log('✅ embedding column already exists');
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
