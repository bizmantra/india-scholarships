# Rules for AI coding agents (Antigravity / Gemini / Codex)

Work is planned by Claude and handed off as files in `plans/`.

1. Only do what the plan file you were given says. If something is unclear or looks wrong, stop and write your question at the bottom of the plan under `## Questions` instead of guessing.
2. Touch only the files the plan lists. No drive-by refactors, no dependency changes unless the plan says so.
3. Never commit to `main`, never push, never merge. Leave changes uncommitted on the current branch; Claude reviews and opens the PR.
4. Never touch `.env*`, secrets, `scholarship.db`, or anything in `backups/`.
5. When done, run `npx tsc --noEmit` and `npm run lint`, then add a `## Done` section to the plan: what you changed, and the check results.
