# Setup Guide: Switching to Neon Database

This project has been migrated from Supabase to Neon PostgreSQL with Prisma ORM.

## Quick Setup Steps

### 1. Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy both connection strings:
   - **Pooled connection** (for DATABASE_URL)
   - **Direct connection** (for DIRECT_URL)

### 2. Configure Environment Variables

Update your `.env` file (or Vercel environment variables):

```bash
DATABASE_URL="postgresql://user:password@endpoint-pooler.region.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@endpoint.region.neon.tech/dbname?sslmode=require"
```

**For Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add `DATABASE_URL` and `DIRECT_URL` for all environments (Production, Preview, Development)
3. Or use CLI: `vercel env add DATABASE_URL` and `vercel env add DIRECT_URL`

### 3. Set Up Database Schema

```bash
# Install dependencies
npm install

# Push schema to Neon database
npm run db:push

# Seed with sample jokes (optional)
node prisma/seed.js
```

### 4. Verify Setup

```bash
# View your database in browser
npm run db:studio

# Or test the API
npm run dev
# Visit http://localhost:3000/api/debug
```

## What Changed?

### Removed
- ❌ `@supabase/supabase-js` package
- ❌ `src/lib/supabase.ts` (legacy, can be deleted)
- ❌ Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Added
- ✅ `@prisma/client` and `prisma` packages
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `prisma/seed.js` - Seed script
- ✅ Updated `src/lib/prisma.ts` - Prisma client singleton
- ✅ Updated all API routes to use Prisma
- ✅ New scripts: `db:push`, `db:studio`, `db:generate`

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open Prisma Studio (database GUI)

# Database
npm run db:push          # Push schema changes to database
npm run db:generate      # Regenerate Prisma Client after schema changes
node prisma/seed.js      # Seed database with sample data

# Deployment
vercel                   # Deploy to Vercel
vercel env pull .env     # Pull environment variables from Vercel
```

## Migration Notes

- The database schema is identical to the previous Supabase setup
- All joke data needs to be migrated manually (if you have existing data)
- The `createdAt` field type changed from `string` to `Date` in TypeScript types
- All Prisma queries are type-safe and validated at compile time

## Troubleshooting

### "Can't reach database server"
- Verify your `DATABASE_URL` is correct
- Ensure Neon project is active (free tier has auto-pause)
- Check if your IP is allowed (Neon allows all IPs by default)

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in project root
- Run `vercel env pull .env` to get variables from Vercel
- Or manually copy from Neon dashboard

### "Table 'jokes' does not exist"
- Run `npm run db:push` to create tables
- Verify connection with `npm run db:studio`

## Data Migration (if needed)

If you have existing jokes data in Supabase, you can export from Supabase and import to Neon:

1. Export from Supabase: SQL Editor → Run `SELECT * FROM jokes;` → Download CSV
2. Import to Neon: Use Prisma Studio or write a migration script

Or keep your existing `migrate-to-supabase.js` and modify it to migrate from old DB to Neon.
