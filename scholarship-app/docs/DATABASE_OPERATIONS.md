# Database Operations

How scholarship data moves between the local SQLite file, Turso and the live site, and the rules every
script, agent and AI assistant must follow. **Read this before changing data or any sync script.**

## Where the data lives

| Copy | Role |
|---|---|
| `data/scholarships.db` (in git) | **Master copy for now.** Scripts and agents edit this file. |
| Turso **production** (`TURSO_DATABASE_URL`) | What the live site reads. Updated from the master copy by `push-to-turso.js`. |
| Turso **staging** (`TURSO_STAGING_DATABASE_URL`) | A separate copy for testing new or changed agents. Never shown to users. |

A later step makes Turso production the only master copy. Until then, the rules below apply.

## Rules

1. **Never drop, empty or recreate a table on Turso production.** `push-to-turso.js` only inserts and
   updates changed rows, in small transactions, and never deletes. Do not reintroduce `DROP TABLE`.
2. **Deleting a scholarship:** set `status = 'Closed'` instead of deleting the row. Rows removed from the local file are
   reported by the sync as "only on turso" and are left untouched.
3. **Formats are enforced.** `check-data-formats.js` runs before every sync and fails the run if, for example,
   `income_limit` is text, `deadline` is not `YYYY-MM-DD`, `scholarship_scope` is not `Domestic`/`International`,
   or `docs_needed`/`faq_json` are not JSON lists. `clean-data-formats.js` fixes the mechanical cases automatically.
   Cases needing a human decision are listed in `data/format-exceptions.json`.
4. **Test on staging first.** Run a new or changed agent with `--target=staging` (or the workflow's
   "target: staging" option) before letting it touch production.
5. **Back up before risky work.** `node scripts/backup-turso.js` writes a full copy to `backups/`.

## Commands

| Task | Command |
|---|---|
| Sync local file → Turso (safe upsert) | `node scripts/push-to-turso.js [--target=staging] [--dry-run]` |
| Back up Turso to a file | `node scripts/backup-turso.js [--target=staging] [--out=file.db]` |
| Make staging a copy of production | `node scripts/refresh-staging.js` |
| Restore a backup | `node scripts/restore-turso.js --from=file.db --target=staging` (production also needs `--confirm-production`, and takes a safety backup first) |
| Fix mechanical format problems | `node scripts/clean-data-formats.js [--dry-run]` |
| Check formats | `node scripts/check-data-formats.js` |

## Automated workflows (GitHub Actions)

| Workflow | What it does |
|---|---|
| Daily Database Backup | Backs up production every morning; the file is kept 30 days as a run artifact. |
| Daily Deadline Freshness Check / Weekly Enrichment / Publish Scout-Approved | Normalize → check formats → commit → back up Turso → safe sync. Can be run manually against staging. |
| Refresh Staging Database | Copies production into staging (reads production only). |

All workflows that write the database share the `database-writes` concurrency group, so they never run at the same time.

## Required secrets

- GitHub Actions: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TURSO_STAGING_DATABASE_URL`, `TURSO_STAGING_AUTH_TOKEN`
- Vercel **Preview** environment: `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` set to the **staging** values, so preview deployments
  never read or write production. (Production environment keeps the production values.)
