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

- **Tabs** come from the `category` column (`dev`, `content`, and any new category that has open items, e.g. `study-abroad`
  with `SA-` ids). A new category needs no code: add an item with that category and its tab appears.
- **Order** (`lib/command-center/backlog-types.ts`, `buildSections`): waiting-on-you items first, then "Do next" (the top five
  open items): due within a week first, then Critical → Low, then In Progress before not started, ties by item number.
- **Stale** tag: In Progress untouched for 14 days, Backlog for 30. "Touched" means changed on this page.
- Items can be started, finished, parked, flagged "waiting on me", given a due date and a "where we left off" note.
- Items marked Done are hidden and counted. Merged or closed items from the 2026-10-11 cleanup are Done with a note.
- **Morning briefing**: the 8am briefing (`scripts/morning-briefing.js`, `scripts/lib/backlog-briefing.js`) adds the three items
  to do today, items waiting on you, items due within a week or overdue, and in-progress items quiet for 14 days, each with its
  "where we left off" note. It reads Turso directly and read-only (the due dates and notes are not in the pulled copy), and a
  backlog problem never stops the briefing. Its ordering is a copy of `backlog-types.ts`: change both together.
- The old Kanban page is replaced; `/api/admin/backlog` (old route) is no longer used by any screen.

## Study Abroad pages

Study Abroad pages (`sa_universities`, `sa_programs`, `sa_guides`, `sa_facts`) use the same inbox, with
`kind = 'sa_field_change'` and category `study_abroad`. Rules: `scripts/lib/sa-inbox.js`.

- **Submitting:** `node scripts/study-abroad/propose-changes.mjs <changes.json> [--target=staging|production] [--dry-run]`.
  Nothing changes on the site until approved. Values are checked first (allowed fields, lengths, valid FAQ JSON,
  no research notes, an official source for money and admission facts); a value you rejected is not proposed again.
- **Cards:** one per page. Short fields show old → new; articles, FAQs and JSON show a line-by-line diff and the
  full new version.
- **Approving** writes the field and `updated_at`, records old and new values in the approval event (not in
  `scholarship_changelog`, which belongs to scholarships), and refreshes the page, its country pages, comparison
  pages and the Study Abroad home. **Undo** restores the old value if the page still shows the approved one.
- `scripts/apply-reviewed-changes.js` (terminal) skips these items; approve them in the command center.

## Setup

- `GITHUB_ACTIONS_TOKEN` (Vercel, Production and Preview): fine-grained token for this repository only,
  Actions read/write, Contents read-only. Without it, approvals still work but agents can't be started from chat.
- The agent inbox tables are created by the first agent run after they were introduced. Until then the page says so.
  The command center never creates them itself, so an agent's first push can't clash with rows written here.

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
