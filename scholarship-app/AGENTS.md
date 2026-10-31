# Rules for AI coding agents (Antigravity / Gemini / Codex)

Work is planned by Claude and handed off as files in `plans/`.

1. Only do what the plan file you were given says. If something is unclear or looks wrong, stop and write your question at the bottom of the plan under `## Questions` instead of guessing.
2. Touch only the files the plan lists. No drive-by refactors, no dependency changes unless the plan says so.
3. Never commit to `main`, never push, never merge. Leave changes uncommitted on the current branch; Claude reviews and opens the PR.
4. Never touch `.env*`, secrets, `scholarship.db`, or anything in `backups/`.
5. When done, run `npx tsc --noEmit` and `npm run lint`, then add a `## Done` section to the plan: what you changed, and the check results.
6. Any content work (articles, news, pillars/guides) must follow `docs/INTERNAL_LINKING_STRATEGY.md`. In particular: link editorial pages as `/guides/:slug` (never `/articles/` or `/pillars/`), set `targetMoneyLink` to the one best next step, keep `relatedScholarships` to genuinely relevant slugs, and when you set `relatedPillarSlug` also add the reverse entry to that pillar's `relatedArticleSlugs`. Run its section 12 checklist before finishing.
7. Before starting any job, read `docs/PROJECT_CONTEXT.md`, `docs/RECENT_CHANGES.md` and `docs/SCHOLARSHIP_SOURCES.md`. They hold changes made since this file was last updated.
8. Study-abroad content (pages under `/study-abroad`, `sa_*` tables) follows `docs/study-abroad/`: page structure in `templates/`, prose tone, headings and intros in `CONTENT_RULES.md`, and plain-English definitions of official terms in `TERMS.md` (define each on first use). `PORT_MAP.md` says what came from the retired Study-Abroad-IS repo; do not look there for rules.
