# Quick Reference: Database Commands

## ⚠️ IMPORTANT: Which Database Am I Using?

Check your `.env.local` file to see which database you're connected to!

---

## 🛠️ Development Commands

### Schema Changes
```bash
# After modifying prisma/schema.prisma:
npm run db:migrate
# Enter a descriptive name like: "add_author_field"
```

### Database Management
```bash
npm run db:studio          # Open Prisma Studio (database GUI)
npm run db:seed            # Populate with test data
npm run db:reset           # ⚠️ DANGER: Wipe & rebuild (dev only!)
```

---

## 🚀 Production Workflow

1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` (creates migration)
3. Test locally
4. Git commit (include migration files!)
5. Git push
6. Vercel auto-deploys and runs migrations

---

## 🆘 Emergency Commands

### "Schema is out of sync"
```bash
# Development:
npm run db:migrate

# Production:
# Don't panic! Just create a proper migration locally,
# commit it, and deploy normally.
```

### "Start Fresh" (Dev Only)
```bash
npm run db:reset
npm run db:seed
```

---

## 📋 Current Setup Checklist

- [ ] Created separate dev Neon project
- [ ] Updated `.env.local` with DEV database URLs
- [ ] Set production URLs in Vercel dashboard
- [ ] Initialized migrations: `npm run db:migrate`
- [ ] Seeded dev database: `npm run db:seed`

---

**Remember:** 
- `.env.local` = Development database
- Vercel = Production database
- NEVER run `db:reset` on production!
