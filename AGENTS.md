# Instructions for AI agents (Claude, Codex, Antigravity)

## Read the shared context first

Before starting any job, read `scholarship-app/docs/PROJECT_CONTEXT.md` (who does what, how work ships, standing
decisions, traps) and `scholarship-app/docs/RECENT_CHANGES.md` (what changed lately). They are the memory every
assistant shares; do not rely on a private per-tool memory for facts the others need.

If you learn something the next assistant needs, add it to `PROJECT_CONTEXT.md` in the same pull request. Date
anything that can go stale, and delete entries that stop being true. Never put tokens, keys or personal details in it:
the repo is public.

## Researching scholarships: check known sources first

Before researching a scholarship (new or existing), read `scholarship-app/docs/SCHOLARSHIP_SOURCES.md`.

- **Existing scholarship:** open its `source_pages`, then `official_source` and `apply_url`, before searching the web.
- **New scholarships:** start from `scholarship-app/data/scholarship-sources.json`, then widen.
- **Afterwards:** save any specific official page you confirmed facts on to `source_pages`, and add any new
  portal or provider to `scholarship-sources.json`. Platform and listing pages (Buddy4Study, Careers360, …) go to
  `secondary_sources`, never `source_pages`; never use coaching sites; never change a number on a secondary page alone.

## Task tracking: Notion Project Hub (replaces the old backlog files)

The `backlog-*.md/json` files and the old Notion IS Dev / IS Content Backlogs are retired (2026-10-30). All work is tracked in the Notion Tasks database: https://app.notion.com/p/c4bdba8c6f794c64a649f02d117ad6fe . Follow the agent instructions at https://app.notion.com/p/4082e0a03f1e81f59841e7c38d16633e (Owner = Claude Code / Codex / AI Coding; Project = IndiaScholarships or StudyAbroad; update Status, Last update, Source, and add a handoff comment). Never delete tasks.
