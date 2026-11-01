# The 14 "rolling" scholarships, checked against official pages

Written 2026-10-23. Status: FINDINGS AND PROPOSED ACTIONS. No scholarship data was changed by this file.
Method: official pages read with a page reader and, for script-driven sites, the built-in browser. Brief: `plans/agy-brief-rolling-schemes.md` (done by Claude, not AGY). Quotes are copied from the page.

## Findings

**Only 2 of the 14 are confirmed as not rolling with dates, and 1 more shows a wrong note; the other 11 could not be settled from official pages.** The notes on our site that said "ongoing" or "year-round" were mostly an AI summary with no official statement behind them. Official portals mostly do not state a timing at all on their home pages, which is why the rows stay "unknown" rather than becoming "rolling".

| # | Scholarship | Verdict | What the official page says |
|---|---|---|---|
| 1 | Jagananna Vidya Deevena (AP) | NOT FOUND | JnanaBhumi home page shows only the site name; no timing |
| 2 | Gopabandhu Sikhya Sahayata Yojana (Odisha) | NOT rolling, cycle-based | State Scholarship Portal notice, 7 Oct 2026: fresh applications, student level shows no dates yet ("-"); institute level closes 04.11.2026; district level "Open Shortly"; renewal at institute level 07.10.2026 to 28.10.2026. Student deadline not yet published |
| 3 | Bidesh Sikhyabruti, our "Videsh Siksha Bruti" (Odisha) | NOT rolling, FIXED date, now closed | Portal notice (22 Sep 2026): "Student level - Extended from 19.09.2026 to 30.09.2026". For SC/ST students, top-200 QS-ranked foreign institutes, family income up to Rs 12 lakh, 50 students in total. Opened 18 Aug 2026 (notice title), extended 1 Sep and 22 Sep |
| 4 | Tamil Pudhalvan (TN) | NOT FOUND (timing) | Social Welfare department page: apply online through UMIS; no window or last date stated; bonafide certification on 30 June and 31 December |
| 5 | Dayanand Social Security Scheme (Goa) | NOT FOUND | Department home page does not mention the scheme |
| 6 | Godrej Tomorrow Makers | NOT FOUND (timing) | Site gives no window; some test stages can be taken "at any time" |
| 7 | Sikshashree (West Bengal) | NOT FOUND | West Bengal page last updated 2 May 2022 and still says the scheme "is being formulated" |
| 8 | MP Vikramaditya Free Education | NOT FOUND | The MP higher-education scholarship portal home page does not list it |
| 9 | Mukhyamantri Kanya Sumangala (UP) | NOT FOUND (timing) | UP page gives stage eligibility by birth date or academic year, but no application window; links an "Online Application Process" PDF not read |
| 10 | IIT Delhi alumni and donor scholarships | NOT FOUND | Alumni site gives no window; points to a "Student Scholarships and Awards" page not read |
| 11 | IIT Madras tuition fee waiver | no fixed date (not rolling) | Page states no deadline; "Renewal of scholarship every semester is subject to a minimum GPA of 5.0" |
| 12 | Ladli Beti (J&K) | NOT FOUND | The link we hold no longer resolves (domain not found) |
| 13 | Humboldt Research Fellowship | NOT rolling | Official page: three application calls a year; "Der nächste Call wird am 15. November 2026 öffnen." Calls open 15 March, 15 July and 15 November; a call closes when its limit (800 applications) is reached. Our note said "continuous" |
| 14 | Macquarie Vice-Chancellor's International | ROLLING (not quote-verified) | The university's own page could not be read by my tools (error 403). A search summary of that page says open year-round, no fixed closing date. Needs one more look before use |

**Side result that matters more:** the same Odisha notice (7 Oct 2026) gives real dates for three scholarships that were on the "unknown" list: **e-Medhabruti UG, PG and Technical/Professional merit: student applications 07.10.2026 to 26.10.2026** (institute verification to 04.11.2026; renewal validation to 28.10.2026). The daily freshness agent has already filed 2026-10-26 for all three in the inbox (pending). The official notice confirms them. Vyasakabi Fakir Mohan Bhasabruti has the same dates (not in our list).

## Proposed actions

| # | Action | Rows | How | Needs |
|---|---|---|---|---|
| 1 | Approve the three pending e-Medhabruti deadline proposals (2026-10-26) | 3 | Inbox: approve; each becomes "confirmed" | Owner |
| 2 | Bidesh Sikhyabruti: record the real closed date (2026-09-30) and remove the "rolling" wording | 1 | Inbox proposal (the agent will find it; or file by hand) | Owner approval |
| 3 | Humboldt: replace "continuous" wording with the three-calls-a-year rule and the 15 Nov 2026 opening | 1 | Inbox proposal for the description | Owner approval |
| 4 | Gopabandhu: wait for the student-level dates; the portal says "Open Shortly" | 1 | The freshness agent re-checks weekly | none |
| 5 | Leave the other 9 as "unknown": no official page states a timing, so we do not call them rolling | 9 | none; the agent keeps re-checking | none |
| 6 | Macquarie: read the university page once more (browser) and quote it before marking rolling | 1 | Browser read | none |

Note: do not put time-varying values (dates, "next call opens") in `data/manual-corrections.json`; it re-applies every run and would overwrite later approved changes.
