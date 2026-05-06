# Pragma — Design Research

A single-page marketing site for **Pragma**, a boutique tech consulting agency, built as a design-research artifact. Three finalist palettes (each with light and dark variants) and matching typography pairings can be cycled through in a real layout — so the winning combination can be picked in context, not from a swatch grid.

The repo also ships a **public voting site** (Spanish) that lets friends, family, and colleagues rank the three finalists 1–3, with responses persisted to Supabase.

## What's here

```
src/PragmaSite.jsx     ← the artifact: marketing site, used by the /preview route
src/App.jsx            ← router: /, /preview/:paletteId, /thanks, /results
src/routes/Vote.jsx    ← public ranking screen (Spanish)
src/routes/Preview.jsx ← renders PragmaSite locked to one palette + mode
src/routes/Thanks.jsx  ← post-submit confirmation
src/routes/Results.jsx ← passphrase-gated results dashboard (Recharts)
src/lib/supabase.js    ← Supabase client + insertVote() + fetchVotes()
src/main.jsx           ← Vite entry, mounts <App /> in <BrowserRouter />
src/index.css          ← Tailwind import + base resets
vercel.json            ← SPA rewrite so /preview/... deep links work in prod
```

`src/PragmaSite.jsx` is still the design deliverable; the rest is the voting wrapper around it.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Voting site

The voting flow is in Spanish and lives at `/`. Each card has `Ver en claro` and `Ver en oscuro` buttons that open `/preview/:paletteId?mode=light|dark` in a new tab — the full marketing site rendered in that palette and mode. After ranking the three designs, `Enviar →` posts to Supabase and routes to `/thanks`.

### One-time Supabase setup

1. Create a Supabase project (free tier is plenty).
2. In the SQL editor, run:
   ```sql
   create table votes (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz default now(),
     ranks jsonb not null,
     user_agent text
   );
   alter table votes enable row level security;
   create policy "anon can insert" on votes
     for insert to anon with check (true);
   ```
   No `select` policy is created on purpose — the anon key can write but cannot read votes back.
3. Copy the project URL and the **anon / public** API key into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. To inspect results later, in the Supabase SQL editor:
   ```sql
   select
     key as palette,
     avg((value)::int)::numeric(3,2) as avg_rank,
     count(*) as n
   from votes, jsonb_each_text(ranks)
   group by key order by avg_rank;
   ```

### `/results` — visual dashboard

Visit `/results` (e.g. `https://pragma-design-research.vercel.app/results`) for an in-app dashboard with Recharts: podium, average rank, rank distribution, win rate, Borda points, light/dark preference, preview-mode breakdown, vote velocity, and a recent-votes table.

The page is gated by `VITE_RESULTS_PASSPHRASE`. Set it in `.env.local` and on Vercel:

```
VITE_RESULTS_PASSPHRASE=your-shared-secret
```

For the page to read votes, the `votes` table needs a `SELECT` policy for the anon role (the original schema only allowed insert):

```sql
create policy "anon can read votes for results page"
  on votes for select to anon using (true);
```

> **Soft gating only.** `VITE_*` env vars and the anon Supabase key are both shipped in the client bundle. The passphrase + RLS combo is enough friction for an internal review, but anyone with browser dev tools could bypass it. For stronger protection, move the aggregation behind a Vercel Function or a Postgres RPC with a server-side secret.

### Deploy

`vercel.json` already rewrites all paths to `/` so React Router handles them. On Vercel, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_RESULTS_PASSPHRASE` in the project's environment variables and deploy.

## How to evaluate the designs (internal)

- **Light/dark toggle** — top-right of the header on `/preview/:paletteId`. The query `?mode=light|dark` locks the initial mode; the toggle still flips it after.
- **Palette switcher** — hidden by default. To see all three palettes inline during internal review, render `<PragmaSite showSwitcher />` directly.

Cycle through the three palettes in both light and dark modes. The differences should be immediately legible in the hero, the work cards, and the contact section — those are the moments where the brand color and display typeface do the most work.

## How to hand off the chosen palette

Open `src/PragmaSite.jsx`, find the `PALETTES` array near the top of the file. Each entry contains:

- `name`, `id`, `blurb`
- `fonts` — `display`, `body`, `mono` (CSS font-family stacks)
- `weights` *(optional)* — `display`, `body`, `eyebrow`, `button`. Omit to use the defaults `{ 500, 400, 400, 500 }`.
- `light` and `dark` — color tokens: `bg`, `surface`, `surfaceRaised`, `textPrimary`, `textSecondary`, `brand`, `accent`, `success`, `warning`, `error`, `border`. Optionally `brandInk` (text/icon version of brand — needed when `brand` is a fill-only color like neon) and `onBrand` (text/icon color on top of brand fills — needed when `brand` is too light for white text). Both default to `brand` and `surface` respectively.

Hand the chosen entry to the developer. Every color in the rendered site comes from a CSS custom property (`--bg`, `--surface`, `--text-primary`, `--brand`, `--brand-ink`, `--on-brand`, etc.) written at runtime, so production wiring is a one-pass mapping.

### Note on Graphite & Signal

The signal green `#6EFF8C` is fill-only in light mode (insufficient contrast as text on `#F5F5F4`). Green text, links, and icons use `--brand-ink` (`#0F6B2A` in light, `#6EFF8C` in dark). Text on top of green fills uses `--on-brand` (`#0E0F18` in both modes). The artifact already does this — the hand-off tokens just need to preserve the distinction.

## Constraints honored

- React functional component with hooks. Default export.
- All colors via CSS custom properties — no hardcoded color values in components.
- No `localStorage` or `sessionStorage` — palette and mode live in React state only.
- WCAG 2.2 AA contrast preserved (relying on the supplied palette values; no semi-transparent overlays that would degrade them).
- Tailwind for layout and spacing only.
- Smooth 250–280ms transitions on color and font changes.
