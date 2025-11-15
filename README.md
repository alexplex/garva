<h1 align="center">Garva · Swipe for a laugh</h1>

Garva is a Tinder-inspired joke deck that never runs out. The app keeps two joke cards stacked at all times, letting you swipe forward for a fresh punchline or back to revisit the previous one without any loading hiccups. Each joke pulls from a local SQLite database, is styled with a random dark pastel background, and includes placeholder vote buttons for future sentiment tracking.

https://github.com/user-attachments/assets/placeholder

## Features

- **Endless swipe deck** – The deck recycles through the stored jokes, always preloading the next (or previous) card beneath the active one for a seamless “curtain reveal.”
- **Bidirectional swiping** – Swiping left advances to a new random joke, swiping right rewinds to the last joke you saw. Drag direction previews the appropriate card underneath.
- **Nuanced motion** – Framer Motion drives the card physics with natural springs while dragging is temporarily locked just long enough for the outgoing card to clear the screen.
- **SQLite-backed content** – Prisma manages a simple `Joke` model and a seed script that loads 10 placeholder jokes so the deck always has material.
- **Future-proof voting** – Font Awesome thumbs up/down buttons are rendered on both layers (disabled on the hidden card) ready for wiring into vote tracking later.

## Tech Stack

- [Next.js 16 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Framer Motion 12](https://www.framer.com/motion/)
- [Prisma ORM](https://www.prisma.io/) + [Neon PostgreSQL](https://neon.tech/)
- [Font Awesome React](https://fontawesome.com/docs/web/use-with/react/)
- [Nunito](https://fonts.google.com/specimen/Nunito) via `next/font`

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+ (project uses npm lockfile)
- Neon database account (free tier works great!)

### Installation & Setup

```bash
# Install dependencies
npm install

# Set up your databases (IMPORTANT!)
# Read DATABASE_README.md for complete setup guide
# Create separate dev and prod Neon databases

# Configure environment
cp .env.development.example .env.local
# Edit .env.local with your DEV database URLs

# Initialize database
npm run db:migrate  # or: npx prisma migrate deploy
npm run db:seed
```

**📚 Database Setup:** Read [`DATABASE_README.md`](./DATABASE_README.md) for complete instructions on:
- Creating separate dev/prod databases
- Understanding migrations vs db push
- Best practices for schema changes
- Troubleshooting common issues

### Running the app

```bash
npm run dev
```

Visit `http://localhost:3000` and start swiping. Linting is available via `npm run lint`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── jokes/route.ts      # REST endpoint exposing all jokes
│   │   ├── admin/              # Admin API routes (CRUD operations)
│   │   └── debug/route.ts      # Database diagnostics
│   ├── admin/                  # Admin dashboard
│   ├── layout.tsx              # Nunito + global shell
│   ├── page.tsx                # server component that loads jokes & renders the deck
│   └── globals.css             # base styles & gradients
├── components/
│   ├── joke-deck.tsx           # swipe logic, motion controls, voting UI
│   └── admin/                  # Admin UI components
└── lib/
    ├── jokes.ts                # DB helpers
    ├── prisma.ts               # singleton Prisma client
    ├── auth.ts                 # Admin authentication
    └── vote-storage.ts         # Vote persistence

prisma/
├── schema.prisma               # Joke model definition
├── seed.js                     # Seeds 10 placeholder jokes
└── migrations/                 # ⚠️ Migration history (commit to git!)
    ├── 20251115000000_init/
    │   └── migration.sql
    └── migration_lock.toml
```

## Development Notes

- **Motion tuning:** `src/components/joke-deck.tsx` keeps track of the swipe direction and uses manual motion controls rather than variants so we can animate forward/backward symmetrically and lock drag while cards exit.
- **Styling:** Tailwind utilities (via `@tailwindcss/postcss`) live in `globals.css`. Random background colors are generated per card and constrained to low RGB values (<180) for contrast with white text.
- **Data flow:** `page.tsx` fetches jokes on the server with Prisma; the client component receives the entire list so no extra API roundtrip is needed during swipes.
- **Database:** Uses Prisma migrations for safe schema changes. **Never use `db push` in production!** See [`DATABASE_BEST_PRACTICES.md`](./DATABASE_BEST_PRACTICES.md)

## Database Management

```bash
# Development
npm run dev              # Start dev server
npm run db:migrate       # Create & apply migration
npm run db:studio        # Database GUI
npm run db:seed          # Add test data

# Adding new fields/tables
npm run db:migrate       # Creates migration file
# Review the SQL, commit it to git, then deploy

# Emergency (dev only!)
npm run db:reset         # Fresh start with seed data
```

📚 **Complete guides:**
- [`DATABASE_README.md`](./DATABASE_README.md) - Overview & quick start
- [`SETUP_DEV_PROD_DATABASES.md`](./SETUP_DEV_PROD_DATABASES.md) - Initial setup
- [`DATABASE_BEST_PRACTICES.md`](./DATABASE_BEST_PRACTICES.md) - Comprehensive guide
- [`DB_PUSH_VS_MIGRATIONS.md`](./DB_PUSH_VS_MIGRATIONS.md) - Understanding migrations

## Roadmap

- [x] Persist vote actions via API + Prisma migrations
- [x] Build admin dashboard to add/manage jokes
- [ ] Add device-friendly haptics/sounds
- [ ] Add analytics around swipe patterns
- [ ] User authentication for personalized joke feeds

## License

MIT © 2024 Garva Contributors
