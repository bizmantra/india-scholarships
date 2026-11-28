# Australia, batch 1 (hub, visa, proof of funds, cost of living): filing notes

Date: 2026-11-28. Status: drafts only. Australia stays `launched: false` in `lib/study-abroad/countries.ts` (it was already listed there as hidden). Nothing here is filed to the Inbox.

## The four pages

| Page | Where its text lives | File |
|---|---|---|
| Country hub `/study-abroad/study-in/australia` | The hub is built by code (`app/study-abroad/study-in/[country]/page.tsx`). Its text is generic. Its three key-fact tiles come from `sa_facts`. | `scripts/study-abroad/proposals/australia-facts-2026-11-28.json` (7 facts) and the `KEY_FACTS.australia` line in the PR |
| Visa guide `/study-abroad/visas/australia-student-visa-guide` | `sa_guides`, kind `visa` | `australia-visa-guide-2026-11-28.json` |
| Proof of funds `/study-abroad/study-in/australia/australia-student-visa-proof-of-funds` | `sa_guides`, kind `guide` | `australia-funds-guide-2026-11-28.json` |
| Cost of living `/study-abroad/study-in/australia/australia-cost-of-living-for-indian-students` | `sa_guides`, kind `guide` | `australia-cost-of-living-guide-2026-11-28.json` |

All files are in `scholarship-app/scripts/study-abroad/proposals/`. Research notes with every quote, URL and date: `plans/australia-research/au-visa-facts.md`.

## Suggested filing order

1. The three guide files (any order). They pass `check-proposals.mjs` (host check only).
2. The facts file, only after the blocker below is dealt with.

Dry run first: `node scripts/study-abroad/propose-changes.mjs <file> --target=staging --dry-run`.

## Blocker for the facts file (hub tiles)

`check-proposals.mjs` fails all 7 facts. A `sa_facts` value needs an entry in `data/study-abroad/source-checks.json` whose quote the checker can read on the live page. Three things stop that for Australia:

1. Home Affairs answers HTTP 403 to the checker's user agent (`india-scholarships-source-check/1.0`), so a fact reads "page could not be fetched". A normal browser user agent gets the page.
2. Most Home Affairs text sits in a script block of the page, and the checker's text step drops script blocks. Only the two fee quotes are outside it.
3. The checker needs the value to sit inside the quote exactly, and the official text writes amounts with commas (`AUD29,710`), so the facts are stored in that form (`29,710`). The hub tile code in the PR strips the commas before formatting.

Because of 1 and 2 I added no registry entries. A registry entry the checker cannot find would fail the weekly source check, and the offline test "run() on the committed registry" assumes every entry sits on the one SEVIS page.

The guides do not need this check, so the hub is the only thing affected. Until the facts are filed the hub tiles for Australia stay empty and the page still renders. Options for the owner: (a) let the checker read Home Affairs (a per-host user agent, or reading the page JSON), then add registry entries for the seven facts and update that offline test; (b) approve the facts by hand in `/admin`. I did not change the checker or the user agent.

## Numbers that need a second look at launch

- Fee, living costs and the 485 fee change often. Facts carry `recheck_after` 2027-02-26. Home Affairs updated the Student visa page on 28 Nov 2026 itself (new Onshore Application Charge, which does not apply to a first application from India).
- The rupee figures use the RBA rate of ₹61.80 per AUD for 27 Nov 2026. The RBI/FBIL reference rate does not cover AUD. Re-run the rate before launch; the rate is written into the page text, so a change means re-filing the three pages.
- Rent figures are the Study Australia calculator's November 2025 samples.

## Launch checklist for Australia (not done here)

- Remove `'australia'` from `UNLAUNCHED_COUNTRIES` in `scripts/lib/quality-rules.js` in the PR that sets `launched: true` (5 `unlaunched_country_link` errors in these pages come from that list; they are expected while hidden).
- Add university and course pages (batch 2). `KNOWN_COUNTRIES` in `scripts/lib/sa-inbox.js` already includes Australia.
- File the facts, then check the hub tiles.

## Not covered

Top universities, top courses and scholarships (batch 2) are not drafted. They need one official page per university and per course, and a ranking source for "top".
