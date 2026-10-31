# IS-36: new titles for the 12 pages (drafts)

Written 2026-10-13. Status: DRAFT FOR REVIEW. No page, title or code has been changed.
Follows `plans/is-36-ctr-recheck-2026-10-13.md`. Queries and numbers: Search Console API, Sep 11 - Oct 9 2026 (read-only). Live titles read from the site today.

## Why change them

Google shows about 55-60 characters of a title. The live titles are 73-119 characters, so the words people search for ("last date", the state, the group) are usually cut off. Seven of the twelve use the same generic ending ("Apply Online, Portal Login & Status Check") and two more use similar generic endings. The proposed titles are 50-59 characters, put the scheme and state first, and use the words that appear in each page's real queries. They contain no dates and no amounts (see Flags).

## Draft titles (before and after, with the character count)

| # | Page | Live title (chars) | Proposed title (chars) | Top queries (impressions, 29 days) |
|---|---|---|---|---|
| 1 | `krishi-vidya-nidhi-yojana-odisha` | Krishi Vidya Nidhi Yojana Odisha 2026-27: Benefit Amount & Eligibility Check (76) | **Krishi Vidya Nidhi Yojana Odisha 2026-27: Last Date & Apply** (59) | krushi nidhi scholarship (617); krishi vidya nidhi yojana (929); krishi vidya nidhi yojana scholarship apply date 2026 (1980) |
| 2 | `up-post-matric-other-than-intermediate-general-sc-st` | UP Post-Matric Scholarship (Other Than Intermediate) (General/SC/ST) 2026-27: Apply Online, Portal Login & Status Check (119) | **UP Post Matric (Other Than Inter) General/SC/ST 2026-27** (55) | long tail only (weak evidence) |
| 3 | `chief-minister-higher-education-scholarship-rajasthan` | Rajasthan Chief Minister Higher Education Scholarship 2026-27: Apply Online & Status (84) | **Rajasthan CM Scholarship 2026-27: Last Date & Eligibility** (57) | cm scholarship rajasthan last date 2026 (234); cm scholarship rajasthan 2026 last date (1090) |
| 4 | `up-post-matric-other-than-intermediate-obc` | UP Post-Matric Scholarship (Other Than Intermediate) (OBC) 2026-27: Apply Online, Portal Login & Status Check (109) | **UP Post Matric (Other Than Inter) OBC 2026-27: Login** (52) | post matric other than intermediate login fresh (71); up scholarship other than intermediate renewal (66) |
| 5 | `infosys-foundation-stem-stars-scholarship-program` | Infosys Foundation STEM Stars Scholarship Program 2026-27: Application Form, Eligibility & Selection List (105) | **Infosys STEM Stars Scholarship 2026-27: Eligibility & Apply** (59) | infosys stem stars scholarship 2026 (1077); infosys foundation stem stars scholarship program 2026-27 (348); infosys scholarship 2026 (966) |
| 6 | `up-post-matric-outside-state-general-sc-st` | UP Post-Matric Scholarship (Outside State) (General/SC/ST) 2026-27: Apply Online, Portal Login & Status Check (109) | **UP Scholarship for Students Studying Outside UP 2026-27** (55) | up scholarship for other state student (38); up scholarship other state (60) |
| 7 | `mp-gaon-ki-beti-yojana` | Gaon Ki Beti Yojana (Madhya Pradesh) 2026-27: Details, Eligibility & Status Check (81) | **Gaon Ki Beti Yojana MP 2026-27: Last Date & Apply Online** (56) | gaon ki beti yojana 2026 27 last date (206); gaon ki beti yojana 2026 last date apply online (91); gaon ki beti yojana 2026 last date (288) |
| 8 | `pre-matric-scholarship-for-obcsebc-students-odisha` | Pre Matric Scholarship for OBC/SEBC Students (Odisha) 2026-27: Apply Online, Portal Login & Status Check (104) | **Odisha Pre Matric Scholarship 2026-27 for OBC/SEBC** (50) | pre matric scholarship odisha (2733); prematric scholarship odisha (668) |
| 9 | `tamil-nadu-post-matric-scholarship-for-scst` | Tamil Nadu Post-Matric Scholarship for SC/ST 2026-27: Apply Online, Portal Login & Status Check (95) | **Tamil Nadu Post Matric Scholarship SC/ST 2026-27: Apply** (55) | sc scholarship for college students in tamil nadu 2026 (26); sc st scholarship (26) |
| 10 | `rajasthan-post-matric-scholarship-obc` | Rajasthan Post-Matric Scholarship for OBC Students 2026-27: Apply Online, Portal Login & Status Check (101) | **Rajasthan Post Matric Scholarship OBC 2026-27: Last Date** (56) | long tail only (weak evidence) |
| 11 | `post-matric-scholarship-for-obcsebc-students-odisha` | Odisha Post Matric OBC/SEBC Scholarship 2026-27: Apply Online & Deadlines (73) | **Odisha Post Matric Scholarship 2026-27 for OBC/SEBC** (51) | long tail only (weak evidence) |
| 12 | `e-medhabruti-pg-merit-scholarship-odisha` | e-Medhabruti PG Merit Scholarship (Odisha) 2026-27: Apply Online, Portal Login & Status Check (93) | **Odisha e-Medhabruti PG Merit Scholarship 2026-27: Last Date** (59) | pg merit scholarship last date 2026 (210); pg merit scholarship amount (121) |

Notes on the table:
- Rows 2, 4 and 6 are the three UP post-matric pages. They are different schemes (General/SC/ST, OBC, Outside State), so each title now says which one it is.
- Row 11 already has a short live title (73). My version is only slightly shorter; treat it as optional and last.
- Rows 2, 10 and 11 have almost no query-level evidence (their traffic is spread over very many tiny queries). Their titles follow the pattern of the others and are the least certain.
- Open vs closed: the code swaps wording when a deadline has passed. These proposed titles are worded to be true in both states ("Last Date", not "Apply Online"), so one title per page is enough.

## One more page: the e-Kalyan Jharkhand student-login guide (biggest raw upside)

Live title: "e-Kalyan Jharkhand Portal Student Login & Registration Guide 2026: Portal Help | IndiaScholarships" (97). Proposed: **e-Kalyan Jharkhand Student Login 2026: Steps & Help** (48). Its source is the portal guide data (`lib/portalsData.ts`).
Expect less than the earlier figure: its queries ("e kalyan student login", "ekalyan login") are mostly people trying to reach the official portal, ranking 2.3-2.7 with about 1.6% click-through. A better title helps a little; most of those searchers will still go straight to the portal.

## Flags (found while drafting, not fixed)

1. **Krishi Vidya Nidhi amount conflict.** The live description says "up to ₹10,000/year"; the database says `amount_annual` 100000. One of them is wrong. Titles avoid amounts. Check the official source before anything states a number.
2. **Deadlines cluster on month ends.** Of 518 active scholarships, 160 have deadline 2026-10-31 and 102 have 2026-11-30 (another 29 have 2026-12-31 and 28 have 2026-09-30). Unrelated state schemes sharing one date suggests placeholders or rolled-forward dates rather than verified ones. Titles and descriptions avoid dates. This is worth a separate check (backlog item suggested), and it touches the "last date" searches these titles target.

## How to apply it (when you approve)

- Add 12 slug entries to the existing override list in `generateMetadata` (`app/scholarships/[slug]/page.tsx`, same pattern as the ~15 overrides already there). Do not change the generic rule: that would touch about 500 pages at once, which the recovery plan says to avoid.
- Add the guide title in the portal guide data.
- Branch, then PR, then the staging check before `main`, as usual.

## Measuring it

Check again on **2026-11-03** (three weeks after the change), same API, same window length. Baseline now:

| Page | Position | Click-through | Impressions / 30 days | Clicks / 30 days |
|---|---|---|---|---|
| `krishi-vidya-nidhi-yojana-odisha` | 6.0 | 0.63% | 25,055 | 157 |
| `up-post-matric-other-than-intermediate-general-sc-st` | 4.9 | 0.29% | 9,988 | 29 |
| `chief-minister-higher-education-scholarship-rajasthan` | 5.1 | 0.65% | 6,339 | 41 |
| `up-post-matric-other-than-intermediate-obc` | 5.6 | 0.23% | 7,929 | 19 |
| `infosys-foundation-stem-stars-scholarship-program` | n/a | | | |
| `up-post-matric-outside-state-general-sc-st` | 5.2 | 1.08% | 4,676 | 51 |
| `mp-gaon-ki-beti-yojana` | n/a | | | |
| `pre-matric-scholarship-for-obcsebc-students-odisha` | 6.0 | 0.67% | 5,244 | 35 |
| `tamil-nadu-post-matric-scholarship-for-scst` | n/a | | | |
| `rajasthan-post-matric-scholarship-obc` | 4.8 | 0.95% | 3,142 | 30 |
| `post-matric-scholarship-for-obcsebc-students-odisha` | 5.9 | 0.30% | 3,505 | 10 |
| `e-medhabruti-pg-merit-scholarship-odisha` | 5.8 | 0.50% | 3,290 | 17 |

Only about five pages have enough traffic to show a result: Krishi Vidya Nidhi, Rajasthan CM Scholarship, Infosys STEM Stars, Odisha Pre Matric and Gaon Ki Beti. For the rest, judge by direction only. Positions are still moving after the September spam update, so compare click-through only for pages whose position stayed within about 1.5 of today's.
