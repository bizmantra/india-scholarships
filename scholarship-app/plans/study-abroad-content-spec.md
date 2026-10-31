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
- **Batch C1b (2026-10-29)**: Replaced boilerplate "Complete 2026 guide to…" summaries for all 49 published USA guides in `sa_guides` on staging.
  - Proposals generated in 3 files: `scripts/study-abroad/proposals/c1b-usa-summaries-1-2026-10-29.json` (20), `c1b-usa-summaries-2-2026-10-29.json` (20), `c1b-usa-summaries-3-2026-10-29.json` (9).
  - Dry-run: 0 refusals. All 49 proposals submitted cleanly to the staging inbox.
  - Length check: all <= 220 characters; no duplicate first 5 words; 0 skipped.
  - 5-page factual spot-check documented in `scripts/study-abroad/proposals/c1b-notes.md`.
- **Batch C1c Done (2026-10-29)**:
  - Database counts: Turso Production is current/master, where 16 published universities retain boilerplate summaries (29 already have specific summaries). Turso Staging was an unrefreshed snapshot with 37 boilerplate summaries.
  - Proposals file: `scripts/study-abroad/proposals/c1c-university-summaries-2026-10-29.json` covers all 37 pages on staging.
  - Review revisions: 20 proposals containing extrapolated generic semester fees (€250–€350) or unverified grade matrix cutoffs were rejected in the staging inbox and rewritten using strictly verified figures from the page data (e.g., TU Dresden €361, Chemnitz €341.40, GT $16,540 / $57,025 I-20, NEU $1,922/credit / $59,449 I-20, UB $14,914.86 / $57,200 I-20, UTA $44,720 / GRE 305+).
  - Dry run & staging submission: clean (20 revised proposals proposed, 17 approved earlier waiting as pending, 0 refusals).
  - All 37 summaries meet length (<= 220 chars), specificity, and distinct first 5 words requirements.
  - Detailed audit notes recorded in `scripts/study-abroad/proposals/c1c-notes.md`.

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
- **Batch C3 (2026-10-29, trimmed 2026-10-30 after review)**: one fact proposed; everything else is a gap.
  - **Count Reconciliation**:
    - Spec / production baseline: 41 total rows; 30 rows carry official sources; **11 rows** were unsourced.
    - Staging database status: 17 rows without a source, because staging also lacks the sources production holds for 6 government/statutory facts (`germany.blocked_account.annual_eur`, `germany.blocked_account.monthly_withdrawal_eur`, `germany.aps.fee_inr`, `germany.visa.national_fee_eur`, `usa.visa.f1_mrv_fee_usd`, `usa.visa.sevis_i901_fee_usd`).
  - **Result: 1 verified, 18 gaps, 0 corrections.**
    - **Verified (1)**: `usa.visa.sevis_i901_fee_usd` — ice.gov fee table reads "I-901 SEVIS Fee F or M visa applicants (full payment) $350". Re-checked on 2026-10-30 (HTTP 200); the proposal keeps the date it was first verified, 2026-10-29.
    - **Gaps (18, unchanged, no proposal)**: all 11 core unsourced facts from the spec, plus 7 more that staging also lacks a source for. Reasons: commercial provider pricing is never an `official_source` (Expatrio ×2, Fintiba ×2, Coracle ×2); the Federal Foreign Office blocked-account page carries no euro amount; the APS page states no fee; the visa-fees page returns 404; `travel.state.gov` returns 403 to every client we have (the $185 MRV quote could not be re-confirmed); the buffer, VFS logistics fee, FX rates and US living-cost figure have no statutory source.
  - **Proposals**: `scripts/study-abroad/proposals/c3-facts-sources-2026-10-29.json` now carries a single change — `official_source`, `checked_at: 2026-10-29`, `recheck_after: 2027-01-27` for `usa.visa.sevis_i901_fee_usd`.
  - **Staging inbox cleanup (2026-10-30)**: the first submission left 27 pending proposals on staging for the 9 fact keys that the trimmed batch no longer supports (ids 2933–2959). They were marked `superseded` (`decided_by = system:replaced`, note "withdrawn: C3 batch trimmed to the one fact whose quote is on the live official page"). Only ids 2960–2962 (`usa.visa.sevis_i901_fee_usd`) remain pending for the owner.
  - **Dry-run**: `Proposed 0, already waiting 3, unchanged 0, refused 0.` (The 3 are the SEVIS proposals already sitting in the staging inbox.)
  - **Full notes & verdict table**: `scripts/study-abroad/proposals/c3-notes.md`.

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
