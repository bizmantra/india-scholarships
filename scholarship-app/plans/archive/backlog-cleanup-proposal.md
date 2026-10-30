# Backlog cleanup: proposed change list

Written 2026-10-11. Status: APPROVED by the owner and APPLIED on 2026-10-11 (Dev and Content boards only). Study Abroad is handled in its own session; this cleanup does not touch it.
A copy of every row before the change is in `data/backlog-cleanup-backup-2026-10-11.json`.
Source: read-only query of `backlog_tasks` in Turso (55 open items: 40 dev backlog, 2 dev in progress, 10 content backlog, 3 content in progress; plus 13 parked), checked against the code, git history and `plans/`.

How sure each line is: **Verified** = I checked the data or code directly. **Strong** = good evidence in git or the file tree, but I did not open the live page. **Your call** = needs a decision from you.

## 1. Mark Done

| ID | Item | Evidence | Sure? |
|---|---|---|---|
| IS-47 | Karnataka deadline fields with leaked notes | Query: ids 23, 24, 27-31 all hold clean ISO dates; 0 deadlines contain "VERIFY", "tentative" or are over 40 characters | Verified |
| CNT-16 | Leaked verification notes in public deadlines | Same query: 0 suspect deadlines in the whole table | Verified |
| IS-63 | Site search 500 error (WAL pragma) | `app/api/search/route.ts` no longer sets the pragma. Load /api/search on the live site to confirm | Strong |
| IS-60 | Dynamic homepage | Commit `d5dfad6` "redesign homepage with dynamic widgets" | Strong |
| IS-71 | Scholarship Finder Wizard | `app/tools/finder-wizard` exists | Strong |
| IS-73 | Scholarship Compare Tool | `app/tools/compare` exists | Strong |
| IS-31 | Create multiple agents | Agent Center and 11 agent workflows exist in `.github/workflows` | Strong |
| IS-35 | Google Indexing API in sync | `scripts/submit-indexing-api.js` and `indexing-agent.yml` exist | Strong |
| IS-85 | Scheduled tasks (link check, backup, indexing ping) | `database-backup.yml`, `indexing-agent.yml`, `daily-freshness-check.yml`, `scripts/check_404s.js` exist. Check the link checker is scheduled | Strong |
| IS-57 | Content gap audit | Report exists; follow-up is `plans/content-gap-fill-batch-1.md` (add as its own item, section 4) | Strong |

## 2. Merge duplicates (keep one, close the rest with a note pointing at it)

| Keep | Absorbs | New title / notes |
|---|---|---|
| **IS-20** (High) | IS-4, IS-18, IS-76, IS-82 | "Email capture: relaunch the Kit popup + capture on tool results and scholarship pages". The popup (PR #29) was merged then reverted (PR #32) and is parked on branch `feat/kit-optin-popup` until the spam fix. IS-18 is a question, not a task, and gets answered by this item |
| **IS-78** (High) | IS-86, CNT-35 (Telegram half), IS-87 (parked) | "Telegram channel: auto-broadcast new scholarships + banners". `scripts/post-new-to-telegram.js` already exists, so first check how much is built |
| **IS-79** (High) | IS-16, IS-90, CNT-35 (WhatsApp half), IS-91 | "WhatsApp channel: join banner + alerts + exit-intent prompt". Start with the free Channel link; the paid Business API is later (per IS-16 itself) |
| **IS-36** (Critical) | IS-28, CNT-33 | "CTR and page-2 rewrites (129 pages, positions 5-20)". One workstream, one owner |
| **IS-81** (High) | IS-14, IS-15 (parked) | "Monetisation beyond AdSense". Loan affiliate and Ezoic become options inside it |
| **IS-77** (Medium) | IS-25 | "Tools expansion". IS-25 is an umbrella that IS-71/73/75/77 already cover |
| **CNT-36** (In Progress) | CNT-21, CNT-22, CNT-23, CNT-24 | Keep the phases as a checklist inside CNT-36, since CNT-36 already says "loans, DBT, documents" |
| **IS-50** (Parked) | IS-51 | Keyword Planner API and the script that uses it. Your call: GSC data is already driving keyword work |

Close with no replacement: IS-22 (umbrella "grow traffic", replaced by the new traffic item below), IS-30 (monthly GSC review, now covered by the traffic-watchdog and morning-briefing workflows, your call), IS-83 (auto refresh, covered by the freshness agents, plus its alerts question goes to IS-78/IS-79), IS-21 (Notion operating model; Notion tracking was retired).

## 3. Re-rate and park

**Critical (down from 7 to 3):**
1. IS-36 CTR and page-2 rewrites (merged)
2. CNT-18 PM Yashasvi cycle-status messaging (stays; traffic protection)
3. NEW: Traffic recovery follow-through (section 4)

**Down to High:** IS-20 email capture, IS-27 expand top pages, IS-81 monetisation.

**Park:** IS-89 localization (the old locale pages are pulled; rebuild plan in `plans/durable-localization.md` waits for the Google analysis), IS-92 onboarding/registration wizard (needs accounts; email capture comes first), IS-24 competitor tracker (to Low), IS-95 manual CMS (to Low).

**Leave alone:** IS-46, IS-34, IS-75, IS-59 (keyword analysis; fold into the traffic item if you prefer), IS-80 (Twitter), IS-13 (GitHub secrets: your call, since the workflows run, so some secrets already exist; check whether Perplexity and the deploy hook are still needed), CNT-19, CNT-20, CNT-25, CNT-34, and the parked items I haven't mentioned (IS-5, IS-6, IS-8, IS-10, IS-11, IS-17, IS-49, IS-58, IS-61, IS-62). IS-58 could close because the study-abroad work moved into its own track.

## 4. Add (missing recent work)

| New item | Board | Impact | Source |
|---|---|---|---|
| Traffic recovery follow-through | dev | Critical | `plans/gsc-traffic-recovery.md`; recovering since 25 Sep, pending decisions listed in that plan |
| Articles for scholarships closing Oct-Nov (12 articles; first 3 drafted) | content | High, time-sensitive | `plans/articles-closing-soon-oct-2026.md`, `plans/draft-first-three-articles.md`, branch `content/closing-soon-batch-2` |
| Content gap-fill batch 1 (12 pieces) | content | Medium | `plans/content-gap-fill-batch-1.md` |
| Scholarship sources: Laya pilot and backfill of source pages | dev | High | PRs #42, #44, #47; follow-up pending |
| Command Center Backlog page: "Do next" ordering, stale tags, due dates, briefing reminders | dev | High | agreed with owner 2026-10-11; replaces the unused `/admin/backlog` page and the team task board |
| Merge or close stale PR #7 (scout de-dupe, open since 26 Sep) | dev | Low | `gh pr list` |

## 5. Then the "Do next" view

Built in Command Center (the owner uses Command Center, not `/admin/backlog`), not on the old page. Study Abroad is a separate `study-abroad` category with its own tab, wired in by its own session. Original sketch: add a section at the top of the backlog page that shows the top 5 open items, ordered by Critical first, then In Progress, then High, then oldest. Each card gets a one-line "last note" (an optional new field) so you can see where it stopped. Small change to `BacklogPageClient.tsx`; no new table apart from one `notes` column.

## Decisions

Applied as written, except these four "your call" items, which were left unchanged until the owner decides: IS-30 (close?), IS-50/IS-51 (park/merge?), IS-13 (still needed?), IS-58 (close?). The task-board question is settled: the owner does not use it and wants the Backlog inside Command Center, so that branch is not merged.

Merged and closed items are set to Done with a note naming the item they were merged into (the board has no "merged" status). Nothing was deleted.

## What was asked

1. OK to apply sections 1-4 as written, or strike lines you disagree with.
2. Your calls: IS-30 (close?), IS-50/51 (park?), IS-13 (still needed?), IS-58 (close?).
3. Whether to keep the Command Center team task board at all, or drop it and use this backlog only.

Notes: `data/dashboard.md` is stale (last refreshed 7 Aug 2026, says "0+ active schemes") and the `data/backlog-*.json` files are probably not the source of truth any more. I'd regenerate or delete them after the cleanup.
