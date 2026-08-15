# Design System — Wikipedia-Inspired, Mobile-First

Goal: the clean, dense, trustworthy *structure* of Wikipedia — breadcrumbs, TOC/jump
nav, "Browse by X" link grids, real data tables, information-first cards with no
marketing fluff — carried through with a modern, restrained visual layer (one blue +
one green accent, light card depth, a dark footer). "Wikipedia-inspired" means the
density and navigation model, not a literal monochrome/flat clone. Reference:
`UI Design/Figma-Indiascholarships.pdf` — that mockup is the source of truth for color/
depth; this doc documents it, not the other way around.

Audience is majority mobile. Every rule below is written mobile-first; desktop is the
enhancement, not the baseline.

## 1. Tokens (`app/globals.css` `@theme`)

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#0f172a` | headings, primary text |
| `--color-ink-soft` | `#334155` | body/secondary text |
| `--color-brand` | `#2563eb` | links, filled buttons, active filter pill, category links |
| `--color-brand-dark` | `#1d4ed8` | hover/active state of brand elements |
| `--color-brand-soft` | `#eff6ff` | light blue banners (e.g. "Platform Impact" band) |
| `--color-surface-gray` | `#f8fafc` | infobox/table-header/section-band surfaces |
| `--color-border-gray` | `#e2e8f0` | hairline borders on cards/dividers |
| `--color-success` / `-soft` | `#16a34a` / `#ecfdf5` | amounts (₹ figures), "Applications Open" badges |
| `--color-urgent` / `-soft` | `#b91c1c` / `#fef2f2` | closing-soon/expired status |
| `--color-footer-bg` | `#0f172a` | site footer background (dark, white/slate-300 text) |

Rules:
- **No purple SaaS palette** (`#4A47FF`, `#2E2C57`, etc.) — legacy, being phased out.
- **Two accents only**: blue for interactive/navigational elements (links, buttons,
  active filters), green reserved specifically for money/positive-status (amounts,
  "Open" badges). Don't introduce a third accent color.
- **Cards get a light shadow** (`shadow-sm`), not the flat borderless look — matches
  the Figma mockup's Featured Scholarship / State cards. Keep it subtle: no
  `shadow-md`/`shadow-lg`, no gradients.
- **Border-radius**: `rounded-xl` for cards and primary buttons, `rounded-full` for
  filter pills and small status badges (both are correct here — the mockup uses both
  intentionally: pills for filters/badges, xl-rounded rectangles for content cards).
- **Footer is dark** (`--color-footer-bg`), full-width, white heading text with
  `slate-300`/`slate-400` link text — distinct from the light body of the page.

## 2. Typography

- Body: system-ui sans stack, 14–15px base — denser than typical SaaS (Wikipedia reads
  small and information-dense, not spacious).
- Headings: same sans stack, `--color-ink`, tighter line-height, no letter-spacing
  tricks beyond small-caps-style uppercase labels (`text-[11px] uppercase tracking-wider`
  for eyebrow/meta labels — already used in `WikiInfobox`).
- Links inside body copy: `--color-brand` + underline on hover at minimum; never a
  button-styled link for inline references.

## 3. Cards (listing & hub pages)

Cards are the right pattern for scanning many scholarships/states/guides on a phone.
Per the Figma mockup, this now means a soft-elevated card, not a flat bordered one.
Reference implementation: [`ScholarshipCard.tsx`](../app/components/ScholarshipCard.tsx)
— **note**: this file was previously flattened per an earlier (superseded) version of
this doc and needs to be brought back in line with §1/§3 here (add back `shadow-sm`,
`rounded-xl`, and the blue/green accent pairing below).

- Container: `bg-white border border-slate-200 rounded-xl shadow-sm`, hover =
  `shadow-md` or a light border-color shift — matches the Featured Scholarship / State
  cards in the mockup.
- Title: `font-bold text-slate-900`.
- Amount: **green** (`text-[--color-success]`), bold — this is the one figure on the
  card that should never be neutral-colored; it's the primary scan target.
- Status badge (Applications Open / New / Closing Soon / Closed): `rounded-full` pill,
  `-soft` background + solid text color from the token table (e.g. `bg-emerald-50
  text-emerald-700` for "Applications Open").
- Meta row (`Provider · State · Mode`): `text-xs text-slate-600`, wraps freely on
  mobile (`flex flex-wrap`) instead of a fixed grid that clips.
- Primary CTA on detail/featured cards ("View Details →", "Apply Now →"): filled blue
  button, `rounded-xl` (full-width `rounded-full`/pill only for the compact list-row
  arrow-link variant), white text.
- Touch target: the whole card is the `<Link>` — keep min height ~72px so it's an easy
  thumb tap, not just the title text.

## 4. Tables (`wiki-table`)

Used for infoboxes and structured comparison data (eligibility, benefits breakdowns).
Desktop table markup is unchanged; the mobile behavior is the important addition:

- **≥640px**: normal `<table>` layout, first column acts as a row header
  (`font-weight:600`, `background:var(--color-surface-gray)`, right border) — this is
  already in `globals.css`.
- **<640px**: a `<table>` with 4+ columns is unreadable on a phone. `.wiki-table` now
  collapses to a stacked label/value list below 640px automatically — each `<td>`
  becomes a block row with its column header injected via `content: attr(data-label)`.
  **Requirement for authors**: any `<td>` that needs a visible label on mobile must
  carry `data-label="Column Name"` (see CSS comment in `globals.css` for the exact
  pattern). Tables with only 2 columns (label/value, like `WikiInfobox`'s table) don't
  need this — they already read fine stacked.
- Horizontal scroll is the fallback, not the primary mobile pattern — only wrap a table
  in `.wiki-table-scroll` when it's genuinely tabular data (e.g. a state-wise comparison)
  that must stay in columns even on mobile.

## 5. Mobile-first checklist for any new component

1. Design the 375px layout first; add `md:`/`lg:` overrides after.
2. No fixed-width side-by-side layouts without a `flex-col md:flex-row` fallback.
3. Tap targets ≥ 40px tall.
4. Truncation (`truncate`, `line-clamp-2`) only for titles/descriptions, never for the
   deadline or amount — those are the numbers people came for.
5. Sticky elements (header, jump nav) must not stack and eat the viewport — check with
   the header's height (`h-16`) reserved via `scroll-margin-top` on anchor targets.

## 6. Known migration debt (not yet on this system)

- `Header.tsx` — still purple brand color (`#4A47FF`); needs the blue token from §1.
- `ScholarshipsList.tsx` filter chips / sort buttons — already close (rounded-full +
  `bg-google-blue`), just needs to move off the `google-blue` legacy class onto
  `--color-brand`.
- `ScholarshipCard.tsx` — was flattened (no shadow, `rounded-md`, no green amount) under
  an earlier draft of this doc; needs `shadow-sm`, `rounded-xl`, and green amount text
  applied per §3 above to match the Figma mockup.
- `WikiInfobox.tsx` / `wiki-table` — currently flat/bordered, which still reads fine
  next to the new card style (tables in the mockup, e.g. the Statistics page, stay flat
  — only cards get elevation), so no change needed there.

Track these as follow-up passes rather than silently drifting — every new component
should match §1–§5 above even while older ones are mid-migration.
