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

## Evidence score

Every proposal from Deadline Freshness, Fact Check and Quality Fixer carries an **evidence score (0-100)** on its
inbox card, with a "How the score adds up" list. It is worked out in `scripts/lib/evidence.js`:

| Signal | Points |
|---|---|
| Research verdict: verified / agreed / secondary / uncertain | +45 / +30 / +15 / +5 |
| The proposed date or amount appears word for word on the cited page | +25 |
| Page was readable but the value is not on it | -15 |
| Source site: official / provider / platform / listing or news | +10 / +5 / 0 / -5 |
| Specific page / home page only | +5 / -10 |
| The scholarship's name is not on the cited page | -10 |
| Jev: page is about this scholarship (asked about the part of the page that names it) | -10 to +10 |
| Jev: this is the *student application* deadline (not verification, portal-closing, interview or result date) | -10 to +10 |
| Jev: text states this amount | -8 to +8 |
| Jev: this is the current cycle (e.g. 2026-27) | -5 to +5 |

Bands: **strong** 75+, **fair** 50-74, **weak** below 50. A score under 40 files the proposal as high risk.

The value check reads the cited page itself (HTML, or PDF when `pdftotext` is installed). Pages that are built by
scripts and have almost no text count as unreadable, and then the value is simply not checked.

**Jev is optional.** It is TypeSafe's hosted decision model (docs.typesafe.ai). With `TYPESAFE_API_KEY` set, it reads
short excerpts of the cited page and answers the yes/no questions above; it can also spot a listing or news site that is
not on our domain lists (the verdict then becomes `secondary`). Without the key the score uses the other signals only.
Only excerpts of public web pages are sent, never student or site data. In GitHub Actions the key is the
`TYPESAFE_API_KEY` repository secret; locally it lives in `.env.local`.

The weights are a starting point. After the inbox has some decisions, `node scripts/evidence-calibration.js` shows how
scores compare with approvals and rejections so the weights can be tuned.

## Source backfill

`node scripts/source-backfill.js` (GitHub workflow **Source Backfill**, staging by default) finds a source page for
every scholarship that has none saved. It never changes a deadline, amount or status, and never closes a scholarship.

1. **Stage 1, link check (all scholarships, minutes).** Each scholarship's existing official-source and apply links are
   opened. A link counts when the page can be read and is about the scholarship (its name is on the page, and Jev
   agrees when available). Official / provider pages go to `source_pages`, platform and listing pages to
   `secondary_sources`.
2. **Stage 2, research (a batch per run, `--max`, highest-traffic first).** For scholarships still without an official
   page, the same evidence-checked research the other agents use looks for one. It also asks whether an official
   notice says the scheme has closed or been replaced.

Each run continues where the last stopped (progress is remembered), and writes `data/source-backfill-report.md`
(also shown on the workflow run page). Groups in the report:

| Group | Meaning | What to do |
|---|---|---|
| found-official | An official or provider page is saved | Nothing |
| found-secondary | Only a platform or listing page: provider page unconfirmed | Keep; a later run or the other agents may find the provider page |
| ended-or-replaced | An official notice says it closed or was replaced | You decide: keep with a "no longer offered" note, or take down |
| not-found | Nothing found even after research | You decide: possibly discontinued, renamed or never real |
| links-dead / not-matching / home-only / no-links | Existing links unusable, not yet researched | Run again; stage 2 picks them up |

Run it: GitHub, Actions, **Source Backfill**, Run workflow, keep target **staging**. Repeat until the "not yet researched"
groups are empty.
