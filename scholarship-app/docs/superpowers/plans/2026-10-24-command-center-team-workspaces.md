# Command Center Team Workspaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Command Center calmer and actionable: counts that match, team pages you can act from, a short "needs you" home, a one-line reason plus evidence on every item, and chat behind an Ask button.

**Architecture:** One pure helper module (`lib/command-center/inbox-view.ts`, no imports, unit-tested with `node:test`) holds the count and wording logic. The inbox summary API gains per-agent category counts so any team can show matching pill counts. The table moves into one shared client component, `InboxQueue`, used by both the Inbox home and each team page.

**Tech Stack:** Next.js 15 App Router, React 18, Tailwind (`cc-*` theme tokens), libSQL, Node 26 (`node --test` runs `.ts` directly, so helper files must use only relative imports with the `.ts` extension in tests and no `@/` aliases).

**Spec:** `docs/superpowers/specs/2026-10-24-command-center-team-workspaces-design.md`

## Global Constraints

- Work in `scholarship-app/`. Admin UI is in `app/admin`, shared logic in `lib/command-center`.
- Decisions go through `POST /api/admin/command/decide` and `afterDecision()` (`app/admin/agents/orchestrator.ts`). Do not add a second approval path.
- Keep the `cc-*` theme classes; the `THEMED_PAGES` list in `app/admin/layout.tsx` already covers `/admin/agents`, `/admin/teams`, `/admin/backlog`.
- No database schema changes. Nothing pending may become harder to reach than today.
- The local `scholarship.db` has no `agent_proposals` table, so the Inbox cannot be exercised locally. Verify UI work by `npx tsc --noEmit`, `npm run lint`, and the staging preview after the PR is opened.
- Branch → PR → staging; the owner merges. One PR per delivery step in the spec (Tasks 1-3 = PR 1, Task 4 = PR 2, Task 5 = PR 3, Task 6 = PR 4, Task 7 = PR 5), or a single PR if the owner prefers. Do not push or merge without being asked.
- Commit messages end with: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

- Team with zero pending items: team page and Inbox show an empty state, never "Nothing pending" next to a non-zero count.
- Team "Other" (agents with no team): counts and rows still agree.
- Item with no `evidence_json`, or malformed JSON: reason line falls back to the agent name plus the change, no crash.
- Study Abroad rows (`kind: 'sa_field_change'`) and new scholarships (`kind: 'new_scholarship'`, `new_value` unused): reason line and expand panel render without a before/after.
- Approving the last row of a page: list reloads and the count and pill numbers drop together.

---

### Task 1: Pure helpers for counts and wording

**Files:**
- Create: `lib/command-center/inbox-view.ts`
- Create: `lib/command-center/inbox-view.test.ts`
- Modify: `package.json` (add script `"test": "node --test lib/command-center/"`)

**Interfaces:**
- Produces (all exported from `inbox-view.ts`, no imports):
  - `type Facets = { total: number; byCategory: Record<string, number>; risky: number }`
  - `facetsFor(byAgentCategory: Record<string, Record<string, number>>, byAgentRisky: Record<string, number>, agentIds: string[]): Facets`
  - `reasonLine(row: { agentLabel: string; kind: string; field: string | null; old_value: string | null; new_value: string | null; evidence_json: string | null; risk: string }): string`
  - `briefingLine(byCategory: Record<string, number>, labels: Record<string, string>, max?: number): string`

- [ ] **Step 1: Write failing tests** in `inbox-view.test.ts` (`import test from 'node:test'`, `import assert from 'node:assert/strict'`, import from `./inbox-view.ts`):
  - `facetsFor` sums only the listed agents: `{a:{date_change:2,wording:1}, b:{date_change:5}}`, risky `{a:1,b:0}`, ids `['a']` → `{total:3, byCategory:{date_change:2,wording:1}, risky:1}`.
  - `facetsFor` with ids `[]` or unknown ids → `{total:0, byCategory:{}, risky:0}`.
  - `reasonLine` with evidence `{"verdict":"verified","source":"https://www.nsp.gov.in/page"}`, agentLabel `Deadline Freshness`, field `deadline` → `Deadline Freshness: official source confirms it (nsp.gov.in)`. Verdict map: `verified` → `official source confirms it`, `agreed` → `two checks agree`, `secondary` → `only a listing site confirms it`, `uncertain` → `unsure`.
  - `reasonLine` with `evidence_json: null` → `Deadline Freshness: no evidence recorded`.
  - `reasonLine` with `evidence_json: '{bad'` → same fallback (no throw).
  - `reasonLine` with `kind: 'new_scholarship'` and no evidence → `Scholarship Scout: new scholarship found, no evidence recorded` (agentLabel `Scholarship Scout`).
  - `reasonLine` with `risk: 'high'` appends ` · risky`.
  - `briefingLine({date_change:165, study_abroad:24, wording:10, amount_change:0}, {date_change:'deadline changes', study_abroad:'Study Abroad changes', wording:'wording updates', amount_change:'amount changes'}, 2)` → `165 deadline changes, 24 Study Abroad changes, 10 more`; zero counts are skipped; with no non-zero counts → empty string.
- [ ] **Step 2: Run** `node --test lib/command-center/` → FAIL (module not found).
- [ ] **Step 3: Implement** the three functions in `inbox-view.ts` to satisfy the tests; add the `test` script to `package.json`.
- [ ] **Step 4: Run** `npm test` → all pass.
- [ ] **Step 5: Commit** `lib/command-center/inbox-view.ts lib/command-center/inbox-view.test.ts package.json` as `feat(command-center): pure helpers for team counts and item reasons`.

### Task 2: Per-agent category counts in the summary

**Files:**
- Modify: `lib/command-center/inbox.ts` (`inboxSummary`, around lines 66-102)
- Modify: `app/admin/agents/store.ts` (`InboxSummary` interface)

**Interfaces:**
- Consumes: nothing new.
- Produces: `inboxSummary()` additionally returns `byAgentCategory: Record<string, Record<string, number>>` (pending count per agent per category) and `byAgentRisky: Record<string, number>` (pending `risk = 'high'` count per agent). `InboxSummary` gets both as optional fields next to `byAgent`.

- [ ] **Step 1: Implement** one extra query in `inboxSummary`: `SELECT agent, category, risk, COUNT(*) AS n FROM agent_proposals WHERE status = 'pending' GROUP BY agent, category, risk`, folded into the two maps (risky map counts rows with `risk = 'high'`).
- [ ] **Step 2: Verify** `npx tsc --noEmit` passes and `npm run lint` shows no new errors in the touched files.
- [ ] **Step 3: Commit** as `feat(command-center): per-agent category counts in the inbox summary`.

### Task 3: Count fix in the existing Inbox

**Files:**
- Modify: `app/admin/agents/ListView.tsx`

**Interfaces:**
- Consumes: `facetsFor` (Task 1), `byAgentCategory` / `byAgentRisky` (Task 2).

- [ ] **Step 1: Change the category state** from `useState('date_change')` to `useState<string | null>(null)` where `null` means All. When `null`, the request omits `category` and `risk`; `'risky'` still sends `risk=high`.
- [ ] **Step 2: Add an "All" pill** first in the category row, selected by default, showing the team's total.
- [ ] **Step 3: Pill counts follow the team.** Compute `facets` once with `facetsFor` over the selected team's agent ids (`null` team = all agents with items; `'other'` = agent ids present in `byAgentCategory` that are not an `AGENTS` entry with a `team`). Each category pill shows `facets.byCategory[t] ?? 0`; Risky shows `facets.risky`; All shows `facets.total`. Remove the `summary && !team` condition that hid counts. Hide pills whose count is 0 except the selected one.
- [ ] **Step 4: Verify** `npx tsc --noEmit` and `npm run lint` clean. After the PR opens, on staging: click Content creation → rows appear (not an empty table) and the "All" pill count equals the team pill count and the "N item(s)" footer.
- [ ] **Step 5: Commit** as `fix(command-center): team views default to all items and counts match`.

### Task 4: Shared queue component and actionable team pages

**Files:**
- Create: `app/admin/agents/InboxQueue.tsx`
- Modify: `app/admin/agents/ListView.tsx` (reduce to a thin wrapper), `app/admin/teams/[team]/page.tsx`

**Interfaces:**
- Produces: `export default function InboxQueue(props: { team: string | null; showTeamPills?: boolean })`. Contains everything `ListView` renders today (category pills, Approve/Reject selected, table, paging, decide logic). When `showTeamPills` is false the team pill row is not rendered and the team comes only from the prop. `ListView` renders the team pills (bound to `store.team`) and `<InboxQueue team={team} showTeamPills />`.
- Consumes: Tasks 1-3 behavior (All default, team-scoped counts).

- [ ] **Step 1: Move** the table/filter/decision code from `ListView.tsx` into `InboxQueue.tsx`, parameterised by the `team` prop instead of `useStore(s => s.team)`; keep behavior from Task 3.
- [ ] **Step 2: Make `ListView`** keep only the team pill row and render `InboxQueue`.
- [ ] **Step 3: Team page.** In `teams/[team]/page.tsx` replace the "Waiting for you" link card's "Open in Inbox" with a section "Waiting for you" between the header and the agent list that renders `<InboxQueue team={team.id} />`. Keep the three stat cards (the waiting card no longer links out). The page needs `store.summary` populated: call `refreshSummary()` from `../../agents/orchestrator` on mount (InboxQueue already does so when empty).
- [ ] **Step 4: Widen the team page** from `max-w-4xl` to `max-w-6xl` so the table fits.
- [ ] **Step 5: Verify** `npx tsc --noEmit`, `npm run lint`; on staging approve one item from a team page and see the team's count, pill and rows drop together (`afterDecision()` bumps `revision`).
- [ ] **Step 6: Commit** as `feat(command-center): team pages show and act on their queue`.

### Task 5: Briefing home and decluttered Inbox page

**Files:**
- Modify: `app/admin/agents/page.tsx`
- Create: `app/admin/agents/Briefing.tsx`
- Modify: `app/admin/agents/SidePanel.tsx` (no change to content; it is now optional)

**Interfaces:**
- Produces: `export default function Briefing()` — one card per team with `facetsFor(...).total > 0` (plus "Other" if non-zero): team label, count, `briefingLine(facets.byCategory, CATEGORY_LABELS-lowercased, 2)`, a red "N risky" line when `facets.risky > 0`, and a link to `/admin/teams/<id>` (for "Other": `/admin/agents?team=other`). Empty state when nothing is waiting: "Nothing is waiting for you."
- Consumes: `facetsFor`, `briefingLine`, `store.summary`.

- [ ] **Step 1: Declutter `page.tsx`.** Remove the `<h1>`/subtitle block, the second environment badge, and the Chat/Inbox toggle. Until Task 7 adds the Ask button, chat is unreachable from the page header, so do Task 5 and Task 7 in the same PR, or keep the Chat/Inbox toggle until Task 7 lands.
- [ ] **Step 2: Layout.** Render `<Briefing />` above `<ListView />`. The activity/summary panel is hidden by default behind a small "Activity" button in the header; its open state is remembered in `localStorage` key `cc-activity-open` (wrap reads and writes in try/catch, default closed). When closed, the table spans the full width.
- [ ] **Step 3: Keep `?view=list&team=<id>` URLs working** (old links): the effect that reads them now only sets `team`; the `view` store field stays for chat, which Task 7 uses.
- [ ] **Step 4: Verify** `npx tsc --noEmit`, `npm run lint`; on staging the home shows the team cards, the numbers add up to the "All teams" total, and the panel stays closed after reload until opened.
- [ ] **Step 5: Commit** as `feat(command-center): needs-you briefing and calmer Inbox page`.

### Task 6: One-line reasons and expandable evidence

**Files:**
- Modify: `app/admin/agents/Cards.tsx` (export `EvidenceLine`, line 392)
- Modify: `app/admin/agents/InboxQueue.tsx`

**Interfaces:**
- Consumes: `reasonLine` (Task 1); `Row` in `InboxQueue` gains `agent: string` and `evidence_json: string | null` (both already returned by `GET /api/admin/command/inbox` because `listProposals` selects `p.*`).
- Produces: `export function EvidenceLine({ json, field }: { json: string | null; field: string | null })` from `Cards.tsx`.

- [ ] **Step 1: Export `EvidenceLine`** (change `function` to `export function`; no other change).
- [ ] **Step 2: Reason line.** Under each scholarship title in the table show `reasonLine({ agentLabel: AGENTS.find(a => a.id === r.agent)?.label ?? r.agent, ...r })` in small muted text.
- [ ] **Step 3: Expand in place.** Clicking the row (not the checkbox or links) toggles a second `<tr>` spanning all columns that renders `<EvidenceLine json={r.evidence_json} field={r.field} />` and a link to the page (`pageHref(r)`). Only one row open at a time; paging or a decision closes it.
- [ ] **Step 4: Verify** `npx tsc --noEmit`, `npm run lint`; on staging expand a Deadline Freshness row (source link, quote, score) and a Study Abroad row without evidence (shows "No evidence recorded").
- [ ] **Step 5: Commit** as `feat(command-center): reason line and evidence on every inbox row`.

### Task 7: Ask panel

**Files:**
- Create: `app/admin/agents/AskPanel.tsx`
- Modify: `app/admin/agents/page.tsx`

**Interfaces:**
- Produces: `export default function AskPanel({ open, onClose }: { open: boolean; onClose: () => void })` — a right-side slide-over containing the existing chat (message list, suggestion chips, input). Move that JSX out of `page.tsx` unchanged; `send` and the scroll-to-bottom effect move with it.
- Consumes: `store` messages/busy, `handle` from `orchestrator`, `SUGGESTIONS` from `intents.ts`.

- [ ] **Step 1: Extract** the chat section from `page.tsx` into `AskPanel.tsx`; the panel is `fixed inset-y-0 right-0 w-full sm:w-[28rem]` with a close button, hidden when `open` is false. Closing does not clear messages (they live in the store).
- [ ] **Step 2: Add the Ask button** to the `page.tsx` header and wire `open` state. Remove the now-unused `view === 'chat'` branch and the Chat/Inbox toggle remnants; keep `store.view` only if `orchestrator.ts` still reads it (grep first; if it is only used for the old toggle, leave the field in place to avoid scope creep).
- [ ] **Step 3: Verify** `npx tsc --noEmit`, `npm run lint`; on staging open Ask, send "What's waiting on me?", close and reopen: the conversation is still there.
- [ ] **Step 4: Commit** as `feat(command-center): chat behind an Ask button`.

---

## Self-review

- **Spec coverage:** count fix (T1-3), Inbox briefing/declutter/activity collapse (T5), team workspace with actions (T4), reasons and evidence (T6), Ask button (T7). Spec "remembering activity state" is in T5. The spec's open question (does the list return evidence?) is answered: yes, `listProposals` selects `p.*`.
- **Types:** `facetsFor`, `reasonLine`, `briefingLine` names and shapes are the same in T1, T3, T5, T6. `byAgentCategory` / `byAgentRisky` match between T2 and T3.
- **Proportion:** helper tests carry the exact wording; UI tasks give the structure and leave the markup to the implementer.
