# Deploying Garva to Vercel with Neon Database

## Step 1: Push to GitHub (if not already)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) and sign in
2. Click "New Project"
3. Choose a project name (e.g., "garva")
4. Select your region
5. Click "Create Project"
6. Copy the connection string from the dashboard

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings ✅
5. **Before deploying**, add environment variables:
   - `DATABASE_URL` - Your Neon connection string (pooled)
   - `DIRECT_URL` - Your Neon connection string (direct)
6. Click "Deploy"

## Step 4: Set Up Database Schema

After your first deployment, run the following commands locally:

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env

# Install dependencies
npm install

# Push database schema to Neon
npm run db:push

# Seed with sample jokes (optional)
node prisma/seed.js
```

## Alternative: Quick Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Set up environment variables first
# Create .env file with your Neon connection strings

# Deploy
vercel

# After first deploy, set up database
npm run db:push
node prisma/seed.js
```

## Updating the App

```bash
git add .
git commit -m "Your update message"
git push

# Vercel automatically deploys on push!
```

Or manually trigger:
```bash
vercel --prod
```

## Environment Variables

Get your Neon connection strings from the Neon dashboard:

1. **DATABASE_URL** (Pooled connection) - Used for queries
   - Format: `postgresql://user:password@endpoint-pooler.region.neon.tech/dbname?sslmode=require`

2. **DIRECT_URL** (Direct connection) - Used for migrations
   - Format: `postgresql://user:password@endpoint.region.neon.tech/dbname?sslmode=require`

Add these in Vercel dashboard:
- Go to "Settings" → "Environment Variables"
- Add both variables for Production, Preview, and Development environments

## Useful Commands

```bash
# View database in browser
npm run db:studio

# Push schema changes
npm run db:push

# Generate Prisma Client after schema changes
npm run db:generate
```
