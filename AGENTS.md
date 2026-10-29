# Instructions for AI agents (Claude, Codex, Antigravity)

## Researching scholarships: check known sources first

Before researching a scholarship (new or existing), read `scholarship-app/docs/SCHOLARSHIP_SOURCES.md`.

- **Existing scholarship:** open its `source_pages`, then `official_source` and `apply_url`, before searching the web.
- **New scholarships:** start from `scholarship-app/data/scholarship-sources.json`, then widen.
- **Afterwards:** save any specific official page you confirmed facts on to `source_pages`, and add any new
  portal or provider to `scholarship-sources.json`. Platform and listing pages (Buddy4Study, Careers360, …) go to
  `secondary_sources`, never `source_pages`; never use coaching sites; never change a number on a secondary page alone.

## Study Abroad

Study Abroad lives inside `scholarship-app` (routes `app/study-abroad/`, tables `sa_*`). Before touching it, read `scholarship-app/AGENTS.md` item 8 and `scholarship-app/docs/study-abroad/`: `templates/` (page structure), `CONTENT_RULES.md`, `TERMS.md`, `SEO_AND_SCHEMA_RULES.md`. Do not look in the retired `Study-Abroad-IS` repo for rules.
