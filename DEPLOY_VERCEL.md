# Deploying Garva to Vercel

## Step 1: Push to GitHub (if not already)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings ✅
5. Click "Deploy"

## Step 3: Set Up Vercel Postgres

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database" → "Postgres"
3. Choose a database name (e.g., "garva-db")
4. Select your region
5. Click "Create"
6. Vercel will automatically add `DATABASE_URL` to your environment variables

## Step 4: Set Up Database Schema

In your Vercel project:
1. Go to "Settings" → "Functions" 
2. Add a deployment command or run manually via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env

# Run migrations
npx prisma db push

# Import jokes
node prisma/import-jokes-postgres.js
```

## Step 5: Configure Custom Domain

1. In Vercel project → "Settings" → "Domains"
2. Add your domain: `garva.se` (or whatever you have)
3. Follow Vercel's DNS instructions to point your domain
4. Vercel will automatically provision SSL certificates

## Alternative: Quick Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (this will set up everything)
vercel

# Follow the prompts to create project and link it

# After first deploy, set up database as described in Step 3-4
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

## Environment Variables (if needed)

Add any additional environment variables in Vercel dashboard:
- Go to "Settings" → "Environment Variables"
- DATABASE_URL is automatically set by Vercel Postgres
