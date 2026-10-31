# Agent Center

`/admin/agents` (Agent Center, in the admin area called Command Center) is where the owner runs the site's agents by chat: see what's waiting, approve or reject
agent proposals, start agents and follow them live. The data side (agent inbox tables and rules) is described in
[DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md#agent-inbox-approvals).

## Commands

Typed or tapped from the suggestion chips. Matching is by fixed patterns (`app/admin/agents/intents.ts`).

| Say | What happens |
|---|---|
| What's waiting on me? | Counts per group, each clickable |
| Show deadline changes / new scholarships / amount changes / link changes / helpline updates | Cards, one per scholarship, most urgent first (nearest deadline, then search traffic) |
| Show risky changes | Past deadlines and amounts moving more than 50% |
| Approve all wording updates / Reject all risky amount changes | Asks first (gate card with samples), then decides the whole group |
| Run the scout [for Bihar] / Run the freshness check / Run enrichment / Run the scout publisher | Starts the GitHub Actions workflow and shows its steps live |
| Show Study Abroad changes | Cards for proposed Study Abroad page changes (universities, courses, guides, facts), one per page, with the full text diff |
| What did agents do today? | Today's agent runs, their results and your decisions |
| Which agents do what? | The agent list with "who does it without the agent" |

The **Inbox** tab (top right, with the number waiting) opens on **Needs you**: the few items worth a decision now, each with its evidence
(verdict, score, source link and the quoted sentence) beside Approve and Reject. A second button, **Everything**, shows the whole inbox as a table with checkboxes.

**Needs you** (`needsYou()` in `lib/command-center/inbox.ts`, `GET /api/admin/command/inbox?view=needs`) lists: *Closing soon* (a proposed deadline within the
next 3 weeks, nearest first), *Weak evidence* (other deadline changes the agent was unsure about, busiest pages first) and *New scholarships* found by the scout.
Everything else is counted, not listed. The table and the chat cards sort by the live deadline, or by the proposed date when the live one is blank, so
upcoming deadlines come first and weak-evidence items no longer sit above the rest.

## How it works

- **One approval action**: `lib/command-center/inbox.ts` `decide()`, used by chat cards, bulk commands and the list
  (`POST /api/admin/command/decide`). Approving a field change writes Turso, logs `reviewed_applied` in
  `scholarship_changelog` (who, old and new value) and refreshes the scholarship page, its translations and listing pages.
  A change is skipped if the page was edited after the agent looked (the card offers "Apply anyway").
- **Undo** (`POST /api/admin/command/undo`) puts the old value back if the page still shows the approved one, and marks
  the proposal rejected so it is not proposed again. An approved scout find that isn't published yet goes back to pending.
- **Runs**: `POST /api/admin/command/run` dispatches the workflow with a `request_id` that appears in the run name;
  `GET /api/admin/command/run` finds that run and returns its steps. Runs started in the last 3 hours reappear after a reload.
- **Environment**: on the live site runs target production; on Vercel previews and locally they target staging.
- **Agents are data**: `lib/command-center/agents.ts`. A new agent needs an entry there and a workflow with
  `target` and `request_id` inputs; its proposals use `scripts/lib/agent-inbox.js`.

## Backlog

`/admin/backlog` is the owner's list of what to pick up next, read from the Turso table `backlog_tasks`
(`lib/command-center/backlog.ts`, API `GET/PATCH/POST /api/admin/command/backlog`).

- **Teams** are the `category` column. Seven fixed teams (`TEAMS` in `backlog-types.ts`): Dev, Content research, Content creation,
  Data, Strategy, SEO, Growth / Distribution. Older categories (`content`, `study-abroad`) keep their tab while they have open items;
  each card has a Team menu to move it to a team. A new item's id prefix comes from `PREFIXES` in `backlog.ts`.
- **Statuses**: Backlog, Ready (queued for an agent), In Progress, Review (an agent says it is finished), Done, Parked.
  An item in Review counts as waiting on the owner and goes stale after 7 days (Ready 14, In Progress 14, Backlog 30).
- **Assignee** (Owner, Claude, Antigravity, Codex) and **Link** (a pull request address or a plan file path) per item. Both live in the
  side table `cc_backlog_meta`; the columns are added on first use if the table predates them.
- **Board** (`/admin/backlog/board`, List | Board switch at the top of both pages): columns Backlog, Ready, In Progress, Review and
  Done (finished in the last 14 days); Parked can be shown. Drag a card to another column or use its Move to menu (works on phones and
  with a keyboard). Moving to Done asks first. A failed save puts the card back. Filters: team, assignee, waiting on me.
  Drag and drop uses `@dnd-kit/core`; the sorting and filter rules are in `backlog-types.ts` (`boardColumns`) with tests.
- **Order** (`lib/command-center/backlog-types.ts`, `buildSections`): waiting-on-you items first, then "Do next" (the top five
  open items): due within a week first, then Critical → Low, then In Progress before not started, ties by item number.
- **Stale** tag: see the limits above. "Touched" means changed on this page.
- Items can be started, finished, parked, flagged "waiting on me", given a due date and a "where we left off" note.
- Items marked Done are hidden and counted. Merged or closed items from the 2026-10-11 cleanup are Done with a note.
- **Morning briefing**: the 8am briefing (`scripts/morning-briefing.js`, `scripts/lib/backlog-briefing.js`) adds the three items
  to do today, items waiting on you, items due within a week or overdue, and in-progress items quiet for 14 days, each with its
  "where we left off" note. It reads Turso directly and read-only (the due dates and notes are not in the pulled copy), and a
  backlog problem never stops the briefing. Its ordering is a copy of `backlog-types.ts`: change both together.
- The old Kanban page is replaced; `/api/admin/backlog` (old route) is no longer used by any screen.

## Study Abroad pages

Study Abroad pages (`sa_universities`, `sa_programs`, `sa_guides`, `sa_facts`) use the same inbox, with
`kind = 'sa_field_change'` for existing page updates and `kind = 'sa_new_page'` for creating new draft pages, both under category `study_abroad`. Rules: `scripts/lib/sa-inbox.js`.

- **Submitting:** `node scripts/study-abroad/propose-changes.mjs <changes.json> [--target=staging|production] [--dry-run]`.
  Nothing changes on the site until approved. Values are checked first (allowed fields, lengths, valid FAQ JSON,
  no research notes, an official source for money and admission facts); a value you rejected is not proposed again.
- **New draft pages (`sa_new_page`):** agents propose new rows by setting `"create": true` in changes JSON with the row's `fields`.
  Required columns per table, valid slug pattern, known country in `countries.ts`, and sources on money facts are strictly enforced.
  Approving inserts the row with `status = 'draft'` (drafts return 404 and are not visible publicly).
- **Cards:** one per page or new draft proposal. Field changes show old → new (short fields) or line diff (articles, FAQs, JSON).
  New draft proposals show the table, title, country, summary preview, field count, official source link, and a "Preview JSON" expander.
- **Publish gate:** approving a `status → published` field change runs full-row validation (all required columns, no boilerplate summaries, no banned phrases, all money/visa fields sourced).
- **Approving & Undo:** approving writes the row or field and records values in `agent_events`. **Undo** restores the old value for field changes, or deletes the draft row for new pages (only while the row remains in `draft` status and untouched since approval).
- `scripts/apply-reviewed-changes.js` (terminal) skips these items; approve them in the command center.

## Setup

- `GITHUB_ACTIONS_TOKEN` (Vercel, Production and Preview): fine-grained token for this repository only,
  Actions read/write, Contents read-only. Without it, approvals still work but agents can't be started from chat.
- The agent inbox tables are created by the first agent run after they were introduced. Until then the page says so.
  The command center never creates them itself, so an agent's first push can't clash with rows written here.

## Agent backlog API

Claude, Antigravity and Codex read their queue and report progress on the backlog without a browser session. Code:
`lib/command-center/backlog-agent.ts` (database) and `backlog-agent-rules.ts` (the rules, tested), route `/api/agents/backlog`
(outside `/api/admin`, guarded by a bearer token).

- **Off by default.** Turn it on with `INSERT OR REPLACE INTO agent_settings (agent, key, value_json) VALUES ('backlog-api', 'enabled', 'true')`
  on the target database; set it to `'false'` to switch it off again. The token is the env var `AGENT_BACKLOG_TOKEN` (not set = always refused).
- `GET ?agent=Claude` lists that agent's open items (`&all=1` lists every open item). `POST` adds an item to Backlog (at most 20 a day
  per agent; a note "Added by <agent>" is appended). `PATCH` moves one of the agent's own items.
- **What an agent can do:** move its own Ready item to In Progress, move its own In Progress item to Review (a link is required),
  and edit the note and link. **It cannot:** set Done, Parked or Backlog, change impact, due date, team or assignee, or touch an item
  assigned to someone else. Only the owner moves work to Ready and assigns it. Review is the owner's checkpoint.
- Every agent write is recorded in `agent_events` (agent `backlog-api`, actor `agent:<name>`).
- The rule agents follow is in the repo's `AGENTS.md`.

## Light and dark mode

The sun/moon button in the header (next to the logo on phones) switches the admin between light and dark. The choice is
remembered on the device; until then it follows the system setting. Colours come from named tokens in `app/globals.css`
(`bg-cc-panel`, `text-cc-muted`, …). Screens listed in `THEMED_PAGES` in `app/admin/layout.tsx` use them; other admin
screens stay dark until they are reworked. To convert a screen, replace its fixed shades with the tokens and add it to that list.

## Hermes bridge (staging only)

Hermes Agent (a separate assistant on the owner's Mac) can add proposals to the inbox and, when the owner approves in Hermes,
decide them. Code: `lib/command-center/hermes-bridge.ts`, route `POST /api/hermes/bridge` (outside `/api/admin`, guarded by bearer tokens).

- **Off by default.** `agent_settings` `hermes-bridge` / `enabled` must be `true`; setting it back to `false` is the kill switch.
- **Staging and local only.** On production the route answers 403 unless `HERMES_BRIDGE_ALLOW_PRODUCTION=1` is set on purpose.
- **Two tokens** (env): `HERMES_BRIDGE_PROPOSE_TOKEN` (propose, list) and `HERMES_BRIDGE_DECIDE_TOKEN` (approve, reject).
- **Proposals** are scholarship field changes only (same field and value rules as the agents). The old value is read from the
  database, never trusted from the caller. Agent name is `hermes-<profile>`. A proposal without a quote from the source page is `high` risk.
- **Approvals** go through `decide()` with actor `owner-via-hermes`, so the changelog, the "changed since" guard and Undo work as usual.
  Hermes cannot approve: anything `high` risk, date or amount changes without a source link and quote, proposals from other agents,
  and anything past `max_approvals_per_day` (default 20). Those must be approved in the Command Center.
- Study Abroad changes and new scholarships are not supported by the bridge yet.

### Quote check (Hermes bridge)

When Hermes proposes a change, the server opens the source page itself and records `quote_check` in the evidence: `found`, `not_found` (the proposal becomes high risk) or `unchecked` (page needs scripts, is a PDF, or could not be fetched). Date and amount changes can only be approved from Hermes when the check says `found`; otherwise approve them in the Command Center after reading the page. Added after proposal #2825, whose quote was stitched from two different schemes.
