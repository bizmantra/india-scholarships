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

## Facts file blocked by the Home Affairs 403: two options and a recommendation

The seven facts in `australia-facts-2026-11-28.json` cannot be filed today. `propose-changes.mjs` refuses a `sa_facts` value unless `data/study-abroad/source-checks.json` has an entry for it and the checker can find the quote on the live page. Home Affairs answers the checker's user agent with HTTP 403, and most of its text sits in a script block that the checker's text step drops. I changed neither.

**Option A: fix the checker's fetch.**
- What it takes: a narrow change in `scripts/lib/source-verify.mjs`. (1) Use a different user agent for `homeaffairs.gov.au` only. (2) Let a registry entry read the page's embedded JSON text, or keep quotes to the visible text. Then add seven registry entries and update the offline test "run() on the committed registry", which assumes every entry sits on one page.
- Evidence it can work: from the box, a normal browser user agent got HTTP 200 and the two fee quotes were found.
- Risks: it is untested from GitHub's servers, where the weekly check runs. Home Affairs may block those addresses even with a browser agent. Choosing a browser-like user agent for a government site is a policy call for the owner.
- Gain: the facts are rechecked every week. The living-cost figure has been changed by law before (AUD 24,505 to AUD 29,710, item 5 in `au-visa-facts.md`), so it can go stale.

**Option B: hand-approve.**
- What it takes: the Inbox cannot carry these facts, because the source gate refuses them before they reach it. "Hand-approve" therefore means the owner writes the seven rows to `sa_facts` himself, in a one-off script or directly in the database, after reading the quotes in `au-visa-facts.md`.
- Gain: no code change, and the hub tiles can be filled this week.
- Risk: nothing rechecks those rows, so a changed fee stays on the hub until someone notices. The weekly job only checks registry entries.

**Recommendation: A, in two steps.** Do not hold the rest of Australia for it. The guides, the university page, the course pages and the scholarships do not touch this gate and can be filed in the normal order. Keep Australia hidden. Before launch, test the Home Affairs fetch from a GitHub Actions run (a one-line workflow dispatch). If it passes, ship the narrow checker change and file the facts. If GitHub's addresses are blocked, use Option B for the seven rows and put a dated reminder on the recheck day (2027-02-26). The weekly source check then stays honest, because B is a one-time, owner-signed decision. It is not a quiet gap in the gate.

## Batch 2 (added 2026-11-28)

Files, all under `scripts/study-abroad/proposals/`:

| File | Table | Page |
|---|---|---|
| `australia-university-melbourne-2026-11-28.json` | `sa_universities` | `/study-abroad/universities/university-of-melbourne` |
| `australia-course-melbourne-mit-2026-11-28.json` | `sa_programs` | `/study-abroad/program-detail/australia/university-of-melbourne/melbourne-master-of-information-technology` |
| `australia-course-melbourne-mds-2026-11-28.json` | `sa_programs` | `/study-abroad/program-detail/australia/university-of-melbourne/melbourne-master-of-data-science` |
| `australia-new-scholarships-2026-11-28.cjs` | `agent_proposals` (new_scholarship), 3 records | Melbourne International Graduate Scholarship, Melbourne International Excellence Scholarship (Graduate), Australia Awards India |

Research and quotes: `au-batch2-notes.md`. The `.cjs` was only run against a stub, never a database; it writes nothing without `--go`.

Notes for the owner:
- `official-domains.json` gains `unimelb.edu.au`, `australiaawardsindia.org` and `dfat.gov.au`.
- The Melbourne course pages build their Fees and Entry tabs in the browser. I read the course data the page embeds. A weekly checker could not read these from the page text. The scholarship pages (scholarships.unimelb.edu.au) are plain text, so they are good registry candidates.
- The scholarship records are rows in the main `scholarships` table, so approving them creates normal scholarship pages even though Australia is hidden (the UK records worked the same way). Australia Awards India has `app_type` and `application_mode` left empty because the page does not say how to apply while it is closed.
- Both course pages use `field: computer-science` and `field: data-science`, which decide which comparison page they join.
- Only one university is covered. It was chosen because its pages publish fees, entry rules and an India page, not because of a ranking.
