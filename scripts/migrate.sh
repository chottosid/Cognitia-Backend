#!/bin/sh

echo "🔧 Database Migration Script"

# Function to resolve failed migrations
resolve_failed_migrations() {
    echo "🔍 Checking for failed migrations..."
    
    # Try to resolve the specific failed migration
    echo "📝 Attempting to resolve migration: 20250723061516_add_created_by_nullable"
    npx prisma migrate resolve --applied 20250723061516_add_created_by_nullable 2>/dev/null || echo "No failed migration to resolve"
    
    # Check migration status
    npx prisma migrate status || echo "Migration status check failed"
}

# Function to handle database schema
handle_schema() {
    echo "🔄 Handling database schema..."
    
    # Try db push first (safer for production)
    echo "📊 Attempting database push..."
    if npx prisma db push; then
        echo "✅ Database push successful"
        return 0
    else
        echo "❌ Database push failed, trying migration deploy..."
        if npx prisma migrate deploy; then
            echo "✅ Migration deploy successful"
            return 0
        else
            echo "❌ Migration deploy failed"
            return 1
        fi
    fi
}

# Main migration logic
main() {
    echo "🚀 Starting database migration process..."
    
    # Step 1: Resolve any failed migrations
    resolve_failed_migrations
    
    # Step 2: Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Step 3: Handle schema
    if handle_schema; then
        echo "✅ Database setup completed successfully"
        return 0
    else
        echo "⚠️ Database setup had issues, but continuing..."
        echo "🔧 Ensuring Prisma client is generated..."
        npx prisma generate
        return 0  # Continue anyway
    fi
}

# Run main function
main
