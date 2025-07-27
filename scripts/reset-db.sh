#!/bin/sh

echo "🔥 Database Reset Script - Use with EXTREME CAUTION"
echo "⚠️  This will RESET your database and LOSE ALL DATA!"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🚨 This will:"
echo "1. Reset the database schema"
echo "2. Apply all migrations from scratch"
echo "3. Generate the Prisma client"
echo ""

read -p "Type 'RESET' to confirm: " confirm2
if [ "$confirm2" != "RESET" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting database reset..."

# Step 1: Reset the database
echo "1. Resetting database schema..."
npx prisma migrate reset --force

# Step 2: Generate Prisma client
echo "2. Generating Prisma client..."
npx prisma generate

# Step 3: Check migration status
echo "3. Checking migration status..."
npx prisma migrate status

echo ""
echo "✅ Database reset complete!"
echo "⚠️  Remember to seed your database if needed: npm run db:seed"
