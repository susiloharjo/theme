#!/bin/sh
set -e

echo "🔄 Starting API initialization..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Run Prisma migrations (creates tables)
echo "🔄 Running Prisma schema push..."
npx prisma db push --accept-data-loss || true

# Setup pgvector extension and vector column
echo "🔄 Setting up pgvector..."
node setup-vector.js || true

# Seed Widgets
echo "🌱 Seeding widgets..."
node seed-widgets.js || true

# Build search index with embeddings (optional, can be slow first time)
if [ "$BUILD_INDEX" = "true" ]; then
  echo "🔄 Building search index..."
  node projection-builder.js || true
fi

echo "🎉 Initialization complete, starting server..."

# Start the application
exec npm start
