# Pragma — Design Research

A single-page marketing site for **Pragma**, a boutique tech consulting agency, built as a design-research artifact. Five color palettes (each with light and dark variants) and matching typography pairings can be cycled through in a real layout — so the winning combination can be picked in context, not from a swatch grid.

## What's here

```
src/PragmaSite.jsx     ← the artifact: one self-contained component, default export
src/main.jsx           ← Vite entry, mounts <PragmaSite />
src/index.css          ← Tailwind import + base resets
index.html             ← HTML shell, fonts preconnect
vite.config.js         ← React + Tailwind v4 plugins
```

`src/PragmaSite.jsx` is the deliverable. The rest is scaffolding so it runs locally.

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

## How to evaluate

- **Light/dark toggle** — top-right of the header. First load follows your OS `prefers-color-scheme`; once you click, your choice wins.
- **Palette switcher** — floating pill, bottom-right. Click to expand. Each palette shows three swatches (background · brand · accent) and a one-line character description. Switching swaps both the colors and the typography pairing.

Cycle through all 5 palettes in both light and dark modes. The differences should be immediately legible in the hero, the work cards, and the contact section — those are the moments where the brand color and display typeface do the most work.

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
