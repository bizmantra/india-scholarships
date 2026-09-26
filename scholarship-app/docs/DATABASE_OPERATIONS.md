# Database Operations

How scholarship data moves between the local SQLite file, Turso and the live site, and the rules every
script, agent and AI assistant must follow. **Read this before changing data or any sync script.**

## Where the data lives

| Copy | Role |
|---|---|
| Turso **production** (`TURSO_DATABASE_URL`) | **The master copy.** The live site, `/admin` and every agent read and write it. |
| Turso **staging** (`TURSO_STAGING_DATABASE_URL`) | A separate copy for testing new or changed agents. Vercel **Preview** deployments use it. |
| `data/scholarships.db` | A **local working copy**, downloaded with `npm run db:pull`. Not in git. Throwaway. |

## The workflow: pull → edit → push

```
npm run db:pull          # 1. fresh copy of Turso + a base snapshot (data/.turso-base-production.db)
node scripts/<your-script>.js   # 2. edit data/scholarships.db as before
npm run db:push          # 3. sends ONLY what step 2 changed
```

The push compares three versions of every field (the base snapshot, your copy and Turso as it is now):
- fields you changed are written;
- fields someone else changed on Turso in the meantime (an `/admin` edit, another agent) are kept;
- if you both changed the same field, **Turso's value wins** and the clash is reported.

A push **without a fresh pull is refused**, because a stale local copy would overwrite newer data.
`--no-base --overwrite-turso` forces "make Turso match this file" and is only for deliberate repairs.

The site build (`npm run build`) pulls from Turso first, so every deploy uses current data.

## Rules

1. **Never commit `data/scholarships.db`** and never edit Turso by dropping/recreating tables.
2. **Always pull before editing**, and push soon after (small time window = fewer clashes).
3. **Deleting a scholarship:** set `status = 'Closed'`. The push never deletes rows.
4. **Formats are enforced.** `check-data-formats.js` runs before every agent push and fails the run if, for example,
   `income_limit` is text, `deadline` is not `YYYY-MM-DD`, `scholarship_scope` is not `Domestic`/`International`,
   or `docs_needed`/`faq_json` are not JSON lists. `clean-data-formats.js` fixes the mechanical cases automatically.
   Ambiguous cases are listed in `data/format-exceptions.json`.
5. **Human-reviewed values** go in `data/manual-corrections.json`; the cleanup step applies them on every agent run.
6. **Test on staging first.** Run a new or changed agent with `--target=staging` (pull, script and push all accept it),
   or the workflow's "target: staging" option.
7. **Back up before risky work.** `node scripts/backup-turso.js` writes a full copy to `backups/`.

## Commands

| Task | Command |
|---|---|
| Get a fresh local copy | `npm run db:pull` (= `node scripts/pull-from-turso.js [--target=staging]`) |
| Send your local changes to Turso | `npm run db:push` (= `node scripts/push-to-turso.js [--target=staging] [--dry-run]`) |
| Back up Turso to a file | `node scripts/backup-turso.js [--target=staging] [--out=file.db]` |
| Make staging a copy of production | `node scripts/refresh-staging.js` |
| Restore a backup | `node scripts/restore-turso.js --from=file.db --target=staging` (production also needs `--confirm-production`, and takes a safety backup first) |
| Fix mechanical format problems | `node scripts/clean-data-formats.js [--dry-run]` |
| Check formats | `node scripts/check-data-formats.js` |

## Automated workflows (GitHub Actions)

| Workflow | What it does |
|---|---|
| Daily Database Backup | Backs up production every morning; the file is kept 30 days as a run artifact. |
| Daily Deadline Freshness Check / Weekly Enrichment / Publish Scout-Approved | Pull from Turso → run the agent → normalize → check formats → back up Turso → push only the agent's changes → redeploy the site. Can be run manually against staging. |
| Refresh Staging Database | Copies production into staging (reads production only). |

All workflows that write the database share the `database-writes` concurrency group, so they never run at the same time.

## Required secrets

- GitHub Actions: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TURSO_STAGING_DATABASE_URL`, `TURSO_STAGING_AUTH_TOKEN`
- Vercel **Preview** environment: `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` set to the **staging** values, so preview deployments
  never read or write production. (Production environment keeps the production values.)
