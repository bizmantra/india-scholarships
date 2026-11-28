# Canada, batch 1 (hub, study permit, proof of funds, cost of living): filing notes

Date: 2026-11-28. Status: drafts only. Canada stays `launched: false` in `lib/study-abroad/countries.ts` and stays in `UNLAUNCHED_COUNTRIES` in `scripts/lib/quality-rules.js`. Nothing here is filed to the Inbox.

## The pages

| Page | Where its text lives | File |
|---|---|---|
| Country hub `/study-abroad/study-in/canada` | Built by code. Its three key-fact tiles come from `sa_facts`. | `scripts/study-abroad/proposals/canada-facts-2026-11-28.json` (6 facts) and the `KEY_FACTS.canada` line in the PR |
| Study permit guide `/study-abroad/visas/canada-student-visa-guide` | `sa_guides`, kind `visa` | `canada-visa-guide-2026-11-28.json` |
| Proof of funds `/study-abroad/study-in/canada/canada-proof-of-funds-guide` | `sa_guides`, kind `guide` | `canada-funds-guide-2026-11-28.json` |
| Cost of living `/study-abroad/study-in/canada/canada-cost-of-living` | `sa_guides`, kind `guide` | `canada-cost-of-living-guide-2026-11-28.json` |

The keyword schedule (`build_schedule_10_per_day_v3_1.csv`) lists URLs such as `/canada/canada-student-visa-guide`. Those do not match the site's real routing. I followed the Australia and UK routing above and kept the schedule's slugs where they fit (`canada-student-visa-guide`, `canada-proof-of-funds-guide`, `canada-cost-of-living`).

Every figure, quote, URL and read date is in `ca-visa-facts.md`.

## Suggested filing order

1. The three guide files, then the facts file. All four pass `check-proposals.mjs`.
2. Dry run first: `node scripts/study-abroad/propose-changes.mjs <file> --target=staging --dry-run`.

## Facts file: now checkable (unlike Australia)

`check-proposals.mjs` passes all six facts. I added six entries to `data/study-abroad/source-checks.json` (permit fee, biometrics fee, living costs, Quebec living costs, work hours, PGWP language level). The checker reads `canada.ca`, `ircc.canada.ca` and `quebec.ca` with its own user agent from the box. Plain `curl` from the box cannot reach `www.canada.ca` (it hangs), so I could not test from GitHub's servers. If the weekly check cannot reach `canada.ca` it reports "unverifiable", not "failed".

## Numbers that need a second look

- **Living-cost amount** changes every year. IRCC raised it from CAD 22,895 to CAD 23,448 on 1 September 2026. Facts carry `recheck_after` 2027-02-26.
- **Quebec amount** is the figure for applications from 1 January 2026. Quebec may change it on 1 January 2027.
- **PAL cap.** IRCC has not published 2027 provincial allocations (IRCC Notices page read 2026-11-28). The visa guide says so. Re-read the guide when the 2027 notice appears. A 2026 PAL runs to 31 December 2026.
- **Exchange rate.** Rupee figures use the Bank of Canada rate of ₹65.27 per CAD for 27 November 2026, written into the page text. The RBI/FBIL reference rate does not cover CAD (`lib/study-abroad/rbi-rate.ts` reads USD, GBP and EUR). A change of rate means re-filing the pages. Owner decision: keep a dated rate in the text, or add a live Bank of Canada read to the code.
- **Rent and bills** come from EduCanada (page date 20 May 2025) and U of T (2026).

## Left out because no official page gives it

- A GIC amount. IRCC's current page gives none. The old Student Direct Stream amount ended on 8 November 2024.
- A travel-cost figure. IRCC gives none for Canada.
- A processing time for India. IRCC says "varies by country".
- City budgets for Vancouver, Waterloo, Burnaby and Montreal. UBC's cost page is a calculator.
- Partner and spouse rules (not researched).

## Launch checklist for Canada (not done here)

- Remove `'canada'` from `UNLAUNCHED_COUNTRIES` in `scripts/lib/quality-rules.js` in the PR that sets `launched: true`. The 8 `unlaunched_country_link` errors in the batch 1 pages come from that list and are expected while hidden.
- File the facts, then check the hub tiles.
- Approve the new domains (see below).

## Owner flags

- New domains in `data/study-abroad/official-domains.json`: `educanada.ca`, `bankofcanada.ca`, `quebec.ca`, `ubc.ca`, `uwaterloo.ca`, `utoronto.ca`, `sfu.ca`, `mcgill.ca`, `concordia.ca`. The owner should approve these. `canada.ca` and `ircc.canada.ca` were already listed.
- The hub code change is one line (`.replace(/,/g, '')` on the fact value so "23,448" formats as a number). Australia's PR 149 makes the same change on the same line, so expect a merge conflict on `app/study-abroad/study-in/[country]/page.tsx` and on `KEY_FACTS`. Keep both `australia:` and `canada:` entries.
- `docs/study-abroad/TERMS.md` gains 11 Canada terms (study permit, DLI, LOA, PAL/TAL, CAQ, GIC, IRCC, PGWP, CLB, SIN, co-op). PR 149 also adds rows at the same place.
