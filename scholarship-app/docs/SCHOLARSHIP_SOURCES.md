# Scholarship sources: where to look first

Every agent (Claude, Codex, Antigravity, and the scheduled agents) checks our known sources **before** searching
the open web, and saves any new source it finds. This keeps research fast, cheaper and anchored to official pages.

## The two places sources live

| What | Where | Used for |
|---|---|---|
| Pages one scholarship's facts came from | `scholarships.source_pages` (database column, internal, never shown on the site) | Updating or checking an existing scholarship |
| Portals and providers to sweep | [`data/scholarship-sources.json`](../data/scholarship-sources.json) | Finding new scholarships |

`source_pages` is a JSON list, newest first:

```json
[{ "url": "https://scholarships.gov.in/...guidelines.pdf", "facts": ["deadline", "amount_min"], "confirmed": "2026-10-04" }]
```

`official_source` and `apply_url` are still the public links on the scholarship page. They are also used as
starting points when `source_pages` is empty, but they are often just a home page.

## Rules for any agent

**Updating or checking a scholarship**
1. Open its `source_pages` first, then `official_source` and `apply_url`.
2. If they state the fact for the current cycle, use them. Search more widely only if a page is gone, is for an
   older cycle, or does not state the fact.
3. After confirming a fact on a **specific official page** (not a home page), add or refresh that page in
   `source_pages` (`url`, the field names it confirmed, today's date). Keep at most 8, newest first.
4. Never save an aggregator, news or coaching site (Buddy4Study, Careers360, Jagran Josh, …) as a source. The
   list is `NON_OFFICIAL_DOMAINS` in `scripts/lib/sources.js`.

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
