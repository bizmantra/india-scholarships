# Project context (read this before starting any job)

Shared notes for every AI assistant on this project (Claude, Codex, Antigravity, Hermes bots), so none of them
needs the owner to repeat things. It holds what lasts: who does what, how work ships, standing decisions and
traps. For what changed recently, read `RECENT_CHANGES.md`. For rules on touching files, read `../AGENTS.md`.

**This repo is public.** Never add tokens, keys, chat IDs, personal details or private URLs here.

Last reviewed: 2026-10-31. Facts below carry a date where they can go stale; check the code or the owner before relying on an old one.

## What this is

- **indiascholarships.in**: scholarship database and guides for Indian students. Next.js app on Vercel, Turso (libSQL) database. Architecture: `ARCHITECTURE_CONTEXT.md` (partly out of date), data flow: `DATABASE_OPERATIONS.md`.
- **Study Abroad**: lives in the same app (`/study-abroad`, `sa_*` tables). Rules: `study-abroad/`.
- **Command Center** (`/admin`): the owner's control room. Agents file proposals into an Inbox; the owner approves or rejects. Details: `AGENT_CENTER.md`.

## Who does what

| Assistant | Role | Does not |
|---|---|---|
| Claude | Plans and builds features, fixes bugs, opens PRs | Merge PRs (the owner does) |
| Codex | Brainstorming, independent second pass, fact-checking | Build features |
| Antigravity (`agy`) | Content or research from a plan file in `plans/` only | Build features. The owner has said it will not. |
| Hermes bots | Propose changes through the bridge, with human approval | Approve high-risk items, change dates or amounts without a source and quote, run on production |

Content drafted by one AI is checked by another or by a human before it ships. Antigravity has invented dates, test rules and a scheme name before; Codex caught them by re-deriving facts from the repo and official sites.

## How work ships

1. Track the task in Notion as `../AGENTS.md` describes.
2. Work in a **git worktree on a branch cut from `origin/main`**, not in the main checkout. The local `main` is often far behind and holds uncommitted files.
3. One PR per change, off `main`. No stacked PRs: they merge into their base branch, not `main`, and have gone wrong here.
4. Test on staging first (merge the branch into `staging`, check the Vercel preview, which uses the staging database). Only then ask the owner to merge to `main`, which is the live site and the production agents.
5. New scheduled workflows ship with the schedule off; a follow-up PR switches it on after the staging test.
6. Assistants cannot run `gh pr merge`. Give the owner the exact command.
7. When you merge a feature, add one line to `RECENT_CHANGES.md`.

The owner is not an engineer. Explain in plain language and check before large decisions. End analysis with an item-by-item table the owner can approve line by line, kept separate from the findings.

## Standing decisions

- **No new tools or trials.** The owner stopped agent and project-management tool experiments (Plane, Paperclip, AgentRQ were tried and dropped). Build on the Command Center. Do not suggest new tools unless asked.
- **Deadlines are never filled in bulk.** A date comes only from an official page, through the Inbox, with its source. An old script once invented month-end dates; they are now labelled confirmed / expected / rolling / unknown (`deadline_status`).
- **Sources:** official pages first; listing sites (Buddy4Study and the like) are secondary; never coaching sites. See `SCHOLARSHIP_SOURCES.md`.
- **Localized pages are gone** (`/hi`, `/bn`, `/ta` and others redirect to English). Do not write or link localized content. A rebuild is planned in `../plans/durable-localization.md` and is parked.
- **Search traffic crashed in Aug 2026 and is recovering.** Plan: `../plans/gsc-traffic-recovery.md`. Bulk page launches were on hold until a checkpoint on 2026-10-19; confirm the current status with the owner before launching pages in bulk.
- **Hermes bridge is staging-only** (merged 2026-10-24). It returns 403 on production unless the owner sets a flag. Do not enable it on production.

## Traps

- **`git stash` is shared by every worktree** and holds the owner's real work in progress. Never `stash` or `stash pop` in a worktree. Chain git commands with `&&`, never `;`. Compare with `git show origin/main:<path>`.
- Merging `origin/main` into a worktree may need `--no-autostash`.
- **Never print or commit secrets.** Check that a key exists by counting lines or length only. Keep `.env*` and `.mcp.json` out of git.
- **Turso is the master database.** Never drop Turso tables; follow the rules in `DATABASE_OPERATIONS.md`. Some Command Center tables are created on first use and are not synced.
- Official Indian scholarship portals are often JavaScript-rendered and unreadable by plain fetch. Use a browser, not a simple page fetch. "Could not read" is not "does not exist".
- When you give another AI a list of existing content to compare against, give the full list, not a truncated one. A cut-off list made Antigravity pitch pages that already existed.
- Local SQLite scripts can fail on newer Node versions until `npm rebuild better-sqlite3`.
- `agy -p` (headless) stops when it needs permission. Ask the owner before using any skip-permissions flag.

## Where things are

| Need | Look at |
|---|---|
| What changed lately | `RECENT_CHANGES.md` |
| Rules for touching files | `../AGENTS.md`, `../../AGENTS.md` |
| Scholarship research sources | `SCHOLARSHIP_SOURCES.md`, `../data/scholarship-sources.json` |
| Admin and agents | `AGENT_CENTER.md` |
| Database, sync, backups, staging | `DATABASE_OPERATIONS.md` |
| Content links and editorial rules | `INTERNAL_LINKING_STRATEGY.md` |
| Study Abroad content | `study-abroad/` |
| Past decisions | `decision-log/` |
| Plans and trackers | `../plans/` (for example `long-tail-opportunities.md`, `gsc-traffic-recovery.md`) |

## Keeping this file useful

If you learn something the next assistant needs, add it to this file in the same PR that taught you. Date anything that can go stale. Delete entries that stop being true. Keep it short: if a topic needs more than a few lines, write a file in `plans/` or `docs/` and link to it.
