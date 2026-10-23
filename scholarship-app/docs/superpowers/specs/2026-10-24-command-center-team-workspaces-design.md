# Command Center: team workspaces and a calmer Inbox

Date: 2026-10-24. Status: draft for owner approval.

## Intent

The owner opens the Command Center to see what is waiting and act on it. Today the Inbox is a bare table
with many controls, the team pages explain context but have no buttons, and the chat does not surface
anything important. The owner expects something closer to an enterprise system: each item says why it
matters, who (which agent) raised it, and what evidence backs it, and the owner can decide right there.

## Goals

- Land on a short "needs you today" view, not a wall of pills and a table.
- Each team page is a workspace: team goal and agents at the top, its pending items with Approve/Reject,
  its recent activity below.
- Every item carries a one-line reason and opens to its evidence (source, quote, score) without leaving the page.
- Counts always match what is on screen (team count = sum of rows shown for that team).
- Chat stays but moves behind an "Ask" button.

## Non-goals

- Wiring an AI into Ask. That is a separate project (what it can see, whether it can act, cost). The button
  opens the existing chat for now.
- New agents, new teams, database schema changes.
- Reworking Backlog, Content Manager, Performance or Settings.

## Anti-goals

- A different page layout that hides items. Nothing pending may become harder to reach than it is today.
- Two places that show different counts for the same thing.

## Constraints

- Next.js app in `scholarship-app/app/admin`; light/dark theme tokens (`cc-*`) are already used on the
  Inbox, Teams and Backlog screens; keep using them.
- Decisions go through the existing `POST /api/admin/command/decide` endpoint and `afterDecision()`.
- The inbox list API is `GET /api/admin/command/inbox` (`category`, `risk`, `team`, `limit`, `offset`).
  Rows already include `payload_json`; the evidence shown today by `EvidenceLine` in `agents/Cards.tsx`
  comes from `evidence_json`. The builder must confirm the list endpoint returns it, and add it if not.
- Agents and teams are data in `lib/command-center/agents.ts` and `teams.ts`.
- Work goes branch → PR → staging; the owner merges.

## Approaches considered

- **A. Team workspaces (chosen).** Team page = goal, agents, actionable queue, activity. Inbox home = briefing.
- B. One Inbox with a context strip per team. Less restructuring, but still one big table that crowds again as agents grow.
- C. Row detail drawer only. Cheapest, but does not fix "I don't know where I am" on landing.

The owner picked A. The row drill-down from C is included inside A.

## Design

### 1. Count mismatch fix (do first, ships alone)
`ListView` starts on the first category pill (`date_change`), so a team with no deadline changes looks empty,
and category counts are hidden whenever a team is selected. Change: the category filter defaults to "All"
(no category), pills show counts for the current team (the summary needs per-team, per-category counts, or
the list endpoint returns facet counts), and the header count equals the rows total.

### 2. Inbox home becomes a briefing
- Remove the page title and subtitle and the second "Live site" badge (the top bar keeps it).
- Replace the Chat/Inbox toggle. Inbox is the page; "Ask" is a button that opens chat in a panel.
- Top section "Needs you": one card per team that has pending items (team name, count, the 2-3 biggest
  groups such as "165 deadline changes, 24 Study Abroad changes"), with a button into that team's workspace.
  Risky items get their own highlighted line.
- Below it, the full table of everything, with team and category filters as today but default "All".
- Activity side panel collapsed by default, opened from a small button.

### 3. Team workspace page
`/admin/teams/[team]` keeps its layout (goal, agent list, recent activity) and gains, between the goal and
the agent list, the pending queue for that team: the same table and Approve/Reject-selected as the Inbox,
filtered to the team, with the same category filter. The "Open in Inbox" link goes away. The table component
is shared between the Inbox and the team page (extract from `ListView.tsx`) so they cannot drift.

### 4. Item context
- Each row gets a one-line reason built from existing data (agent label plus a plain sentence from the
  evidence verdict and source host, for example "Deadline Freshness: official site shows 2026-10-26").
  Rows with no evidence say so, as `EvidenceLine` does today.
- Clicking a row expands it in place to show the existing evidence block (verdict, source link, quote,
  score breakdown) and the page link. Reuse `EvidenceLine` rather than writing a second renderer.

### 5. Ask button
A button in the page header opens the existing chat in a slide-over panel. No AI changes. Chat message
state already lives in the shared store, so history survives opening and closing.

## Delivery order
1. Count fix plus default "All" (small, own PR).
2. Shared queue component, used on the team page; team workspace gets actions.
3. Briefing home, decluttering, activity collapse.
4. Row reasons and expandable evidence.
5. Ask panel.

## Left to the builder
- Exact wording of the one-line reasons and the briefing group summaries.
- How to compute per-team category counts (new summary fields or facet counts on the list call).
- Mobile layout of the briefing cards and the Ask panel.
- Whether the activity panel's open/closed state is remembered (suggested: yes, in local storage).

## Open for owner
- Nothing blocking. Calls I made that you can reverse: removing the page title; collapsing activity by
  default; remembering its state; "Ask" opening the old chat unchanged.
