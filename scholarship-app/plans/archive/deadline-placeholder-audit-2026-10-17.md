# Month-end deadlines: audit (CNT-111)

Written 2026-10-17. Status: FINDINGS AND PROPOSED PLAN. No scholarship data was changed. Data: Turso production, read-only. Row-by-row list: `data/deadline-audit-2026-10-17.csv` (262 rows).

## Findings

**The pattern is real.** Of 518 active scholarships, 262 have a deadline of 2026-10-31 (160) or 2026-11-30 (102). All 518 show `verified_status = Verified`, so that field says nothing about which dates are real.

**Most of them are estimates, not deadlines.** Reading each row's own `deadline_description`:

| Class | What it is | Rows |
|---|---|---|
| A | Description states the same date. Fine, keep | 41 |
| B | Description says "typically / usually / late October": the date is an estimate of the usual window | 137 |
| C | Description states a **different** date than the field | 15 |
| D | Rolling or ongoing scheme: a fixed date should not exist | 14 |
| E | No description at all | 26 |
| F | Other wording ("Applications open via NSP"): no date given | 29 |

**Students see an estimate as a hard date.** The live page for Odisha Pre Matric OBC/SEBC (no description) shows "Deadline 30 Nov 2026" in the header, the apply box and the listing cards. The database has no field that says "confirmed" versus "expected", so nothing on the site can tell them apart: the "closing soon" lists, the deadline pages, the morning briefing and the closing-soon articles all treat every date as real.

**The dates are old defaults that are slowly being replaced.** Few of these values appear in the changelog as new values (about 20), so most predate it, probably from the first bulk research. The replacement already works: 96 of them were swapped for sourced dates on 2026-09-18 (official pages cited) and 5 on 2026-08-16. 8 of the 262 have a date proposal waiting in the inbox now. The 2026-10-12 batch of 630 approvals did not touch these.

**Examples that are wrong now (class C):** PM Yashasvi, Bharti Airtel Scholarship Program and Jharkhand e-Kalyan Post Matric all say in their own description that applications closed on July 31, 2026, yet the field says 2026-10-31. SBI Platinum Jubilee Asha and Glow Lovely Careers show "November 30, 2025" in the description (a past cycle).

**Effect on what we just shipped.** The new titles say "Last Date" but contain no date, so they make no false claim. The pages they point to do show a hard date, which for the class B and E rows is an estimate. The 12 title pages include four in that situation (both Odisha pre/post matric OBC pages have no description at all).

## Proposed plan (nothing applied; needs your decisions)

| # | What | Rows | How | Needs from you |
|---|---|---|---|---|
| 1 | Add a way to say "expected, not confirmed": a `deadline_status` value (confirmed / expected / rolling / unknown). Show "Expected: late October" instead of "Deadline: 31 Oct 2026" for expected; keep estimates out of "closing soon" lists, JSON-LD and the briefing | all 262 (137 in class B alone) | Small database change plus display changes in the page header, cards and lists | **Decision: do this, or simply blank the dates?** I recommend the field |
| 2 | Fix the clearly wrong ones first (class C): verify each against its official page and set the real date or "closed" | 15 | Follow `docs/SCHOLARSHIP_SOURCES.md`: official source first; no change from a secondary page alone | OK to start |
| 3 | Rolling schemes (class D): mark as rolling, remove the fixed date | 14 | Check each description; set `always_open` | none |
| 4 | Research the unknowns (classes E and F): official page, then date or "unknown" | 55 | Same source flow; start with the four Odisha pages that share titles with IS-36; changes go through the inbox with source evidence | none |
| 5 | Class A: leave alone | 41 | none | none |
| 6 | Stop it coming back: new scholarships and agent rolls must not default to a month-end date | n/a | Find where the agents write the default; make "unknown" the default | none |

Suggested order: 2, then 3 (small, safe), then the decision on 1, then 4 and 6.
Known limit: the class split is by wording, so some F rows may be real dates described loosely. Review the CSV before bulk changes.
