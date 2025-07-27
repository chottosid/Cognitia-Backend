#!/bin/sh

echo "🚀 Starting Cognitia Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    exit 1
fi

echo "📊 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    echo "📋 Checking Prisma status..."
    npx prisma db pull --print || echo "Could not pull database schema"
    exit 1
fi

echo "✅ Database migrations completed successfully"

# Add a small delay to ensure everything is ready
sleep 2

echo "🏁 Starting the application..."
exec npm start
