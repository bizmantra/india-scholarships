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
| What did agents do today? | Today's agent runs, their results and your decisions |
| Which agents do what? | The agent list with "who does it without the agent" |

The **Inbox** tab (top right, with the number waiting) shows the same inbox as a table with checkboxes.

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
