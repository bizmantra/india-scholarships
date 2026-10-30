# Study Abroad: content spec (cleanup first, countries later)

Written 2026-10-29. Companion: `plans/study-abroad-dev-specs.md`.
Read first: `docs/study-abroad/CONTENT_RULES.md`, `TERMS.md`, `SEO_AND_SCHEMA_RULES.md`, `templates/`, `STUDY_ABROAD_RECOVERY_PLAN.md` (Phase 2).

## Why
Phase 2 of the recovery plan is still open. Counts below come from a **local** copy of the database and may be behind production: the first job of every batch is to re-count against staging or production.

| Problem | Count (local copy) |
|---|---|
| Published guides with the boilerplate "Complete 20xx guide to…" summary | 78 of 98 |
| Published universities with that summary | 17 of 45 |
| Published guides with no `official_source` or `checked_at` | 105 |
| `sa_facts` rows with no `official_source` | 11 of 41 |
| Draft US programs whose university has no page | 7 (recovery log) |

Per the recovery plan: **do not start new countries until this is done.**

## Rules for every content batch
1. **Nothing goes straight to a database.** Write a proposals file, dry-run it, submit it to the inbox; the owner approves in `/admin/agents`.
2. Submit with `node scripts/study-abroad/propose-changes.mjs <file> --target=staging --dry-run`, fix every error, then submit to staging. Production only when the owner says so.
3. **No new facts.** Rewrite using only what the page already says or what an official page confirms. Every money, visa, deadline or admission number needs `official_source` (an official site, not a coaching or listing site) and `checked_at` (the day you read it). If you cannot confirm it, leave it unchanged and list it under "Gaps".
4. Follow `CONTENT_RULES.md` (tone, headings, intros) and define official terms on first use per `TERMS.md`. No research-note phrases ("check the current…", "not specified in the official source").
5. Summaries: 220 characters or fewer, specific (who it is for, one concrete fact), never "Complete 2026 guide to…". Google title 70 or fewer, description 140–160.
6. One proposals file per batch, about 20 pages, named `scripts/study-abroad/proposals/<batch>-<date>.json`. Each file lists its sources in a short `notes` section at the top of the PR description.
7. Save any official page you rely on in the PR description so the next batch does not re-research it.

## Branch plan
Content batches only add files under `scripts/study-abroad/proposals/` (plus a findings note), so they do not conflict with each other or with dev work and can run in parallel. They do **not** need the dev specs, except C4 and C5.

| Batch | Branch | Scope | Needs |
|---|---|---|---|
| C1a | `content/sa-summaries-germany` | boilerplate summaries, Germany guides (about 40) | nothing |
| C1b | `content/sa-summaries-usa` | same for USA guides | nothing |
| C1c | `content/sa-summaries-universities` | 17 university summaries | nothing |
| C2a | `content/sa-sources-germany` | add `official_source` + `checked_at` to Germany guides, fix numbers found wrong | nothing |
| C2b | `content/sa-sources-usa` | same for USA | nothing |
| C3 | `content/sa-facts-sources` | 11 unsourced `sa_facts` rows | nothing |
| C4 | `content/sa-missing-us-universities` | draft university pages for the 7 US programs | D1 merged |
| C5 | `content/sa-uk-pilot` | UK launch set (see below) | D1, D2 merged, owner go-ahead |

Start order: C1a, C1b, C1c and C3 at once, then C2a/C2b. Review C1 and C3 first because they are the lowest risk.

---

## C1. Replace boilerplate summaries (a, b, c)

### Goal
Every published guide and university has a specific, honest summary.

### Steps
1. List targets: `sa_guides` / `sa_universities` where `status = 'published'` and `summary LIKE 'Complete 20%'` (or the D3 report when it exists).
2. For each, read the page's own `body_md` and `infobox_json`. Write a summary from what the page already says. Add `checked_at` only if you also confirmed the source (otherwise leave it).
3. Proposals file, `fields: { "summary": "..." }`, optionally `seo_title` / `meta_description` if they are over length or duplicated.
4. Dry-run, fix errors, submit to staging.

### How to check it works
- Dry-run shows 0 refusals; every summary is 220 characters or fewer and contains no template phrase.
- No two summaries in the batch start with the same five words.
- A spot check of 5 pages: the summary does not claim anything the page does not say.

### Questions / Done
(agent fills in)

---

## C2. Sources and checked dates (a, b)

### Goal
Every published guide has `official_source` and `checked_at`, and every number in it is true today.

### Steps
1. List published guides without `official_source` or `checked_at`.
2. For each, pick the claims that matter most (fees, funds, deadlines, stipends, eligibility). Open the official page (see `docs/SCHOLARSHIP_SOURCES.md` and `data/scholarship-sources.json` for known portals; for Germany: DAAD, uni-assist, German Missions in India, BAMF; for the USA: travel.state.gov, USCIS, university admissions pages).
3. If the page matches: propose `official_source` and `checked_at`.
4. If a number is wrong: propose the corrected value with `source` set on the change and the quote from the page in the PR notes. Money/visa changes go in their own file so the owner can review them separately.
5. If you cannot find an official page: do not guess. Add the page to a "Gaps" table in the findings note.

### Known leads
- DAAD amounts were corrected on 4 pages on 4 Oct; check the rest of the DAAD-related guides for the old €934 / €1,200 figures.
- TUM Informatics proposal already exists: `scripts/study-abroad/proposals/tum-informatics-2026-10-17.json` (waiting for owner approval, do not duplicate).
- KIT: confirm the €1,500 per semester figure everywhere.

### How to check it works
- Dry-run clean; every money/visa change has a source URL on the change.
- Findings note lists, per page: verified, corrected, or gap.

### Questions / Done
- **C2a Germany (2026-10-30)** — 12 verified, 1 corrected, 15 gaps. 26 published Germany guides not checked yet (listed in `scripts/study-abroad/proposals/c2a-notes.md`). Verdicts, quotes and fetch dates are in that note; the two proposals files are `c2a-sources-germany-2026-10-30.json` (24 field changes) and `c2a-corrections-germany-2026-10-30.json` (3 field changes, separate because it moves a number). Dry run against staging: `Proposed 24 … refused 0` and `Proposed 3 … refused 0`.
  - Correction: B1 German shortens the EU Blue Card route to permanent residence from **27** (not 33) months to 21 (§ 18c Abs. 2 AufenthG). The replacement article also renames its `## Executive Summary: …` heading, because `scripts/lib/sa-inbox.js` refuses any article containing that phrase — the same rename will be needed on the remaining guides that still use it.
  - Blocked by the same validator rule for wording-only proposals: 20 published USA articles and several German ones still carry an `## Executive Summary` heading.
  - Gaps worth naming: every `daad.de` URL returns 403 today, so the three DAAD guides stay unsourced; VFS pages are commercial, so the two VFS guides are gaps; `make-it-in-germany.com` answers with a bot-challenge page.
- **C2b USA (2026-10-30)** — 8 verified, 1 corrected, 13 gaps; 33 published USA guides not checked yet. The correction moves the I-765 paper fee from $410 to $520 (USCIS Form G-1055, edition 10/26/26: "General filing for initial, replacement, or renewal Paper Filing: $520"; online filing stays $470). `travel.state.gov` still returns 403, so the five F-1/DS-160/interview pages and the $185 MRV fee stay gaps.

---

## C3. Unsourced facts

### Goal
All 41 `sa_facts` rows carry `official_source` and `checked_at`.

### Steps
Same method as C2 for the 11 rows without a source. Each row is a proposal on `sa_facts` with `value` (only if it changed), `official_source`, `checked_at`, and `recheck_after` set to 90 days out (Canada and Australia facts: 30 days).

### How to check it works
Dry-run clean; the freshness script (D4) or a SQL count shows 0 rows without a source.

### Questions / Done
(agent fills in)

---

## C4. Missing US university pages (after D1)

### Goal
Each of the 7 draft US programs has a published university page, so the programs can go live.

### Steps
1. List draft `sa_programs` whose `university_slug` has no row in `sa_universities`.
2. For each university, create a `sa_new_page` proposal following `templates/UNIVERSITY_PAGE_TEMPLATE.md`: body article with sourced numbers (tuition, deadlines, GRE, STEM OPT), FAQs, `official_source`, `checked_at`.
3. After the owner approves and publishes the universities, propose `status → published` for the matching programs.

### How to check it works
Pages render on staging as drafts-then-published; no placeholder values; template sections all present.

### Questions / Done
(agent fills in)

---

## C5. UK pilot (outline only, do not start)

Starts only after: C1 and C2 done for Germany and USA, D1 and D2 merged, the D3 gate in strict mode, and the owner confirms the country order. Scope is the launch set in `STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md` §2 and E5–E9: hub, visa guide, cost guide, 12 universities, 3 programs per field, funds + IHS calculator, scholarships via Scout, launch checklist. A detailed spec will be written then, from the real shape of D1.
