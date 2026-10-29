# Instructions for AI agents (Claude, Codex, Antigravity)

## Researching scholarships: check known sources first

Before researching a scholarship (new or existing), read `scholarship-app/docs/SCHOLARSHIP_SOURCES.md`.

- **Existing scholarship:** open its `source_pages`, then `official_source` and `apply_url`, before searching the web.
- **New scholarships:** start from `scholarship-app/data/scholarship-sources.json`, then widen.
- **Afterwards:** save any specific official page you confirmed facts on to `source_pages`, and add any new
  portal or provider to `scholarship-sources.json`. Platform and listing pages (Buddy4Study, Careers360, …) go to
  `secondary_sources`, never `source_pages`; never use coaching sites; never change a number on a secondary page alone.

## Working from the Command Center backlog

The owner's work queue is the Command Center backlog (`/admin/backlog`, board at `/admin/backlog/board`), not `task.md`.
Statuses: Backlog, Ready, In Progress, Review, Done, Parked. The owner moves an item to **Ready** and assigns it; only then is it yours.

When the owner assigns you an item (Assignee = your name: Claude, Antigravity or Codex), and the agent API is available
(`AGENT_BACKLOG_TOKEN` is set; API at `<site>/api/agents/backlog`, see `scholarship-app/docs/AGENT_CENTER.md`):

1. List your items: `GET /api/agents/backlog?agent=<You>`. Take a **Ready** item that is assigned to you.
2. Set it to **In Progress** (`PATCH` with `status`) before you start.
3. When you finish, `PATCH` it to **Review** with `link` set to the pull request address (or the plan file path), and put one line in `note` saying what to check.
4. Never set Done, Parked or Backlog, and never change impact, due date, team or assignee. The owner approves in Review.
5. Found work nobody asked for? `POST` a new item (it lands in Backlog); do not start it.

If the API is not available (no token, switched off, offline), carry on with the task and say in your final message which item you
worked on, so the owner can update the board. Never block the work on the backlog.
