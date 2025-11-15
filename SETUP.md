# Local Development Setup

## Prerequisites
- PostgreSQL installed locally
- Database: `garva_dev`
- User: `postgres` / Password: `postgres`

## Setup
```bash
# Create database
createdb garva_dev

# Or via psql
psql -U postgres -c "CREATE DATABASE garva_dev;"

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Start dev
npm run dev
```

## Production (Vercel)
Set in Vercel dashboard:
- `DATABASE_URL` = Neon pooled connection
- `DIRECT_URL` = Neon direct connection
