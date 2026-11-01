# Command Center: teams view (slice 1)

Written 2026-10-05. Status: PLAN ONLY. Owner has asked for it; not yet built or approved to build.
This is a small first piece of Phase 1 in `plans/command-center-native-agents.md`. Read that plan for the bigger picture; this file is only what to build first.

## Goal

Organise `/admin` by **team** instead of by tool, using the agents that already exist. Nothing new runs: no new agents, no new tables, no new model calls.

- The sidebar lists five teams. Each team has a page showing its agents, what is waiting for the owner, and recent activity.
- The Inbox can be filtered by team.

Teams (kept in code for now; they move to a database table in a later slice):

| Team | Agents today |
|---|---|
| Content research | scholarship-scout |
| Content creation | scout-publisher (more later: Writer) |
| Data accuracy | deadline-freshness, fact-check, quality-fixer, weekly-enrichment, database-backup |
| Strategy | none yet (shows a short "nothing here yet" note) |
| Traffic distribution | traffic-watchdog, indexing |

`morning-briefing` belongs to no team. It stays the "Today" briefing in the chat.

## Rules

Follow `AGENTS.md`. Touch only the files below. Do not commit, push or merge; leave changes uncommitted on a branch called `feat/command-center-teams` made from the latest `origin/main`. No new dependencies. No changes to the agents' scripts, workflows or the database. Use the existing `cc-*` colour tokens so light and dark mode both work.

## Files to change

- `lib/command-center/agents.ts`: add `team?: TeamId` to `AgentDefinition` and set it on each agent per the table above (`morning-briefing` gets none).
- `lib/command-center/teams.ts` (new): `TeamId`, a `TEAMS` list (id, label, goal, icon name, sort order), `teamOf(agentId)`, `agentsOfTeam(teamId)`.
- `lib/command-center/inbox.ts`: `listProposals` accepts `agents?: string[]` and adds `AND p.agent IN (...)`; `inboxSummary` also returns `byAgent` (pending count per agent), so the team pages can show counts without extra requests.
- `app/api/admin/command/inbox/route.ts`: accept `?team=<id>`; turn it into the agent list with `agentsOfTeam` and pass it through.
- `app/api/admin/command/activity/route.ts`: accept `?team=<id>` and filter events to that team's agents.
- `app/admin/layout.tsx`: replace the flat menu with three groups: **Overview** (Inbox and chat), **Teams** (the five), **Admin** (Backlog Manager, Content Manager, Performance, Settings). Add `/admin/teams` to `THEMED_PAGES`. On phones keep the single scrolling strip and hide the group labels.
- `app/admin/teams/[team]/page.tsx` (new): the team page (see Steps).
- `app/admin/agents/ListView.tsx`: add a row of team chips above the category chips (All plus the five teams, each with its pending count). The selected team is sent as `team=` to the inbox request.
- `app/admin/agents/page.tsx`: read `?view=list&team=<id>` from the address so the team page can link straight to a filtered Inbox.
- `app/admin/agents/store.ts`: add `team` to the state so the filter survives page switches.

## Steps

1. Branch `feat/command-center-teams` from the latest `origin/main`.
2. Add `teams.ts` and the `team` field on each agent. Check that every agent in `AGENTS` has a team except `morning-briefing`.
3. Before relying on it, look at which agent names exist in the data: run a read-only `SELECT DISTINCT agent FROM agent_proposals` and the same on `agent_events` against the local or staging database. If a name is not in `AGENTS`, do not guess: write it under Questions.
4. Extend `listProposals`, `inboxSummary`, and the inbox and activity routes as described.
5. Build the team page. Top: team name and goal. Three number tiles: waiting for you (sum of `byAgent` for the team), agents (count), last activity (time of the newest event). Then three sections:
   - **Agents**: one row each with label, one-line summary, schedule, a "needs your approval" badge when `gated`, its waiting count, and its last event time. No Run button in this slice.
   - **Waiting for you**: a link "Open in Inbox" to `/admin/agents?view=list&team=<id>`.
   - **Recent activity**: the last 15 events for the team from the activity route.
   An empty team (Strategy) shows one sentence and no empty tables.
6. Change the sidebar as above. Rename the "Agent Center" menu label to "Inbox and chat". Leave the route `/admin/agents` unchanged so old links and bookmarks keep working.
7. Add the team chips to the Inbox list view and make the address parameters work.
8. Run `npx tsc --noEmit` and `npm run lint`. Fix anything in the files you touched.

## How to check it works

- All five team pages load on the dev server and on a staging preview, in light and dark mode, and at phone width (about 375px) with no horizontal scrolling.
- The sum of "waiting for you" across the five teams, plus any agents with no team, equals the Inbox total. The Inbox with a team chip selected shows the same count as that team's page.
- Data accuracy shows five agents; Traffic shows two; Strategy shows the empty note.
- Approving or rejecting an item in the Inbox updates the counts on the team page after a refresh.
- `/admin` and `/admin/agents` still work exactly as before when no team is chosen.
- No agent workflow, script, table or setting changed. `git diff --stat` lists only the files above.

## Not in this slice

Tasks, task board and chat per task; content-type definition files; the generic runner and creating agents; Run buttons on team pages; cost logging and caps; the MCP endpoint; the AI chat layer. All stay in `plans/command-center-native-agents.md`.

## Questions

- Should the menu say "Inbox and chat" in place of "Agent Center" (default yes), and should the page heading change to match?
- Is `weekly-enrichment` (search data refresh, audit and format clean-up) better under Data accuracy, as planned, or does the owner see it elsewhere?
- Anything the agent finds in step 3 that does not match goes here.

## Done

Built by Claude on branch `feat/command-center-teams` (uncommitted), 2026-10-05.
- Teams and the `team` field are in `lib/command-center/teams.ts` and `agents.ts` (`teamOf`, `agentsOfTeam` live in `agents.ts` to avoid a circular import).
- Added an "Other" Inbox filter for agents with no team: step 3 found `claude-session` (6 pending items) and `command-center` (events only) are not in `AGENTS`.
- Fixed the Inbox list not loading its counts when opened directly (the counts load only after a recent briefing is skipped).
- Checks: `npx tsc --noEmit` passes; no lint errors in the new files (existing `any` errors in files already there were left alone). Verified on a local dev server with the local database copy: all five team pages, light and dark mode, 375px width with no sideways scrolling, and the team chips add up (8 + 0 + 1,482 + 0 + 0 + 6 = 1,496 total).
- Not yet checked on a staging preview.
