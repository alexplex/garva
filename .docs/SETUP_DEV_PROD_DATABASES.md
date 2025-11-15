# 🚀 Quick Start: Setting Up Dev & Prod Databases

**IMPORTANT:** You currently have production database credentials in `.env.local`. Follow these steps to set up properly.

---

## Step 1: Create Development Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Name it: `garva-development` (or similar)
4. Choose same region as production: **eu-west-2**
5. Click **"Create Project"**

---

## Step 2: Get Development Database URLs

From your new Neon project dashboard, copy both:

1. **Pooled Connection String** (for DATABASE_URL)
   - Look for: "Connection string" or "Pooled connection"
   - Example: `postgresql://user:pass@endpoint-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`

2. **Direct Connection String** (for DIRECT_URL)
   - Toggle to "Direct connection" or "Unpooled"
   - Example: `postgresql://user:pass@endpoint.eu-west-2.aws.neon.tech/neondb?sslmode=require`
   - (Notice: no `-pooler` in hostname)

---

## Step 3: Update Your Local Environment

**Replace** your `.env.local` file content with:

```bash
# 🟢 DEVELOPMENT DATABASE (safe to break things!)
# From your garva-development Neon project

# Pooled connection (for queries)
DATABASE_URL="postgresql://YOUR_DEV_USER:YOUR_DEV_PASS@YOUR_DEV_ENDPOINT-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for migrations)
DIRECT_URL="postgresql://YOUR_DEV_USER:YOUR_DEV_PASS@YOUR_DEV_ENDPOINT.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

**Save the production URLs somewhere safe!** You'll need them for Vercel.

---

## Step 4: Initialize Development Database

```bash
# Apply the initial migration
npx prisma migrate deploy

# Or if you want to start fresh and seed:
npm run db:migrate
# When prompted, name it: "init"

# Seed with test data
npm run db:seed
```

---

## Step 5: Configure Production (Vercel)

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production** and **Preview**:

   **DATABASE_URL:**
   ```
   postgresql://neondb_owner:npg_ahRCAfSG3to4@ep-noisy-fog-abu5mfvq-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

   **DIRECT_URL:**
   ```
   postgresql://neondb_owner:npg_ahRCAfSG3to4@ep-noisy-fog-abu5mfvq.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Vercel CLI

```bash
vercel env add DATABASE_URL production
# Paste production DATABASE_URL when prompted

vercel env add DIRECT_URL production
# Paste production DIRECT_URL when prompted

# Repeat for preview environment:
vercel env add DATABASE_URL preview
vercel env add DIRECT_URL preview
```

---

## Step 6: Initialize Production Database

```bash
# Option A: Deploy to Vercel (it will run migrations automatically)
vercel --prod

# Option B: Manually apply migrations to production
# (Only if you want to set up the schema before deploying)
DIRECT_URL="your_prod_direct_url" npx prisma migrate deploy
```

---

## ✅ Verification Checklist

- [ ] Created separate dev Neon project
- [ ] Updated `.env.local` with **dev** database URLs
- [ ] Ran `npm run db:migrate` or `npx prisma migrate deploy`
- [ ] Seeded dev database: `npm run db:seed`
- [ ] Set **production** URLs in Vercel environment variables
- [ ] Deployed to Vercel
- [ ] Tested `/api/debug` endpoint in both environments

---

## 🧪 Test Your Setup

**Development:**
```bash
npm run dev
# Visit http://localhost:3000/api/debug
# Should show jokes from DEV database
```

**Production:**
```bash
# After deploying to Vercel
# Visit https://your-app.vercel.app/api/debug
# Should show jokes from PROD database
```

---

## 📋 Database Workflow Summary

### Making Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate
# Enter name: "add_new_field"

# 3. Test locally (uses dev DB)
npm run dev

# 4. Commit & push
git add prisma/migrations
git commit -m "Add new field"
git push

# 5. Vercel auto-deploys and runs migrations on prod DB
```

### Daily Development

```bash
npm run dev              # Start dev server (uses dev DB)
npm run db:studio        # View dev database
npm run db:seed          # Re-seed dev data
```

---

## 🆘 Troubleshooting

### "I accidentally used production database locally"

Don't panic! Just:
1. Create dev database (Step 1-2 above)
2. Update `.env.local` (Step 3 above)
3. Continue working

If you made changes to production, you might want to create a migration for those changes.

### "Migration already applied"

This is fine - it means the migration exists in production already.

### "Database is out of sync"

```bash
# Development:
npm run db:migrate

# Production:
# Create proper migration locally, commit, and deploy
```

---

## 📚 Next Steps

Once setup is complete, read:
- `DATABASE_BEST_PRACTICES.md` - Comprehensive guide
- `DB_COMMANDS.md` - Quick command reference

**You're all set!** 🎉 Now you can safely develop without fear of breaking production.
