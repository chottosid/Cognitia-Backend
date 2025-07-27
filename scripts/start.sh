#!/bin/sh

echo "🚀 Starting Cognitia Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    exit 1
fi

echo "📊 Running database setup..."

# Use the migration script
chmod +x ./scripts/migrate.sh
./scripts/migrate.sh

echo "✅ Database migrations completed successfully"

# Add a small delay to ensure everything is ready
sleep 2

echo "🏁 Starting the application..."
exec npm start
