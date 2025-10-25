## Project Overview

- **Framework**: Next.js 16 (App Router, TypeScript) with React 19.
- **UI**: Custom layout using Tailwind v4 (via `@tailwindcss/postcss`) and Nunito from `next/font`.
- **Motion**: Framer Motion powers swipe gestures. We rely on `useAnimation` instead of `variants` so we can orchestrate manual springs and lock drag while a card exits.
- **Data**: Prisma ORM with SQLite (`prisma/dev.db`). `node prisma/seed.js` loads 10 jokes for local dev.

## File Map & Responsibilities

| Area | Files | Notes |
| --- | --- | --- |
| Prisma schema/seed | `prisma/schema.prisma`, `prisma/seed.js` | Model `Joke` with `id`, `content`, `createdAt`. Seed script also ensures table creation. |
| Data helpers | `src/lib/prisma.ts`, `src/lib/jokes.ts` | `prisma.ts` exports a singleton client; `jokes.ts` exposes `getAllJokes()` used by server components and API routes. |
| API | `src/app/api/jokes/route.ts` | GET returns `{ jokes }`. Dynamic to avoid caching. |
| App shell | `src/app/layout.tsx`, `src/app/globals.css` | Applies Nunito, base gradients, Font Awesome CSS. |
| Page | `src/app/page.tsx` | Server component that fetches all jokes and renders `<JokeDeck initialJokes={jokes} />`. |
| Deck UI | `src/components/joke-deck.tsx` | All swipe logic, card rendering, vote placeholders. Critical file for motion work. |

## Swipe & Deck Logic

- Deck state (`DeckState`) tracks `timeline`, `pool`, `position`, and `lastDirection`.
- `initDeck()` draws two cards immediately so a “curtain” card is always ready.
- `ensureNextCard()` tops up the timeline whenever we get close to the end.
- `goForward()/goBackward()` adjust `position` and loop over the `pool` so we can swipe endlessly.
- `peekDirection` determines which card (next vs previous) renders under the current card. Drag offsets update `peekDirection` so the correct card is previewed while dragging.
- We block drag while a card is mid-exit by toggling `isAnimating`. Once the exit spring completes, we reset controls to `{ x: 0, rotate: 0 }` and re-enable drag.

### Motion Details

- `SWIPE_THRESHOLD = 140`. Offsets beyond this trigger deck navigation.
- Exit motion uses manual `controls.start()` with `{ stiffness: 280, damping: 20, mass: 0.7 }` for a quick fly-out.
- Snap-back uses a stronger spring (stiffness 320, damping 32).
- Drag is constrained to x-axis with `dragElastic=0.6`. We disable drag while animating and when there is no previous card.

## Styling Guidelines

- Tailwind utility classes only (no external CSS modules).
- Random card colors must keep RGB channels ≤ 180 to preserve white text contrast.
- All card content, including vote buttons, has `select-none` to avoid text selection stopping drag.
- Font Awesome React (v7) is configured globally in `layout.tsx`. Do **not** import the CSS per component.

## Database Workflow

1. Update `prisma/schema.prisma`.
2. Run `npm run db:push` (wraps `prisma db push` and `prisma generate`).
3. Seed local data with `node prisma/seed.js`.
4. Never commit `prisma/dev.db` (ignored in `.gitignore`).

## Commands

```bash
npm run dev       # start Next.js dev server
npm run lint      # eslint
npm run db:push   # sync Prisma schema + regenerate client
node prisma/seed.js
```

## Coding Conventions

- Keep client state localized. Server components should fetch data and pass to client components via props.
- Favor composable hooks/state inside `joke-deck.tsx`; avoid global stores until needed.
- Add succinct comments only for non-obvious logic (e.g., describing deck refill strategy).
- Always ensure vote buttons remain rendered on both cards—just disable them on the hidden card.
- When adding new motion, prefer Framer springs and keep animation duration short to avoid locking drag longer than ~200 ms.

## Testing Philosophy

- `npm run lint` is our baseline check.
- Manual QA: verify forward/backward swipes, per-card vote button rendering, lack of flicker/opacity transitions, and that drag is disabled only while cards are in flight.
- If implementing new data features (e.g., votes), add appropriate Prisma migrations and extend API routes. Keep server logic in route handlers or server actions rather than client components.

## Future Hooks

- `VoteButtons` is currently a stub; expect to wire to an API route or mutation later. Keep API-friendly props, e.g., `onVote(direction)` when implementing.
- When adding admin tooling, leverage the existing Prisma client and consider colocating admin routes under `src/app/admin`.
