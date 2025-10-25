#!/bin/bash
# Deployment script for Hostinger

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push

# Import jokes (only if jokes.db doesn't exist or is empty)
if [ ! -f "prisma/jokes.db" ]; then
    echo "📚 Importing jokes..."
    node prisma/import-jokes.js
fi

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Deployment complete!"
echo "To start the app, run: npm start"
echo "Or with PM2: pm2 start npm --name garva -- start"
