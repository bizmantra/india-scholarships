# Command Center: work board (kanban) and AI assistant

Written 2026-10-29. Status: IN PROGRESS. Decisions made 2026-10-29 (see Decisions). Built on branch `claude/hopeful-sagan-6ytmp9`: Part 1 (data and teams), Part 2 (board, with drag and drop), the sidebar teams, and Part 4 (agent API and the `AGENTS.md` rule). Not built: Part 3 (Gemini assistant) and Part 5 (freeform research jobs). No pull request yet.
Replaces the idea of moving work tracking to Notion. Notion keeps the Decision Log and Atlas; the live work queue lives here.

## Goal

One place where the owner, Claude and other agents (Antigravity, Codex) see and change the status of every piece of work, with:

1. **Kanban boards** (drag a card between columns), one board per type: Dev, Content, SEO, Growth. Plus a "This week" board across all types.
2. **An AI assistant** in the chat that understands plain requests ("what's blocked?", "add an SEO task for the CTR drop on the Pragati page", "move IS-41 to Review") and acts on the backlog.

## What exists today (do not rebuild)

- `/admin/backlog`: a sectioned list ("Waiting on you", "Do next", rest) with tabs per `category` (dev, content). Code: `app/admin/backlog/page.tsx`.
- `lib/command-center/backlog.ts` and `backlog-types.ts`: table `backlog_tasks` plus side table `cc_backlog_meta` (due date, note, waiting flag, last touched). API `GET/PATCH/POST /api/admin/command/backlog`.
- Statuses today: Backlog, In Progress, Done, Parked. Impacts: Critical, High, Medium, Low.
- Chat (`app/admin/agents/intents.ts`, `orchestrator.ts`): fixed text patterns only. Its header comment says an AI model "can be added later as a fallback". No AI model is called from the Command Center today.
- Scripts already call Gemini directly (`scripts/lib/research.js`, `GEMINI_API_KEY`). No Anthropic or OpenAI key is set up in `env.template`.
- The morning briefing (`scripts/morning-briefing.js`, `scripts/lib/backlog-briefing.js`) reads the backlog. Its ordering is a copy of `backlog-types.ts`: change both together.

## Part 1: data changes (small, do first)

- **Statuses**: Backlog, Ready, In Progress, Review, Done, Parked. `Ready` = queued for an agent. `Review` = an agent finished, waiting for the owner. Nothing becomes Done without passing Review unless the owner moves it.
- **Assignee**: `Owner`, `Claude`, `Antigravity`, `Codex`, or empty. New column in `cc_backlog_meta`.
- **Link**: URL of the PR or the path of the plan file. New column in `cc_backlog_meta`.
- **Category = team.** One field, seven values: `dev`, `content-research`, `content-creation`, `data`, `strategy`, `seo`, `growth` (label "Growth / Distribution"). Existing `dev` and `content` rows: `dev` stays; `content` rows are sorted into content-research or content-creation by the owner in one pass (a one-time "Move to team" bulk action on the list view). Tabs and boards come from this field. This also gives `plans/command-center-teams-slice-1.md` its team list: build that plan's sidebar from the same seven teams (it listed five; add Dev and SEO, rename Traffic distribution to Growth / Distribution).
- Add the new columns with `ALTER TABLE ... ADD COLUMN` guarded the same way `ensureTable()` guards creation. Existing rows keep working (assignee and link empty).
- Update `BacklogChange` and the PATCH route to accept `assignee`, `link`, and the new statuses. Update `buildSections`, `staleDays` and the briefing copy so `Ready`, `Review` are handled (Review untouched for 7 days counts as stale: the owner is the bottleneck).
- Import: the Notion exports in `Notion-Tracker/` (73 dev rows, 17 content rows) are already reflected in `backlog_tasks` (the existing page reads that table). Check for gaps before relying on that; do not re-import blindly.

## Part 2: kanban board

- New page `app/admin/backlog/board/page.tsx`, linked from the Backlog page as a "Board" toggle next to the current list view. Keep the list view.
- Columns: Backlog, Ready, In Progress, Review, Done (last 14 days only), Parked collapsed.
- Card: id, title, impact pill, assignee chip, due label, stale tag, waiting-on-you flag (reuse the pills and `cc-*` colour tokens from the Backlog page).
- Filters above the board: type tab (All, Dev, Content, SEO, Growth), assignee, "waiting on me".
- Drag and drop moves a card to another column by calling the existing PATCH route (`status`). Dropping into Done asks for confirmation. Failures put the card back and show the error.
- Use `@dnd-kit/core` (new dependency, small, supports touch). Needs the owner's OK before adding. Fallback with no dependency: a "Move to" menu on each card (also the accessible and phone-friendly path; build it regardless).
- Phone width (about 375px): columns scroll sideways inside the board only; no page-wide horizontal scroll.
- Light and dark mode via the existing `cc-*` tokens.

## Part 3: AI assistant

Principle: the model proposes, deterministic code and the owner decide. The model never gets database access.

- **Where**: a fallback in the existing chat. If `parseIntent` matches nothing, the text goes to a new route `POST /api/admin/command/assistant`. Existing commands keep working with no model call.
- **Model**: needs the owner's decision (see Questions). Gemini is the only provider already wired in (`GEMINI_API_KEY`). Call it from the server route only; the key never reaches the browser.
- **Tools the model may request** (a fixed list, each validated in code before running):
  - `list_items(filters)`: read-only.
  - `summarise_board()`: counts per column, stale items, what is waiting on the owner. Read-only.
  - `propose_create(item)`, `propose_update(id, change)`: **do not write**. They return a proposal card in the chat ("Add SEO task: ... Impact High. Create?") with Approve and Reject buttons. Approve calls the normal backlog API.
- **Writes are never made by the model directly.** Reading and summarising run immediately; creating or changing items always shows a card first. Bulk changes (more than 5 items) show a gate with samples, like the inbox does.
- **Limits**: owner-only (same admin login as the other routes); at most 30 assistant calls a day, set in `agent_settings` with an on/off kill switch (default off until the owner turns it on); log every call and every approved change to `agent_events` so the activity view shows it.
- **Prompt content**: the model sees item id, title, status, impact, category, assignee, due date, note. It does not see scholarship data, secrets, or other tables.
- **Good first requests to support**: "what should I do today?", "what's blocked or stale?", "turn this note into tasks" (owner pastes text, assistant proposes items), "draft the brief for IS-41" (returns text for the owner to copy into Antigravity or Claude; writes nothing).

## Part 4: how agents use the board

- The API is the shared state. Add a short rule to `AGENTS.md` (owner approval needed to edit it): pick items with Status Ready and your own Assignee; set In Progress; when done set Review and fill Link; never set Done.
- Agents need a token for the backlog API, separate from the browser login. Reuse the pattern of the Hermes bridge (bearer token in env, off by default, kill switch in `agent_settings`, role-limited: can read, create, and move an item only to In Progress or Review). Needs the owner's decision (Questions).
- Starting work: headless jobs (GitHub Actions workflows the Command Center can already start) can get a "Run" button on the card. Antigravity is a desktop app and cannot be started from here: the owner opens it and tells it to take the next Ready item assigned to it.

## Part 5: freeform requests ("find new articles that can supplement our scholarships")

Two kinds of work, handled differently:

- **Fixed automations** (scout, freshness check, ...): already exist, run on a schedule or a button.
- **Freeform requests**: the owner types a goal in plain words. The assistant turns it into a **research job** that runs outside the website, and the result comes back as items to approve.

How a research job runs (same pattern as the scout):

1. The assistant shows a plan card first: "Find article ideas that support existing scholarship pages. Searches the web, checks our existing articles and pages, returns up to 10 ideas with sources. Writes nothing to the site. Run?" The owner approves.
2. The Command Center starts a GitHub Actions workflow (`freeform-research.yml`, new) with the request text. It runs a script (new, `scripts/freeform-research.js`) that calls Gemini with web grounding, as `scripts/lib/research.js` does.
3. The script may only **read** (our scholarships table, `content/articles/`, official sources from `data/scholarship-sources.json`, the web) and **write proposals** to the agent inbox. It cannot edit scholarship data, articles, code or settings.
4. Results land in the Inbox as a new category `article_idea` (title, which scholarships it supports, why, two or three source links, overlap check against existing articles). Approve turns an idea into a backlog item (team `content-creation`, status Ready) with the sources in its note. Reject drops it.
5. Cost and safety: a per-job limit on searches and tokens, a daily limit on jobs, a kill switch in `agent_settings`, every run and decision in `agent_events`. Jobs run in the cloud, so closing the browser does not stop them.

What stays outside the Command Center on purpose: **writing and publishing the article, and any open-ended coding**. That is done by Claude or Antigravity from an item assigned on the board (they can read the repo, edit files, run the build and open a pull request). Putting that inside the website would mean giving a model write access to the repo from a public server, which is more risk than it is worth.

Good freeform requests this supports: find article ideas; find scholarships we are missing for a state or category; find broken or outdated official links for a scheme; compare our page with the official notification and list differences; summarise what changed on a portal. Always read and propose, never apply.

Build after Part 3 (the assistant must exist first). First version: only the `article_idea` result type; add others as they prove useful.

## Build order

1. Part 1 (statuses, assignee, link, new categories) with tests for `buildSections` and `staleDays`. Update the briefing copy.
2. Part 2 with the "Move to" menu first, drag and drop second.
3. Part 4 token and `AGENTS.md` rule.
4. Part 3 assistant, read-only tools first, then proposals.
5. Part 5 freeform research jobs, starting with article ideas.

Each step is its own branch from the latest `origin/main`. Run `npx tsc --noEmit` and `npm run lint` before each. No changes to scholarship data, agent scripts or workflows.

## How to check it works

- Existing backlog list view looks and orders the same as before for existing items.
- A card dragged (or moved by menu) to another column is still there after a reload, and the morning briefing still lists three items.
- The board works at 375px width with no page-wide horizontal scroll, in light and dark mode.
- With the assistant switched off, the chat behaves exactly as today. With it on, "add an SEO task ..." shows a proposal card and creates nothing until Approve is pressed.
- An agent token cannot set Done, cannot touch other tables, and stops working when the kill switch is off.

## Decisions (owner, 2026-10-29)

1. Assistant model: **Gemini** (existing `GEMINI_API_KEY`). Keep the model name in one setting so it can change without code edits.
2. `@dnd-kit/core` may be added.
3. Agent token and the `AGENTS.md` rule are approved. (Edit `AGENTS.md` when Part 4 is built, and tell the owner what changed.)
4. Teams: Dev, Content research, Content creation, Data, Strategy, SEO, Growth / Distribution. The teams sidebar plan is kept and aligned to these seven (see Part 1). Build the data change (Part 1) before the sidebar so both use one team list.
