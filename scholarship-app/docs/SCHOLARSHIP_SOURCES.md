# Scholarship sources: where to look first

Every agent (Claude, Codex, Antigravity, and the scheduled agents) checks our known sources **before** searching
the open web, and saves any new source it finds. This keeps research fast, cheaper and anchored to official pages.

## Where sources live

| What | Where | Used for |
|---|---|---|
| Official pages one scholarship's facts came from | `scholarships.source_pages` (database column, internal, never shown on the site) | Updating or checking an existing scholarship |
| Platform, listing and news pages that carry it | `scholarships.secondary_sources` (same shape, plus `tier` and `role`) | Finding the official page, and the fallback when there is none |
| Portals and providers to sweep | [`data/scholarship-sources.json`](../data/scholarship-sources.json) | Finding new scholarships |

`source_pages` is a JSON list, newest first:

```json
[{ "url": "https://scholarships.gov.in/...guidelines.pdf", "facts": ["deadline", "amount_min"], "confirmed": "2026-10-04" }]
```

## Source tiers (what a page can prove)

| Tier | Examples | Can prove |
|---|---|---|
| `official` | .gov.in, .nic.in, .edu, .ac.in | Anything |
| `provider` | the provider's own site (any other domain) | Anything |
| `platform` | Buddy4Study, Vidyasaarathi | It exists, the apply link, usually the deadline |
| `aggregator` | Careers360, Jagran Josh, Shiksha | It exists, and a lead to the official page. Never a number on its own |
| `news` | press coverage | A lead only |
| `coaching` | Allen, FIITJEE, BYJU'S… | Nothing. Never a source |

The list lives in `scripts/lib/source-tiers.js`. `role` on a secondary page is `apply` when students apply on that
site, otherwise `info`.

**What the tiers change**
- Research prefers official pages. If none states a fact, a platform or listing page can be cited, but the result
  gets the verdict **`secondary`** and always lands in the inbox as high risk, labelled with the kind of site.
  A secondary page never reaches "verified".
- A secondary page is saved to `secondary_sources`, not `source_pages`.
- The scout accepts a new scholarship found only on a platform or listing site, flagged "no official source yet",
  with confidence capped at Medium. Its public `official_source` stays empty so the site never presents a
  listing site as "official". Coaching sites are still rejected.

`official_source` and `apply_url` are still the public links on the scholarship page. They are also used as
starting points when `source_pages` is empty, but they are often just a home page.

## Rules for any agent

**Updating or checking a scholarship**
1. Open its `source_pages` first, then `official_source` and `apply_url`.
2. If they state the fact for the current cycle, use them. Search more widely only if a page is gone, is for an
   older cycle, or does not state the fact.
3. After confirming a fact on a **specific official page** (not a home page), add or refresh that page in
   `source_pages` (`url`, the field names it confirmed, today's date). Keep at most 8, newest first.
4. Save platform, aggregator and news pages to `secondary_sources` (with `tier`), never to `source_pages`. Never
   save a coaching site anywhere. Never change an existing number on a secondary page alone.

**Finding new scholarships**
1. Start from `data/scholarship-sources.json`: the state's portals for a state search, the relevant providers
   otherwise. Then widen to the open web.
2. When a new official portal or provider turns up, add it to the file by hand (`name`, `url`, `kind`, `notes`).

## How the scheduled agents use this

- **Deadline Freshness, Fact Check, Quality Fixer** pass the scholarship's known pages to the research step
  (`scripts/lib/research.js`), which tells the model to open them first (Gemini's URL reading plus Google Search).
  When both research answers agree on a specific official page, the agent saves it to `source_pages` itself.
  This is internal bookkeeping, so it does not go through the inbox; the facts themselves still do.
- **Scholarship Scout** sweeps the entries in `data/scholarship-sources.json` that have a `sweep` channel
  (`portals` or `csr`, on weekly rotation; order matters), and starts state searches from that state's portals.

## Keeping the list current

```bash
node scripts/build-sources-list.js
```

This rebuilds the `"auto": true` provider entries (grouped by the website in each active scholarship's
official source / apply link) and reports how many scholarships still have no specific source page. Hand-written
entries are never touched. Run it after pulling a fresh database (`npm run db:pull`) and commit the result.
