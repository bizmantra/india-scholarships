# Study Abroad Recovery Plan

**Created:** 27 Sep 2026
**Inputs:** Codex/ChatGPT audit (Sep 2026) + Claude Code 4-lens review (PM, strategy, UX, engineering), verified against code, local DB and the live site.
**Status:** Approved by owner. **Phase 1 cut-over live 28 Sep 2026** (india-scholarships PRs #20, #22, #23): /study-abroad is now served by scholarship-app from the sa_* tables. This file is the single work list — update the checkboxes as items ship. Do not start new content or new countries until Phase 2 is done.

---

## Decisions (locked — do not re-litigate)

| Topic | Decision |
|---|---|
| Monetization | **Both** display ads and affiliate/referral (education loans, blocked accounts, forex, insurance). Affiliate links always disclosed. |
| Content scope | **Fix all existing content** (199 records + 32 programs), not only Germany. |
| Empty countries | UK, Canada, Australia, Ireland, "Global" are empty shells → hidden from nav + sitemap + noindexed until they have real content. |
| Architecture | **Merge `study-abroad-app` into `scholarship-app`** as `/study-abroad/*` routes. One app, one database, one sitemap, one safe sync pipeline. |
| Scholarships | Parent `scholarships` table is the single source of truth (already has 122 international). Study Abroad's 29 copies are retired. |
| Design | **Use the main IndiaScholarships site design** (header, footer, typography, colors, components). Supersedes the earlier "wiki-style" direction. |
| Publishing | Legacy markdown in `docs/archive/legacy-playbook-poc` is research material only. It never publishes. The importer is deleted. |
| Pipeline | Reuse the parent's safe Turso sync (pull → format gate → backup → batched writes, no DROP). No separate Study Abroad push script. |

### Command center & main-site scripts (Agent Center in `scholarship-app/app/admin`)
Study Abroad runs on the main site's Agent Center and scripts after the merge. It does not keep its own tooling; the ~30 scripts in `study-abroad-app/scripts` are retired, not ported.

| Main-site piece | After merge |
|---|---|
| Admin / Agent Center UI, inbox, approvals | Works as is |
| Database Backup (`backup-turso.js`) | Automatic (backs up every table) |
| International scholarships in parent `scholarships` table | Automatic: Deadline Freshness, Weekly Enrichment, Quality Fixer, Scout, Indexing already cover them |
| `push-to-turso.js` | Add the `sa_*` tables to `SYNCED_TABLES` (it is an allowlist; unlisted tables never sync) |
| `check-data-formats.js` / `lib/quality-rules.js` | Add Study Abroad rules (no placeholders, no boilerplate summary, `source_url` + `checked_at` on money/visa fields) |
| Traffic Watchdog | Add key `/study-abroad/*` paths to the health list; GSC comparison picks them up |
| Indexing agent | Reads changes from `scholarship_changelog` only; add Study Abroad changes |
| New agents (later) | "Study Abroad Facts" (visa fees, blocked account, stipends, deadlines; like Deadline Freshness) and a Study Abroad Quality Fixer. Phase 2 content cleanup should run through the inbox as gated proposals, not as bulk edits |

Note: the local `scholarship-app` checkout was 49 commits behind `origin/main` on 27 Sep 2026. Always start merge work from `origin/main`.

### Codex suggestions deliberately NOT adopted
- A full shared-platform rebuild (`content_items` core, versioning tables, publication runs, separate staging/promotion pipeline). The merge + parent's existing sync/gate covers the same risks.
- Field-level verification table for every fact. Instead: `source_url` + `checked_at` on high-risk numbers only (stipends, blocked account, visa funds, fees, deadlines); a page-level checked date for everything else.

---

## Verdict key
✅ verified · 🟡 partly correct · ⚪ not yet verified (goes into fact-check) · ❌ could not reproduce
Source: **C** = Codex, **CC** = Claude Code

---

## Phase 0 — Containment on the live site (before the merge)

- [x] **1.** Canonicals + all 227 sitemap URLs use non-www `indiascholarships.in`, which 307-redirects to `www`. Fix `src/lib/constants.ts` (`domain`, `parentDomain`) and `next.config.ts` redirect destination. Also check `NEXT_PUBLIC_SITE_URL` in Vercel env. — CC ✅
- [x] **2.** Homepage canonical is `/study-abroad/index` (duplicate URL also returns 200). Canonical → `/study-abroad`, redirect `/index`. — CC ✅
- [ ] **3.** Turso auth token hard-coded as fallback in `src/lib/db.ts`. — C ✅
  - Done (PR #5, 27 Sep): fallback removed; `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` now set in Vercel (Production + Preview).
  - **Decision: do NOT rotate now.** Turso invalidates tokens per *group*, and `study-aboard-is`, `india-scholarships` and `india-scholarships-staging` share the `default` group, so rotating would break the main site, staging and all Agent Center workflows. The leaked token is scoped to `study-aboard-is` only (read/write, no expiry), and the repo is private with a single collaborator and no forks.
  - **Fix: delete the `study-aboard-is` database after the Phase 1 merge** (see #41). That makes the leaked token useless with nothing else to update.
- [x] **4.** Study Abroad sitemap not referenced by root sitemap index or robots.txt. Add to parent sitemap index (parent repo). — C ✅
- [x] **5.** Sitemap includes 20 coming-soon country URLs; omits `/tools/*` and scholarships hubs. — C ✅
- [x] **6.** `scripts/push-to-turso.js` drops production tables and inserts without a transaction. Retire it (block execution). — C ✅
- [x] **7.** `queryDb` swallows errors and returns `[]` → builds silently publish empty pages. Fail loudly at build time. — C ✅
- [x] **8.** Two records expose local `/Users/...` filesystem paths publicly. Targeted UPDATE on Turso (owner approval). — C ✅
- [x] **9.** 404s: `/visas/germany-student-visa` → redirect to correct visa guide; `/programs` index → build or redirect. (Program detail pages work — they read `src/data/programs.json` directly; DB `programs` table is empty.) — C 🟡

- [x] **37.** `/programs/[country]/[degree]/[field]` renders a 200 page for any slug (e.g. "MS in Basket Weaving in Germany") and lists every university in the country without filtering by program — the real cause of #23. Restrict to combos in `programs.json` and list only universities offering that program. — CC ✅
- [x] **38.** JSON-LD URLs on visa hubs, scholarship pages and program pages omit `/study-abroad` (point to 404s). — CC ✅

## Phase 1 — Merge into `scholarship-app`

- [x] **39.** Duplicate university records (two URLs each): KIT, TU Berlin, Northeastern, Texas A&M, UT Dallas, Buffalo. Keep one, 301 the other. — CC ✅

- [x] **10.** Two DBs; 16 scholarship slugs exist in both with no shared ID. Study Abroad reads parent `scholarships`; merge any richer SA detail into parent records; retire SA copies. — C ✅
- [x] **11.** Archived markdown is still the publishing source via `scripts/sync-all-playbooks-to-db.js`. Delete the importer. — C ✅
- [x] **12.** All content is a generic `data_json` blob → UI falls back to placeholder defaults. Create typed tables in the parent DB: `sa_universities`, `sa_programs`, `sa_visa_guides`, `sa_financial_products`, `sa_guides`, with `source_url` / `checked_at` on money and visa fields. — CC ✅
- [x] **13.** `programs` table empty; 32 programs live in `src/data/programs.json` and are never imported. Import into `sa_programs`. — C ✅
- [ ] **14.** Lint: 82 errors, 55 warnings. Fix in ported code; the rest is deleted with the old app. — C ✅
- [ ] **15.** No tests/CI. Add SA tables to parent's data-format gate + route/link check. — C ✅
- [ ] **40.** Retire the separate Vercel project `study-abroad-is.vercel.app`. Today the parent's `scholarship-app/next.config.ts` rewrites `/study-abroad/*` to it, and it is also publicly reachable (duplicate content, no noindex). Cut-over: ship the merged `/study-abroad` routes and delete the rewrite in the same deploy → keep the old project ~1 week as fallback → make it redirect everything to `www` → delete it and its env vars. — CC ✅
- [ ] **41.** After the merge is live and verified: take a final backup of `study-aboard-is` (`turso db shell study-aboard-is .dump > study-aboard-is-final.sql`), then `turso db destroy study-aboard-is`. This also closes #3 (leaked token). Remove its env vars from Vercel with #40. — CC
- [x] **16.** Port from Next 16 / React 19 to parent's Next 15 / React 18 (~9.2k lines). — CC ✅

## Phase 2 — Content cleanup (all 199 records + 32 programs)

- [ ] **17.** "Navigation Breadcrumb" leftovers in body — **187** records. — C ✅
- [ ] **18.** "Primary SEO Title" / internal notes visible — **75**. — C ✅
- [ ] **19.** Raw `<div>` markup inside content — **61**. — C ✅
- [ ] **20.** Boilerplate summary "Complete 2026 guide to X for Indian students and parents" — **178 of 199**. Rewrite every summary. — C ✅ (worse than reported)
- [ ] **21.** `.md` filenames / internal nav text in summaries — **11**. — C ✅
- [ ] **22.** University records with no main body — **5**. — C ✅
- [ ] **23.** MS CS comparison page: all 22 universities show identical values (~₹21.5L, Free, IELTS 6.5+, GRE optional, 18 months). Real per-program data from #12. — CC ✅
- [ ] **24.** KIT shown "Free" while text says €1,500/semester; KIT and TU Berlin listed twice. — CC ✅
- [x] **25.** "Global Study Abroad" rendered as a country. — C ✅
- [x] **26.** Placeholder country-card stats ("Flexible Tuition", "Varies", "4–6 weeks") — real values for Germany and USA. — C ✅
- [ ] **27.** Brand repeated twice in some titles. Re-check all titles post-merge. — C ❌ (not found in 40-page sample)

## Phase 3 — Accuracy & UX

- [ ] **28.** Fact-check pass on all high-risk numbers. Known lead: DAAD stipend shown €934 / €1,200; Codex reports current €992 / €1,300. — C ⚪
- [ ] **29.** "Last Verified: 2026–27 Academic Cycle" is not an auditable date (hard-coded in a component, not DB). Replace with `source_url` + `checked_at`. — C 🟡
- [x] **30.** Homepage search box has no form or handler. Use the parent site's search. — C ✅
- [x] **31.** "Calculator" cards link to articles/visa/university pages instead of `/tools/*`. — C ✅
- [ ] **32.** Mobile lab perf ~7.2s LCP / ~10.1s TTI. Re-measure after merge. — C ⚪
- [x] **33.** Apply the **main IndiaScholarships design** to every Study Abroad page type (hubs, universities, programs, scholarships, visas, loans, tools). Remove dark hero banners, badge grids, nested cards, `ModernistHeader`. — CC ✅

## Phase 4 — Monetization & measurement

- [x] **34.** Standard affiliate disclosure component; methodology note on any "best"/comparison page. — C
- [ ] **35.** Tracking: GSC clicks on `/study-abroad/*`, outbound partner clicks, ad revenue per section. — CC
- [ ] **36.** Add ~30 Study Abroad terms (from `Keyword Research/` Ubersuggest files) to rank tracking. — C

---

## Rules for any AI agent working on this

1. Work from this list. Do not add pages, countries or content types that are not on it.
2. Never run `scripts/push-to-turso.js` or `scripts/sync-all-playbooks-to-db.js`.
3. Never publish from `docs/archive/`.
4. Every money/visa number needs an official `source_url` and `checked_at`, or it does not ship.
5. A page with placeholder values ("Varies", identical rows, boilerplate summary) is not done.

---

## Progress log

- **27 Sep 2026:** Phase 0 live (Study-Abroad-IS PR #5). Path leaks fixed in Turso.
- **28 Sep 2026:** Phase 1 cut-over live.
  - Tables `sa_universities` (45), `sa_programs` (32), `sa_guides` (118), `sa_facts` (17) in the main database. Migration: `scholarship-app/scripts/study-abroad/migrate-legacy.mts` (re-runnable). Report: `scholarship-app/data/study-abroad/migration-report.md`. Production was backed up first.
  - Pages rebuilt on the main site's listing (scholarships-in/[state]) and detail (scholarships/[slug]) layouts.
  - Redirects: `scholarship-app/lib/study-abroad/redirects.json` + `next.config.ts`. Rewrite to study-abroad-is removed.
  - Found in migration: 7 internal docs had been published (now drafts, redirected); 3 old scholarship pages described programs that don't exist (Harvard, Tata Trusts, USC); 7 US programs lack a university page (drafts).
- **Still open in Phase 1:** #14 lint (old app only), #15 Agent Center checks for sa_* tables, #40 retire the old Vercel project (after ~1 week), #41 delete `study-aboard-is` (after #40). Scout leads for 9 scholarships to run against production (owner approval).
