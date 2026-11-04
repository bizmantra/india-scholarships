# Recent changes (read this before starting any job)

Short log of what changed on the site and in the tooling, newest first. Written for AI agents
(Antigravity, Codex) that start each run with no memory. **Whoever merges a feature adds one line here.**

Last updated: 2026-11-03. Merges #74-#101 since Oct 13 are not itemised below yet.

## What agents must do differently now

- **Researching scholarships:** read `docs/SCHOLARSHIP_SOURCES.md` first. Check a scholarship's `source_pages`,
  then `official_source` and `apply_url`, before searching the web. New scholarships start from
  `data/scholarship-sources.json`. Save official pages you confirmed to `source_pages`. Listing/platform sites
  (Buddy4Study, Careers360, ...) go to `secondary_sources` only; never use coaching sites; never change a number
  based on a secondary page alone.
- **Content links:** editorial pages are `/guides/:slug` (see `docs/INTERNAL_LINKING_STRATEGY.md`).
- **Localized pages are gone:** `/hi`, `/bn`, `/ta`, `/te`, `/or`, `/kn` were pulled. Do not write or link to localized content.
- **Never touch** `.env*`, `scholarship.db`, `backups/`, `.mcp.json`. Claude builds features; agents do content/research from a plan file only.

## Merged to main

**Nov 4**
- UK MBA course pages: 11 pages (Newcastle, Glasgow, Manchester, Warwick, Coventry, Birmingham, Edinburgh, Leeds, Nottingham, Sheffield, Southampton) were reviewed on the project board and filed to the production Inbox as hidden drafts. Filing files are in `scripts/study-abroad/proposals/uk-course-*-mba-*.json`; research notes and live-page verification reports are in `plans/uk-research/mba/`. No UCL MBA page (owner decision). The UK stays hidden until the hub page ships.
- UK health surcharge is charged per year of visa length, not course length: £776 is the minimum for a one-year master's (`plans/uk-research/uk-surcharge-note.md`).

**Nov 3**
- `scripts/study-abroad/check-draft-numbers.mjs`: before filing a drafted page, run it against the research notes. It lists every figure on the page (money, percent, IELTS, durations, dates) that is not in the notes. Caught an invented price range in the Newcastle pilot.
- #128 Study Abroad country pages can list one picked entry per scholarship (even when the round has closed) and leave out duplicates, plus a one-line callout. Only the UK has picks (`lib/study-abroad/scholarship-picks.ts`); the UK is still hidden. Main-site scholarship pages are unchanged.
- UK visa guide and UK cost guide filed as draft pages (approved); UK round 4 research notes saved in `plans/uk-research/`.

**Nov 2**
- #124 Command Center Inbox table: opening a new scholarship's row shows its amount, who can apply, deadline, benefits, how to apply and what is missing.
- UK research (visa, 12 universities, scholarships) saved in `plans/uk-research/`. UK visa facts (13 changes) and two new scholarships (GREAT India, Edinburgh India Merit) were proposed to the production Inbox. The UK stays hidden (`launched: false`) until its pages pass the launch checklist.
- #125 `feat(study-abroad)`: Batch migrate 92 `sa_guides` holding legacy `## Executive Summary: [Topic]` headings to clean passage-indexed H2s. Added validator resilience in `scripts/lib/sa-inbox.js` allowing legacy markdown without external source links to carry forward, matching `BANNED` precedent. Pre-flight verification suite in `scripts/study-abroad/preflight-heading-proposals.mjs`.
- #123 `feat(study-abroad)`: C2 second pass proposals for 14 guides and 11 facts freshness (from 118-guide audit scope) with verified 1-to-1 statutory authorities.
- #122 `content(study-abroad)`: Form I-20 deficit calculation & Section 80E tax deduction guides (ART-126, ART-127).
- #121 `feat(audit)`: Targeted file prose audit and canonical link redirects.
- #120 `fix(trust)`: Accurate state counting, confirmed-only closing soon, and remove unverified social proof.

**Oct 31**
- `docs/PROJECT_CONTEXT.md`: shared context for all assistants (roles, how work ships, standing decisions, traps). `AGENTS.md` now says to read it first and keep it updated.

**Oct 30**
- Docs cleanup: browser profiles, `scratch/`, one-off exports and old backups removed from git; stale docs moved to `docs/archive/`, `data/archive/`, `plans/archive/`; `GEMINI.md` now points to `AGENTS.md`.

**Oct 13**
- #61, #62 Long-tail pages: OASIS and Odisha portal guides, guide links on scholarship pages, school/college section on state pages. Duplicate Bihar post-matric articles merged; Karnataka income-limit takeaway corrected.
- #60 Study Abroad course pages can hold an article, FAQs and full facts.

**Oct 11-12**
- #59 Sitemap now lists main tools, UP and MahaDBT guides, international hub; test routes dropped.
- #58 Study Abroad university and course pages follow their templates (`docs/study-abroad/`).
- #56, #57 Study Abroad pages appear in the Command Center inbox; approvals refresh the affected pages.
- #53-#55 Study Abroad docs: audit actions, course/university templates, templates for every remaining page type, byline "IndiaScholarships Editorial Team".

**Oct 4-5**
- #51 Command Center **teams** view: one page per team, team filter on the Inbox.
- #42, #44 Scholarship **sources**: `source_pages`, `secondary_sources`, source tiers, `data/scholarship-sources.json`.
- #46 **Evidence score** (0-100) on every inbox proposal.
- #47, #48, #50 **Source backfill**: finds a source page for scholarships that have none; reports no self-citations or redirect links; re-runs stale "ended"/"not-found" outcomes.
- #34-#41 SEO recovery fixes (see `plans/gsc-traffic-recovery.md`): old slugs and subdomains redirect, soft-404 fixes on state/level/Study Abroad hubs, sitemap cleanup, audit no longer flags reader questions.
- #45, #49 Study Abroad country expansion step 0 and hub bug fixes.
- #52 `.mcp.json` and `.claude/settings.local.json` git-ignored (tokens).

**Sep 26-28 (PRs #1-#22: Command Center and Agent Center first build; details in `docs/AGENT_CENTER.md`)**
- #1-#5 Command Center data layer and UI (the `/admin` area).
- #9, #15 Inbox tab for agent proposals; duplicate-proposal fix. #11 morning briefing. #12 run queues.
- #13 quality fixer. #14 "closed" wording on ended scholarships. #21 evidence fact-check.
- #16-#18 traffic and indexing switches. #20 Study Abroad merged into this app.
- #6, #8, #10, #19, #22 preview login relay, logout fix, theme, admin cleanup, tsconfig fix.

**Sep 28-29**
- #29/#32 Kit email popup merged then reverted (held for spam fix).
- #30 AI handoff workflow (`plans/`, `GEMINI.md`). #31 CI quality audit is report-only.
- #23-#28 Study Abroad pages, layouts, redirects.
- Localized pages pulled (Sep 29).

## In progress (not merged yet)

- Branch `content/uk-cs-ds-batch1` (2026-11-04, local commit, not pushed): UK MSc CS and DS batch 1 (Birmingham, Coventry, Edinburgh, Glasgow): research notes in `plans/uk-research/cs-ds/` and 8 hidden draft proposals `scripts/study-abroad/proposals/uk-course-*-{cs,ds}-2026-11-04.json`; not filed.
- Branch `feat/command-center-tasks`: Tasks board in Command Center (`app/admin/tasks/`, `/api/admin/command/tasks/`). Move to the list above when merged.
