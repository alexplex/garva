# Database Best Practices Guide

## 🎯 Golden Rules

1. **NEVER use the same database for dev and production**
2. **NEVER use `prisma db push` in production**
3. **ALWAYS use migrations for schema changes**
4. **NEVER run `prisma migrate reset` on production**

---

## 🏗️ Setup: Separate Databases

### Step 1: Create Two Neon Projects

Go to [console.neon.tech](https://console.neon.tech) and create:

1. **Production Database** (what you have now)
   - Name: `garva-production`
   - Use for: Vercel production deployment

2. **Development Database** (create this now!)
   - Name: `garva-development`
   - Use for: Local development

### Step 2: Configure Environments

**Local Development (.env.local):**
```bash
# Point to your DEVELOPMENT database
DATABASE_URL="postgresql://user:pass@dev-endpoint-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@dev-endpoint.neon.tech/neondb?sslmode=require"
```

**Vercel Production:**
```bash
# Set in Vercel dashboard → Settings → Environment Variables
# Point to your PRODUCTION database
DATABASE_URL="postgresql://user:pass@prod-endpoint-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@prod-endpoint.neon.tech/neondb?sslmode=require"
```

---

## 🔄 Migration Workflow

### When Adding/Changing Database Schema

**✅ CORRECT Workflow:**

```bash
# 1. Update your schema.prisma file
# Example: Add a new field to Joke model

# 2. Create a migration (dev database)
npm run db:migrate
# This will:
# - Prompt for migration name (e.g., "add_author_field")
# - Create migration SQL file
# - Apply it to your dev database
# - Regenerate Prisma Client

# 3. Test locally with dev database
npm run dev

# 4. Commit migration files
git add prisma/migrations
git commit -m "Add author field to jokes"

# 5. Push to GitHub
git push

# 6. Vercel will automatically:
# - Run `prisma generate` during build
# - Run `prisma migrate deploy` (safe for production)
```

**❌ WRONG Workflow (what causes problems):**

```bash
# DON'T do this:
prisma db push  # ← This is only for prototyping!
# Problems:
# - No migration history
# - Can't rollback
# - Schema drift between environments
# - Prisma might ask to reset database
```

---

## 📋 Common Scenarios

### Scenario 1: Adding a New Column

```prisma
model Joke {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  author    String?  @db.VarChar(255)  // ← NEW FIELD
  upvotes   Int      @default(0)
  downvotes Int      @default(0)
  createdAt DateTime @default(now())
  
  @@map("jokes")
}
```

**Commands:**
```bash
npm run db:migrate
# Enter name: "add_author_to_jokes"
# Prisma creates: prisma/migrations/20251115_add_author_to_jokes/migration.sql
```

### Scenario 2: Adding a New Table

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  
  @@map("users")
}
```

**Commands:**
```bash
npm run db:migrate
# Enter name: "create_users_table"
```

### Scenario 3: Modifying Existing Data

If your migration needs to transform data, edit the generated SQL:

```bash
npm run db:migrate
# Enter name: "make_author_required"
# Prisma generates migration file
```

Then edit `prisma/migrations/.../migration.sql`:
```sql
-- Set default value for existing rows
UPDATE jokes SET author = 'Anonymous' WHERE author IS NULL;

-- Now make it required
ALTER TABLE jokes ALTER COLUMN author SET NOT NULL;
```

---

## 🔧 Useful Commands

### Development
```bash
npm run dev              # Start dev server
npm run db:migrate       # Create and apply migration (dev only!)
npm run db:studio        # Open database GUI
npm run db:seed          # Seed database with test data
```

### When Things Go Wrong (Dev Only!)
```bash
npm run db:reset         # ⚠️ DEV ONLY! Drops DB, runs all migrations, seeds
```

### Production Deployment
```bash
# Vercel automatically runs this during build:
npm run db:migrate:prod  # Applies pending migrations (safe!)
```

---

## 🚨 Troubleshooting

### "Your database schema is not in sync"

**In Development:**
```bash
npm run db:migrate
# Create migration to sync schema
```

**In Production:**
This shouldn't happen if you follow the workflow!
If it does, you missed a migration file in git.

### "Database reset required"

This means you used `db push` and now have drift.

**In Development:**
```bash
npm run db:reset  # Safe, only affects dev DB
npm run db:seed   # Re-seed test data
```

**In Production:**
🚨 NEVER reset production! Instead:
1. Review what changed in schema
2. Create proper migration
3. Deploy via normal workflow

### "Migration already applied"

Safe to ignore - migration is already in production.

---

## 📁 Migration Files

Prisma creates files in `prisma/migrations/`:

```
prisma/migrations/
├── 20251115120000_init/
│   └── migration.sql
├── 20251116093000_add_author_to_jokes/
│   └── migration.sql
└── migration_lock.toml
```

**✅ DO:**
- Commit all migration files to git
- Review migration SQL before applying
- Keep migrations in chronological order

**❌ DON'T:**
- Edit old migrations (create new ones instead)
- Delete migration files
- Manually modify the database outside migrations

---

## 🎓 Why Migrations?

| db push (Prototyping) | Migrations (Production) |
|----------------------|-------------------------|
| ❌ No history | ✅ Full history |
| ❌ Can't rollback | ✅ Can rollback |
| ❌ Schema drift | ✅ Consistent schema |
| ❌ Asks to reset | ✅ Safe deploys |
| ✅ Fast iteration | ⚠️ Requires discipline |

**Use `db push` for:** Quick prototyping in throwaway dev databases
**Use migrations for:** Everything you want to keep!

---

## 🔄 Current Status

You're currently pointing to production! Update `.env.local` to point to a dev database before running any schema changes.

### Next Steps:

1. ✅ Create dev Neon project
2. ✅ Update `.env.local` with dev database URL
3. ✅ Run initial migration: `npm run db:migrate`
4. ✅ Seed dev database: `npm run db:seed`
5. ✅ Keep `.env.local` in `.gitignore` (already done)
6. ✅ Set production URLs in Vercel dashboard

---

## 📚 Further Reading

- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Neon Branching](https://neon.tech/docs/guides/branching) - Separate databases per feature branch
- [Vercel + Prisma Best Practices](https://vercel.com/guides/nextjs-prisma-postgres)
