# Recent changes (read this before starting any job)

Short log of what changed on the site and in the tooling, newest first. Written for AI agents
(Antigravity, Codex) that start each run with no memory. **Whoever merges a feature adds one line here.**

Last updated: 2026-10-13.

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

- Branch `feat/command-center-tasks`: Tasks board in Command Center (`app/admin/tasks/`, `/api/admin/command/tasks/`). Move to the list above when merged.
