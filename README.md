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
- [Prisma ORM + SQLite](https://www.prisma.io/)
- [Font Awesome React](https://fontawesome.com/docs/web/use-with/react/)
- [Nunito](https://fonts.google.com/specimen/Nunito) via `next/font`

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+ (project uses npm lockfile)

### Installation

```bash
npm install
npm run db:push   # ensures prisma/dev.db matches schema
node prisma/seed.js
```

### Running the app

```bash
npm run dev
```

Visit `http://localhost:3000` and start swiping. Linting is available via `npm run lint`.

## Project Structure

```
src/
├── app/
│   ├── api/jokes/route.ts   # REST endpoint exposing all jokes
│   ├── layout.tsx           # Nunito + global shell
│   ├── page.tsx             # server component that loads jokes & renders the deck
│   └── globals.css          # base styles & gradients
├── components/
│   └── joke-deck.tsx        # swipe logic, motion controls, voting UI
└── lib/
    ├── jokes.ts             # DB helpers
    └── prisma.ts            # singleton Prisma client

prisma/
├── schema.prisma            # Joke model definition
├── seed.js                  # Seeds 10 placeholder jokes
└── dev.db                   # SQLite database (ignored in git)
```

## Development Notes

- **Motion tuning:** `src/components/joke-deck.tsx` keeps track of the swipe direction and uses manual motion controls rather than variants so we can animate forward/backward symmetrically and lock drag while cards exit.
- **Styling:** Tailwind utilities (via `@tailwindcss/postcss`) live in `globals.css`. Random background colors are generated per card and constrained to low RGB values (<180) for contrast with white text.
- **Data flow:** `page.tsx` fetches jokes on the server with Prisma; the client component receives the entire list so no extra API roundtrip is needed during swipes.

## Roadmap

- Persist vote actions via API + Prisma migrations.
- Build an admin dashboard to add/manage jokes.
- Add device-friendly haptics/sounds and analytics around swipe patterns.

## License

MIT © 2024 Garva Contributors
