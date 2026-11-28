# UK Study Abroad launch runbook (2026-11-28)

Two PRs, both cut from `main`, neither merged by the agent:

1. **UK pre-launch fixes** (`fix/uk-prelaunch-blockers`): safe to merge now. UK stays hidden.
2. **Launch UK** (`launch/uk-study-abroad`): flips UK to launched. Do not merge until the checklist below is done.

## Order of work (on the Mac that has the production database settings)

Run from `scholarship-app/`. Start each step with `--dry-run`, then run it for real, then approve in `/admin/agents`.

| Step | Command | What it files | Wait for |
|---|---|---|---|
| 0 | merge PR 1, wait for the deploy | code | |
| 1 | `scripts/study-abroad/file-uk-launch.sh 1 --target=production --dry-run` then without `--dry-run` | 2 guides, 12 universities, 3 new facts, fact updates | approve in Inbox |
| 2 | `scripts/study-abroad/file-uk-launch.sh 2 --target=production` | 35 course pages (need their university approved first) | approve in Inbox |
| 3 | `scripts/study-abroad/file-uk-launch.sh 3 --target=production` | corrections: surcharge, visa cost, HC 584 alignment, scholarship/tuition fixes | approve in Inbox |
| 4 | `scripts/study-abroad/file-uk-launch.sh 4 --target=production` | `uk-publish-2026-11-28.json`: 49 `status: published` changes | approve in Inbox (publish gate re-checks every page) |
| 5 | merge PR 2 | `launched: true` | |

Notes:
- The two HC 584 monthly-rate updates (`uk.funds.monthly_london` 1570, `uk.funds.monthly_outside_london` 1203) are in `uk-funds-calculator-facts-2026-11-21.json` (step 1). **Approve those on or after 30 November 2026**: HC 584 applies to applications from that date and the gov.uk money page still shows £1,529 / £1,171 until then.
- A step that finds a page already filed or approved reports it and files nothing, so re-running is safe.
- Newcastle has a pilot proposal and a full-length one for the same page. The script skips the pilot file. If the dry run says the page already exists with different text, file an update instead of a create.
- Publish (step 4) before PR 1 is deployed would put published UK rows into the live sitemap while the pages still 404. That is why PR 1 goes first.

## Launch checklist (PR 2 merge gate)

- [ ] PR 1 merged and deployed.
- [ ] Steps 1-4 approved; `node scripts/study-abroad/check-links.mjs --target=production` passes with UK treated as launched.
- [ ] HC 584 facts approved on or after 30 Nov 2026 and visible on `/study-abroad/tools/uk-funds-calculator`.
- [ ] After merging PR 2: UK hub, a university, a course, the visa guide and the calculator return 200 and are in `/sitemap.xml`; GSC sitemap resubmitted.

## Checks run for PR 1 (2026-11-28)

- `tsc --noEmit` clean; eslint on every changed file: only the pre-existing `no-explicit-any` at `next.config.ts:83`.
- Node tests: `lib/study-abroad/*.test.ts` 22/22, `scripts/study-abroad/*.test.mjs` 66/66.
- `check-proposals.mjs` 0 failures on every `uk-*.json`; `verify-sources.mjs` 6/6 on the live pages.
- Local build with all 49 UK pages created and published, UK hidden: build passes, hidden-country routes 404 with noindex, sitemap contains no UK URL.
- Filing simulation against a throwaway local Inbox database: steps 1-4 file 40, 35, 141 and 49 proposals with 0 refused.
