# Study Abroad: dev specs (agent plumbing)

Written 2026-10-29. Companion: `plans/study-abroad-content-spec.md`.
Read first: `scholarship-app/AGENTS.md` item 8, `docs/study-abroad/`, `docs/AGENT_CENTER.md`, `scripts/lib/sa-inbox.js`.

## Why
Agents can already propose edits to **existing** Study Abroad pages (`sa_field_change` in the inbox). Three things are missing before Hermes and other agents can do real content work:

1. No way to **create** a page (needed for UK/Canada/Australia/Ireland and for 7 US programs whose university page does not exist).
2. The **Hermes bridge** only understands scholarships, not `sa_*` tables.
3. Nothing **stops bad Study Abroad content** from being approved or published (boilerplate, unsourced numbers, identical rows), and nothing reports stale facts.

## Rules for every spec below
- Start from `origin/main`. One branch and one PR per spec. Owner merges. Staging first, then production.
- Work in a git worktree per branch. Never `git stash` (stashes are shared across worktrees). Chain git commands with `&&`.
- Agents never write Study Abroad content straight to production. Everything goes through the inbox.
- New pages are always created as `status = 'draft'`. Going live is a separate, validated, owner-approved step.
- Do not change `scripts/push-to-turso.js` behaviour, `scripts/sync-all-playbooks-to-db.js`, or anything in `docs/archive/`.
- Run `npx tsc --noEmit` and lint on touched files. `npm run lint` has about 1,200 old errors repo-wide; do not try to fix them here.
- Fill in **Questions** and **Done** at the bottom of the spec's section when finished.

## Branch plan

| Order | Spec | Branch | Depends on | Touches (conflict risk) |
|---|---|---|---|---|
| 1 | D1 Create-draft proposals | `feat/sa-new-page-proposals` | none | `scripts/lib/sa-inbox.js`, `lib/command-center/inbox.ts`, `app/admin/agents/{InboxQueue,Cards}.tsx`, `scripts/study-abroad/propose-changes.mjs` |
| 1 (parallel) | D3 Quality gate | `chore/sa-quality-gate` | none | `scripts/check-data-formats.js`, `scripts/lib/quality-rules.js`, new `scripts/study-abroad/audit-content.mjs` |
| 2 | D2 Hermes `sa_*` support | `feat/sa-hermes-bridge` | D1 merged | `lib/command-center/hermes-bridge.ts`, `app/api/hermes/bridge/route.ts`, `docs/AGENT_CENTER.md` |
| 2 (parallel) | D4 Facts freshness | `feat/sa-facts-freshness` | D1 merged (shares Cards/orchestrator) | `app/admin/agents/orchestrator.ts`, new `scripts/study-abroad/facts-freshness.mjs` |
| Owner only | D5 Housekeeping | none (dashboard/CLI) | none | Vercel, Turso |

D1 and D3 can run at the same time because they touch different files. D2 and D4 wait for D1 so they build on the final shape of the inbox code. Never run two branches that edit `inbox.ts` at once.

---

## D1. Create-draft proposals (new rows through the inbox)

### Goal
Let an agent propose a **new** `sa_universities`, `sa_guides`, `sa_programs` or `sa_facts` row. Approving it inserts the row as a draft. The page is not visible until a later `status → published` proposal is approved.

### Design
- New proposal kind `sa_new_page` (constant `NEW_KIND` in `sa-inbox.js`; `kind` union in `inbox.ts` gets the new value).
- `scholarship_id` = `<table>:<key>` (same as today). `field` = `__new__`. `old_value` empty. `new_value` = JSON object of the full row (column → value). `category` = `study_abroad`. `payload_json` = `{ table, key, path }`.
- **Required columns per table**, read from the DDL in `scripts/lib/study-abroad-tables.js` (do not guess). At minimum:
  - universities: `slug`, `name`, `country`, `summary`, `seo_title`, `meta_description`, `body_md`, `official_source`, `checked_at`
  - guides: `slug`, `title`, `country`, `kind` (`guide|visa|loan`), `summary`, `seo_title`, `meta_description`, `body_md`, `official_source`, `checked_at`
  - programs: `id`, `slug`, `university_slug` (must exist in `sa_universities`, draft or published), `country`, `degree`, `field`, `title`, plus the money fields with a source
  - facts: `key`, `label`, `value`, `unit`, `official_source`, `checked_at`
- **Validation** reuses `validateSaValue` for every field (same length limits, banned phrases, source rules). Extra checks for new rows: slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`; key does not already exist; `country` is a known country in `lib/study-abroad/countries.ts` (unlaunched countries are allowed, since drafts are not shown); unknown columns are rejected.
- **Status is forced to `draft` on insert**, ignoring any `status` in the payload. `created_at` and `updated_at` set by the server.
- **Publish gate**: when a `status → published` `sa_field_change` is approved, validate the whole row (all required columns present, no banned phrases, every money/visa field has `official_source` and `checked_at`, summary is not boilerplate). Refuse with a clear reason if not.
- **Undo** of a new-page approval deletes the row only if it is still `draft` and `updated_at` is unchanged since approval. Otherwise refuse ("page has changed since").
- Dedup: one pending `sa_new_page` per `table:key`; a newer one supersedes (same behaviour as field changes). A rejected identical value is not proposed again.
- Command Center card: label "New page (draft)", shows table, title, country, first 300 characters of the summary, field count, source link, and a "Preview JSON" expander. Bulk approve must still work.
- Propose script: `propose-changes.mjs` accepts `{ "table", "key", "create": true, "fields": {...} }` and `--dry-run` prints validation errors per row.

### Files to change
- `scripts/lib/sa-inbox.js`: `NEW_KIND`, `REQUIRED`, `validateNewRow`, `validatePublishRow`
- `lib/command-center/inbox.ts`: approve (INSERT + event), undo, counts
- `app/admin/agents/InboxQueue.tsx`, `Cards.tsx`: card for the new kind
- `scripts/study-abroad/propose-changes.mjs`: create mode
- `docs/AGENT_CENTER.md`: short section on the new kind

### How to check it works
- Unit-style script or test: valid row passes; missing summary, bad slug, duplicate key, unknown `university_slug`, banned phrase, missing source on a money field each fail with a readable message.
- On **staging** (`--target=staging`): propose a test university, approve it, confirm the row is `draft` and `/study-abroad/universities/<slug>` returns 404, approve `status → published`, confirm it renders, then Undo works only while untouched.
- Existing `sa_field_change` flow still passes (approve and undo of a summary change).
- `npx tsc --noEmit` clean.

### Out of scope
New countries going live, nav changes, sitemap changes (drafts are already excluded; verify, do not rebuild).

### Questions
- Note on staging environment: `TURSO_STAGING_DATABASE_URL` is stored in GitHub Actions secrets / Vercel Preview environment and was not present in the local `.env.local` file. In accordance with rule 4 ("never touch `.env*`, secrets, scholarship.db, or anything in backups/") and the strict rule to never write to production, live remote queries against Turso staging could not be executed locally; all database schema operations, inbox approval/undo lifecycle, dedup, and gate checks were thoroughly validated locally with an in-memory LibSQL database and unit assertions matching Turso. Staging verification will occur on the preview deployment created from the PR.

### Done
- `scripts/lib/sa-inbox.js`:
  - Added `NEW_KIND` ('sa_new_page'), `REQUIRED` columns per table from DDL, `TABLE_COLUMNS`, and `BOILERPLATE_SUMMARY`.
  - Added `toText` helper converting nested objects/arrays (e.g. `faq_json`, `infobox_json`) to valid JSON strings.
  - Added `KNOWN_COUNTRIES` static Set matching `lib/study-abroad/countries.ts` (`germany`, `usa`, `uk`, `canada`, `australia`, `ireland`), with `opts.countries` override support.
  - Added `validateNewRow` validating required columns, slug regex (`^[a-z0-9]+(-[a-z0-9]+)*$`), known countries, guide kinds, program university_slug existence, money field sources, unknown columns, and banned phrases.
  - Added `validatePublishRow` enforcing whole-row validity, non-boilerplate summary, money/visa official sources and dates, and banned phrase checks.
- `lib/command-center/inbox.ts`:
  - Added `'sa_new_page'` to `Proposal.kind` union.
  - Handled `sa_new_page` approval in `decide()`: normalizes nested fields with `sa.toText()`, validates row (passing `new Set(Object.keys(COUNTRIES))`), checks non-existence, forces `status = 'draft'`, sets server `created_at`/`updated_at`, executes INSERT, logs approval event with timestamp.
  - Added publish gate in `decide()` for `status → published` proposals on `sa_field_change`, calling `validatePublishRow`.
  - Added `undoSaNewPage` in `undo()`: deletes draft row only if status is still `'draft'` and `updated_at` has not changed since approval; refuses otherwise ("page has changed since").
- `app/admin/agents/InboxQueue.tsx`:
  - Added `sa_new_page` support to `pageHref`, displayed "Study Abroad: New page (draft)" in field column, '—' in now column, summary preview in proposed column, and JSON preview in expanded details.
- `app/admin/agents/Cards.tsx`:
  - Added grouping and card rendering for `sa_new_page` with "New page (draft)" badge, table, title, country, first 300 characters of summary, field count, official source link, and "Preview JSON" expander.
- `scripts/study-abroad/propose-changes.mjs`:
  - Added support for `{ "table", "key", "create": true, "fields": {...} }` converting nested fields via `toText()`.
  - Added validation with `validateNewRow`, printing errors per row in `--dry-run`.
  - Implemented deduplication (bumps identical pending, refuses rejected identical, supersedes older pending).
- `docs/AGENT_CENTER.md`:
  - Added documentation on `sa_new_page` proposal format, validation rules, draft lifecycle, publish gate, and undo conditions.
- `scripts/study-abroad/test-d1.mjs`:
  - Committed end-to-end unit and regression test suite covering valid row, nested array `faq_json` and object `infobox_json`, missing summary, bad slug, duplicate key, unknown university slug, banned phrase, missing source on money fields, boilerplate summary in publish gate, approval with draft status and parsed JSON, and undo deletion/refusal.
- Verification:
  - Validated with `node scripts/study-abroad/test-d1.mjs` (all tests passing).
  - `npx tsc --noEmit` passed with 0 errors.
  - ESLint passed clean on all touched files.

---

## D2. Hermes bridge: Study Abroad support

### Goal
Hermes can propose Study Abroad edits (and read their state) the same way it proposes scholarship edits, with the same safety rules. It can never approve new pages or high-risk changes.

### Design
- New bridge actions `propose_sa` and `list` extended: `propose_sa` takes `{ profile, table, key, field, new_value, source, quote, seen_on, confidence }`. A separate action keeps the scholarship path untouched.
- `propose_sa` validates with `sa.validateSaValue`, checks the page exists, skips unchanged values, skips values the owner rejected before, supersedes pending ones, and writes an `sa_field_change` row. Agent name is `hermes-<profile>`.
- **Risk**: missing quote or `confidence = low` → `high`. Fields in `NEEDS_SOURCE` always require a quote. Anything touching `status` is `high`.
- `propose_sa` for new pages (`create: true`) is allowed, writes `sa_new_page`, and is **always** `high` risk.
- `approvalBlock` (the "what can be approved from Hermes" function): allow `sa_field_change` only when not `high`; **block** `sa_new_page` and any `status` change with "Approve in the Command Center".
- Staging-only default and the two tokens stay exactly as they are. Do not enable production.

### Files to change
- `lib/command-center/hermes-bridge.ts`: `proposeSa`, `approvalBlock`, list output includes `kind`, `table`, `key`
- `app/api/hermes/bridge/route.ts`: route the new action
- `docs/AGENT_CENTER.md`: Hermes bridge section

### How to check it works
- Staging with the bridge enabled: `propose_sa` for a summary change appears in the inbox as a Hermes card; without a quote it is `high`.
- Approve from Hermes works for a low-risk `sa_field_change` and is refused for `sa_new_page` and `status`.
- Scholarship `propose` and `approve` behave exactly as before (run the existing bridge checks).
- Kill switch (`agent_settings hermes-bridge enabled=false`) still returns the existing refusal.

### Questions
### Done

---

## D3. Study Abroad quality gate and audit report

### Goal
Stop thin or unsourced Study Abroad content from shipping, and produce an exact worklist for the content spec. Closes recovery plan item #15.

### Design
- New read-only `scripts/study-abroad/audit-content.mjs [--target=staging|production]`. Writes `data/study-abroad/quality-report.md` and `quality-report.json` (one entry per page with the failed rule).
- Rules on **published** rows (reuse `sa-inbox.js` constants, do not copy them):
  1. Boilerplate summary (`/^\s*complete 20\d\d guide to/i`), summary over 220 characters, empty summary.
  2. `seo_title` over 70, `meta_description` outside 110–170, duplicate `seo_title` across pages.
  3. Banned phrases anywhere in `body_md`, `summary`, `faq_json`.
  4. Money/visa fields present without `official_source` or `checked_at`; `checked_at` older than 90 days (warning).
  5. Identical money values repeated across 4+ universities or programs of the same country (the "all rows identical" problem, recovery #23).
  6. Internal links in `body_md` that point to routes that do not exist or to unlaunched countries.
  7. Published `sa_programs` whose `university_slug` is missing or draft.
- Wire the same rules into `scripts/check-data-formats.js` as a **baseline-aware** gate: it fails only on problems **not** in `data/study-abroad/quality-baseline.json`. Once the content spec clears the backlog, a one-line change turns on strict mode (empty baseline).
- Report separates **errors** (block) and **warnings** (review).

### Files to change
- `scripts/study-abroad/audit-content.mjs` (new)
- `scripts/check-data-formats.js`, `scripts/lib/quality-rules.js`
- `data/study-abroad/quality-baseline.json` (generated once, committed)
- `docs/study-abroad/README` or this plan: how to run it

### How to check it works
- Run against staging, then production (read-only). Counts must roughly match the audit in the content spec (about 78 boilerplate guide summaries, 17 universities, 105 guides without sources; local copy, so production may differ).
- A new boilerplate summary added to a staging row makes the gate fail; an existing baseline problem does not.
- No writes to any database.

### Questions
### Done

---

## D4. Study Abroad Facts freshness

### Goal
Know which money/visa numbers are stale or unsourced, and queue them for re-checking, like Deadline Freshness does for scholarships. Recovery plan "New agents".

### Design
- Read-only `scripts/study-abroad/facts-freshness.mjs`: lists `sa_facts` where `official_source` is empty, `checked_at` is empty, `checked_at` is older than 90 days, or `recheck_after` is past. Also lists published university/program money fields that lack a matching `sa_facts` entry.
- Output: a worklist file `data/study-abroad/facts-worklist.json` with, for each fact: key, current value, source we hold, last checked, why flagged.
- Agent Center: a "Study Abroad Facts" row in `orchestrator.ts` (name, last run, count flagged) that opens the worklist. The agent only **flags**; re-checking and proposing is done by Hermes or Claude through D2 or `propose-changes.mjs`.

### Files to change
- `scripts/study-abroad/facts-freshness.mjs` (new)
- `app/admin/agents/orchestrator.ts`, `Cards.tsx`
- `docs/AGENT_CENTER.md`

### How to check it works
- Against staging: output matches a manual SQL count of the same conditions.
- Agent Center shows the new row with a count; no writes to `sa_*`.

### Questions
### Done

---

## D5. Owner-only housekeeping (not for agents)
- Recovery #40/#41: confirm the old Vercel project `study-abroad-is` only redirects, delete it, take a final dump of the `study-aboard-is` Turso database, then destroy it (closes the leaked-token item #3).
- Decide whether the Hermes bridge ever runs on production (`HERMES_BRIDGE_ALLOW_PRODUCTION`). Not part of D2.
- Country order decision (UK → Canada → Australia → Ireland) in `STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md` §7.

---

## D6. Deterministic source checks (added 2026-10-29)

### Goal
Stop relying on AI to confirm facts. A registered fact passes only if its exact quote is still on its official page and contains the value. Runs in CI on every change to the registry and weekly.

### Design
- `data/study-abroad/source-checks.json`: one entry per verified fact (`url`, `quote`, `value`, `checked_on`). A person reads the page and adds the entry; code checks it from then on.
- `data/study-abroad/official-domains.json`: the only hosts allowed (51 domains: government and embassy sites, plus the universities own domains taken from existing rows, judged by domain name). Subdomains count; lookalikes do not. Providers are never added.
- `scripts/lib/source-verify.mjs`: pure functions (normalise, strip HTML, host check, validate, check). No AI, no database.
- `scripts/study-abroad/verify-sources.mjs`: CLI. Exit 1 on a mismatch or a disallowed host. A page that cannot be fetched is `unverifiable` (reported, not failed; `--strict` fails it).
- `.github/workflows/sa-verify-sources.yml`: on PRs that touch these files and every Monday.

### Not in scope
Proposals from agents are not yet checked against the registry; the next step is to make `propose-changes.mjs` refuse a `source` that is not in the registry or on the allowlist.

### How to check it works
- `node --test scripts/study-abroad/verify-sources.test.mjs` (19 offline tests).
- `node scripts/study-abroad/verify-sources.mjs` (live: the ICE I-901 page passes).

### Done
- Built with the seed entry `usa-sevis-i901-f-m`. Tests and the live run pass.
- The Sperrkonto, APS, visa-fee and travel.state.gov facts are not registered: no live page supports their figures yet (see PR 97 notes).
