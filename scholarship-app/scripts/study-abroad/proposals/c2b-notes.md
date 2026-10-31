# C2b (USA): official sources and checked dates - findings

Batch C2b (content spec C2), USA half. Date checked: **2026-10-30**. Database read: **staging** (the DB the owner reviews).

This file carries my own **Questions** and **Done** section because `plans/study-abroad-content-spec.md` is owned by the parallel C2a (Germany) branch; editing it would conflict. The C2 Done section for USA lives here.

## Counts (staging, re-counted 2026-10-30)

| Measure | Before | After these proposals |
|---|---|---|
| Published USA guides | 54 | 54 |
| ...with BOTH official_source and checked_at | 0 | 8 |
| ...missing at least one | 54 | 46 |
| Pages reviewed in this batch | - | 21 |
| Verified (source + date proposed) | 0 | 8 |
| Corrected (money, separate file) | 0 | 1 |
| Gap (left unchanged) | 0 | 13 |

Staging has 54 published USA guides; production's `usa-h1b-lottery-cap-exempt` source/date are NOT on staging (staging row is unsourced), so staging is 54 of 54 missing, not 53 of 54.

## Verdict table (per page)

All URLs below were fetched with curl today; every quoted string was re-checked against the saved page by `selfcheck.cjs` (output in `selfcheck.txt`).

| # | Page (slug) | Verdict | Official source proposed | Verbatim quote from the saved page | HTTP |
|---|---|---|---|---|---|
| 1 | `usa-opt-stem-opt-extension` | verified | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "Certain F-1 students who receive science, technology, engineering, and mathematics (STEM) degrees may apply for a 24-month extension of their post-completion optional practical training (OPT)." (+7 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 2 | `usa-cpt-internship-rules` | verified | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | "To qualify for CPT, you must have completed one full academic year of study at an SEVP-certified school, unless you are a graduate student whose program requires immediate CPT." (+3 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 3 | `usa-on-campus-jobs-20hr-rule` | verified | https://www.ice.gov/sevis/employment | "May work up to 20 hours per week while school is in session (full-time during those periods when school is not in session or during the annual vacation)" (+3 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 4 | `usa-ssn-application-guide` | verified | https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number | "The Social Security Administration (SSA) assigns nine-digit Social Security numbers (SSNs) to U.S. citizens, permanent residents and eligible nonimmigrant workers in the United States." (+2 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 5 | `usa-initial-72hr-survival-guide` | verified | https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states | "You have 30 days to enter the country before your official program start date, which is recorded in SEVIS." (+3 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 6 | `usa-i20-financial-proof-manual` | verified | https://studyinthestates.dhs.gov/students/prepare/financial-ability | "Designated school officials (DSOs) must collect evidence of the student's financial ability before issuing a Form I-20" (+2 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 7 | `usa-h1b-lottery-cap-exempt` | verified | https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations | "The H-1B classification has an annual numerical limit (cap) of 65,000 new statuses or visas each fiscal year" (+2 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 8 | `usa-green-card-eb2-niw-pathways` | verified | https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2 | "Those seeking a national interest waiver may self-petition (you do not need an employer to sponsor you) and you do not need to obtain a labor certification from the DOL." (+2 more quotes for this page, in the mapping below) | 200 (2026-10-30) |
| 9 | `usa-opt-stem-opt-extension` | **corrected** (money, separate file) | https://www.uscis.gov/sites/default/files/document/forms/g-1055.pdf | "General filing for initial, replacement, or renewal Paper Filing: $520" | 200 (2026-10-30) |
| 10 | `usa-f1-student-visa-master-guide` | gap | - | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (only partial confirmation, https://www.ice.gov/sevis/i901) | - |
| 11 | `usa-ds160-form-filing-manual` | gap | - | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (only partial confirmation, https://www.ice.gov/sevis/i901) | - |
| 12 | `us-f1-student-visa-application-checklist` | gap | - | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (only partial confirmation, https://www.ice.gov/sevis/i901) | - |
| 13 | `usa-f1-visa-interview-prep-questions` | gap | - | no official page confirms the page today | - |
| 14 | `us-consulate-slot-booking-hacks` | gap | - | no official page confirms the page today | - |
| 15 | `usa-i20-issuance-deposit-payment` | gap | - | no official page confirms the page today | - |
| 16 | `usa-total-cost-breakdown` | gap | - | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (only partial confirmation, https://www.ice.gov/sevis/i901) | - |
| 17 | `usa-routes-hub-guide` | gap | - | no official page confirms the page today | - |
| 18 | `usa-visa-routes-hub-guide` | gap | - | no official page confirms the page today | - |
| 19 | `usa-priority-vs-rolling-deadlines` | gap | - | no official page confirms the page today | - |
| 20 | `usa-gre-gmat-waiver-directory` | gap | - | no official page confirms the page today | - |
| 21 | `usa-toefl-ielts-duolingo-cutoffs` | gap | - | no official page confirms the page today | - |
| 22 | `us-education-loans-guide` | gap | - | no official page confirms the page today | - |

## Claims -> quote mapping (verified pages)

Every concrete claim I checked, the official page I read it on, and the exact words. This is what the `official_source` is being proposed for. Claims marked **not confirmed** were left unchanged and are not covered by this source.

### `usa-opt-stem-opt-extension` - Post-Study Work Rights: Initial OPT & 24-Month STEM OPT Extension Guide

Proposed `official_source`: https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| 24-month STEM extension | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "Certain F-1 students who receive science, technology, engineering, and mathematics (STEM) degrees may apply for a 24-month extension of their post-completion optional practical training (OPT)." |
| 90 days unemployment on initial OPT, 150 total with the extension | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "You may be unemployed during your OPT period for a limited number of days." |
| 90 + 60 = 150 days unemployment table | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "Initial post-completion OPT only Up to 90 days 90 days 24-month extension An additional 60 days 150 days" |
| employer must be enrolled in E-Verify | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "Be enrolled in E-Verify, as evidenced by either a valid E-Verify company" |
| apply up to 90 days before current OPT expires | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | "up to 90 days before your current OPT employment authorization expires" |
| 12 months initial OPT; 24-month extension (the 36 months total on the page) | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students | "up to 12 months of OPT employment authorization" |
| 24-month extension stated on the OPT page | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students | "you may apply for a 24-month extension of your post-completion OPT employment authorization" |
| E-Verify is a STEM extension condition | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students | "Are employed by an employer who is enrolled in and is using E-Verify" |

Supporting official pages (also fetched): https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students

**Not confirmed by this source (left unchanged):**

- I-765 fee '$410 Paper / $470 Online' was WRONG - corrected in the corrections file (paper fee is $520)
- '7-digit E-Verify Company Identification Number' - USCIS asks for the number but does not state it is 7 digits
- H-1B lottery entries during STEM OPT and Form I-983 salary-matching details are not on the cited pages

The claimed 36 months (12 + 24) is supported by the two USCIS pages together. The Form I-765 fee is a separate, money-only correction.

### `usa-cpt-internship-rules` - Curricular Practical Training (CPT) Internship Rules & Eligibility

Proposed `official_source`: https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| one full academic year before CPT (the page's '2 consecutive semesters / approx 9 months') | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | "To qualify for CPT, you must have completed one full academic year of study at an SEVP-certified school, unless you are a graduate student whose program requires immediate CPT." |
| 12 months or more of full-time CPT forfeits post-completion OPT (page: keep under 364 days) | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | "Students who complete one year or more of full-time CPT are ineligible to participate in post-completion OPT." |
| no work before authorization | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | "You must have proper authorization before beginning any practical training." |
| DSO authorizes CPT in SEVIS and issues an updated Form I-20 | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | "your DSO will authorize you for CPT in the Student and Exchange Visitor Information System (SEVIS) and provide you with an updated Form I-20" |

**Not confirmed by this source (left unchanged):**

- part-time CPT 'max 20 hours/week' and full-time '21-40+ hours' (the official page says CPT is not restricted by the 20-hour limit and does not define part-time hours)
- wage claims ($25-$40/hour part-time, $35-$55/hour full-time, $12k-$18k over summer) - no official source
- '1-credit CPT course' - school policy, not federal

Core federal CPT rules all confirmed. Wage and course-credit detail is the site's own material and was not confirmed or changed.

### `usa-on-campus-jobs-20hr-rule` - On-Campus Student Jobs (20 Hours/Week Rule) & Campus Hiring Guide

Proposed `official_source`: https://www.ice.gov/sevis/employment

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| 20 hours/week in session, full-time in breaks (page says 'up to 40 hours') | https://www.ice.gov/sevis/employment | "May work up to 20 hours per week while school is in session (full-time during those periods when school is not in session or during the annual vacation)" |
| no waiting period before on-campus work (page: from the very first day of classes) | https://www.ice.gov/sevis/employment | "Must an F-1 student wait one academic year before starting to work on campus? No." |
| campus job leads to an SSN certification letter | https://www.ice.gov/sevis/employment | "receive a certification letter to present to the Social Security Administration in order to be able to receive a Social Security number" |
| the 20-hour cap in session (second official page) | https://studyinthestates.dhs.gov/students/work/working-in-the-united-states | "you may not work more than 20 hours per week when school is in session" |

Supporting official pages (also fetched): https://studyinthestates.dhs.gov/students/work/working-in-the-united-states

**Not confirmed by this source (left unchanged):**

- hourly wages $12-$18.50 and $800-$1,250/month earnings - no official source
- the '40 hours/week' figure - official wording is 'full-time', not a 40-hour number
- Handshake / student-portal advice - school-specific

The 20-hour rule, the full-time break rule and the SSN link are confirmed on ICE's official employment page.

### `usa-ssn-application-guide` - Social Security Number (SSN) Application Guide for International Students

Proposed `official_source`: https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| SSN is a 9-digit number issued by the SSA | https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number | "The Social Security Administration (SSA) assigns nine-digit Social Security numbers (SSNs) to U.S. citizens, permanent residents and eligible nonimmigrant workers in the United States." |
| you need employment authorization / a job before an SSN | https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number | "Every F and M student who U.S. Citizenship and Immigration Services (USCIS) grants employment authorization to needs an SSN." |
| apply in person at an SSA office with original documents | https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number | "You can file your application for an SSN card in person at any SSA office" |

**Not confirmed by this source (left unchanged):**

- '100% free ($0)' and 'card arrives in 7-14 business days' - SSA policy, not stated on the cited page and not verified today
- 'Form SS-5' - not named on the cited page
- credit-score and phone-plan benefits - opinion, not a fact to source

Eligibility (job/work authorization first) and the application route are confirmed. The free-of-charge and delivery-time claims remain unverified.

### `usa-initial-72hr-survival-guide` - US Initial 72-Hour Survival Guide: Port of Entry (I-94), SIM Card & Cash

Proposed `official_source`: https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| 30-day early entry window | https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states | "You have 30 days to enter the country before your official program start date, which is recorded in SEVIS." |
| Form I-94 is the arrival/departure record | https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states | "The Form I-94, "Arrival/Departure Record" is a critical record. It shows that you have been legally admitted to the United States, the class of admission, and the authorized period of stay." |
| CBP generates the electronic I-94 automatically for air/sea arrivals | https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states | "an automated Form I-94 record will automatically be generated for you by U.S. Customs and Border Protection (CBP) officers" |
| 30 days before the I-20 start date (clearer second statement) | https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20 | "You may arrive up to 30 days before the start date listed on your Form I-20" |

Supporting official pages (also fetched): https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20

**Not confirmed by this source (left unchanged):**

- 'passport stamped F-1 D/S (Duration of Status)' - the official page says the admission stamp shows class of admission and admitted-until date, not the D/S wording
- downloading I-94 from i94.cbp.dhs.gov - CBP host was not fetched in this pass
- SIM card and bank-account advice - no official source needed, no facts changed

The two hard rules (30-day entry, I-94 record) are confirmed on the official arrival page.

### `usa-i20-financial-proof-manual` - I-20 Financial Proof Manual: Bank Statements, Fixed Deposits & Sanction Letters

Proposed `official_source`: https://studyinthestates.dhs.gov/students/prepare/financial-ability

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| school must collect financial evidence before issuing the I-20 | https://studyinthestates.dhs.gov/students/prepare/financial-ability | "Designated school officials (DSOs) must collect evidence of the student's financial ability before issuing a Form I-20" |
| you (or a sponsor) must show funds for tuition and living costs | https://studyinthestates.dhs.gov/students/prepare/financial-ability | "A prospective student must have financial evidence showing that they or a sponsor has sufficient funds to cover tuition and living expenses during the period of intended study." |
| bank statements and sponsor documents are acceptable evidence | https://studyinthestates.dhs.gov/students/prepare/financial-ability | "Evidence of financial ability includes but is not limited to: Family bank statements. Documentation from a sponsor." |

**Not confirmed by this source (left unchanged):**

- 'only 1 full academic year required' - official wording is 'during the period of intended study'; the school sets the figure
- '$45,000-$75,000 / Rs 37-62 lakh' I-20 cost range - school-specific, not on the cited page
- 'property, gold and unvested stock are rejected by ISSO' - school policy; the official page says schools may set their own acceptable evidence
- Rs 100 stamp-paper affidavit and 5-7 business-day ISSO timelines - not official

The rule that funds must be shown before the I-20 is issued, and what counts as evidence, is confirmed. The 1-year and dollar figures are the page's own claims and were left untouched.

### `usa-h1b-lottery-cap-exempt` - H-1B Visa Lottery Strategy & Cap-Exempt Employer Pathways

Proposed `official_source`: https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| 65,000 regular cap | https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations | "The H-1B classification has an annual numerical limit (cap) of 65,000 new statuses or visas each fiscal year" |
| 20,000 US master's-or-higher petitions exempt from the cap | https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations | "An additional 20,000 petitions filed on behalf of beneficiaries who have earned a master's degree or higher from a U.S. institution of higher education are exempt from the cap." |
| cap-exempt employers (universities, nonprofit research organisations) need no lottery | https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations | "H-1B workers who are petitioned for or employed at an institution of higher education or its affiliated or related nonprofit entities, a nonprofit research organization, or a government research organization, are not subject to this numerical cap." |

**Not confirmed by this source (left unchanged):**

- 'beneficiary-centric lottery, one entry per passport' - not stated on the cited page
- 'cap-exempt visas processed via Premium Processing in 15 days' - not stated on the cited page
- the order of the two lottery draws (master's pool first) - not stated on the cited page

Caps and the cap-exempt categories are confirmed. The lottery-mechanics and 15-day premium claims are the site's own and were left untouched.

### `usa-green-card-eb2-niw-pathways` - Permanent Residency & Green Card Pathways: EB-2 NIW, EB-1A & O-1 Visas for Indians

Proposed `official_source`: https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2

| Claim on the page | Confirmed by (URL) | Verbatim quote |
|---|---|---|
| NIW self-petition, no employer sponsor and no labour certification | https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2 | "Those seeking a national interest waiver may self-petition (you do not need an employer to sponsor you) and you do not need to obtain a labor certification from the DOL." |
| prong 1 of the three-prong test | https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2 | "Prong 1: Evidence That Your Endeavor Has Substantial Merit and National Importance" |
| prong 3 of the three-prong test | https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2 | "Prong 3: On Balance, It Would Be Beneficial to the United States to Waive the Job Offer and Thus the Permanent Labor Certification Requirements" |

**Not confirmed by this source (left unchanged):**

- 'Matter of Dhanasar' by name - USCIS states the three prongs but the cited page does not name the case
- O-1A 'no annual cap, can be renewed indefinitely' - not covered by the EB-2 page
- EB-1A '3 of 10 criteria' - not covered by the EB-2 page

The EB-2 NIW core (self-petition, PERM waiver, three prongs) is confirmed on the official EB-2 page.

## Corrections (separate money file)

- **`usa-opt-stem-opt-extension`**, field `body_md`: "$410 USD (Paper) / $470 USD (Online)" -> **"$520 USD (Paper) / $470 USD (Online)"**.
  - Source: https://www.uscis.gov/sites/default/files/document/forms/g-1055.pdf (HTTP 200, fetched 2026-10-30; PDF is the USCIS fee schedule, edition 10/26/26).
  - "current I-765 paper filing fee is $520 (page says $410)": "General filing for initial, replacement, or renewal Paper Filing: $520"
  - "current I-765 online filing fee is $470 (page already says $470)": "Online Filing: $470"
  - "fee schedule edition proves the date checked": "Form G-1055 Edition 10/26/26"
  - Money-only correction: both table columns of the Initial OPT vs STEM OPT comparison. This is the only fee contradiction found in the batch. The same body_md proposal also renames the article's '## Executive Summary' heading, because the inbox validator (scripts/lib/sa-inbox.js BANNED) refuses any value containing that template phrase - without the rename the money fix cannot be submitted at all. No other prose is touched.

Why a full `body_md` change: the wrong fee lives inside the Initial-OPT-vs-STEM-OPT table in the article. The proposal replaces the two fee cells and adds the official fee-schedule link the article was missing (the article had no absolute source link, which the inbox validator requires). Nothing else in the article is edited.

## Gaps (nothing official confirmed; pages left unchanged)

| Page (slug) | Why it is a gap | Partial confirmation found today | What would unblock it |
|---|---|---|---|
| `usa-f1-student-visa-master-guide` | The page's core is the Department of State visa process ($185 MRV fee, DS-160, 214(b)). travel.state.gov returned 403 to curl again today, so it cannot be a source and a checked_at would overclaim. The Master's-guide claims that are confirmable on other official pages are listed below for the next pass. | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (https://www.ice.gov/sevis/i901); "You may arrive up to 30 days before the start date listed on your Form I-20" (https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20) | MRV fee $185 and the 214(b) interview rules need a travel.state.gov (or usvisascheduling.com) 200 response before this page can be sourced. |
| `usa-ds160-form-filing-manual` | Form DS-160, the 20-minute session timeout and photo rules are on travel.state.gov / ceac.state.gov, which returned 403 or were not allowlisted. Only the I-901 part is confirmable. | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (https://www.ice.gov/sevis/i901) | Needs a travel.state.gov 200 (DS-160 timeout, photo rules) before the page can carry a source. |
| `us-f1-student-visa-application-checklist` | Staging row has official_source = 'https://travel.state.gov' (a bare domain, no page path) and no checked_at. The page has no body_md (summary only). Its money claims are the $185 MRV fee (travel.state.gov, 403) and the $350 SEVIS fee (confirmable). | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (https://www.ice.gov/sevis/i901) | Follow-up for the owner: the bare 'https://travel.state.gov' source is not a page URL and the row still has no checked_at. Do not treat it as sourced. |
| `usa-f1-visa-interview-prep-questions` | 214(b) interview conduct and the officer's decision process are Department of State material; travel.state.gov is 403. No other official page covers interview strategy. | none | Needs travel.state.gov. |
| `us-consulate-slot-booking-hacks` | Slot booking runs on usvisascheduling.com (CGI Federal for the DoS) and the emergency-appointment/72-hour lockout rules are published by the DoS/U.S. Mission India. usvisascheduling.com is not a .gov host and travel.state.gov is 403, so nothing official could be quoted today. | none | Check whether usvisascheduling.com or the U.S. Mission India site should be added to official-domains.json; only then can this page be sourced. |
| `usa-i20-issuance-deposit-payment` | The money claim (a $100-$500 non-refundable seat deposit) is set by each university, and the 'signed PDF by email / sign in blue ink' delivery claim was not stated on the ICE Form I-20 page fetched today. No single official page confirms the page. | none | Could be sourced per-university (.edu enrolment-deposit pages) but not with one URL; would need a rewrite, not just a source. |
| `usa-total-cost-breakdown` | Tuition, rent and living-cost figures are the site's own estimates or school-specific; the only figure the official pages confirm is the $350 I-901 SEVIS fee. The $185 MRV fee is on travel.state.gov (403). studentaid.gov was not needed and would not confirm the city figures. | "I-901 SEVIS Fee F or M visa applicants (full payment) $350" (https://www.ice.gov/sevis/i901) | A cost page built on averages needs university .edu cost pages or a College Board source; not a one-URL source job. |
| `usa-routes-hub-guide` | A five-stage summary (F-1, CPT, OPT/STEM OPT, H-1B, green card). Each stage is confirmed by the pages sourced above, but no single official page covers all five, so one official_source URL would be misleading. | none | Could become an internal hub with per-section source links; also see the duplicate finding. |
| `usa-visa-routes-hub-guide` | Byte-identical body_md to usa-routes-hub-guide (verified with diff today). Same multi-stage problem: no single official page covers all five stages. | none | Duplicate page: recommend the owner redirect or merge with usa-routes-hub-guide (follow-up, not changed). |
| `usa-priority-vs-rolling-deadlines` | Deadlines are per-university, and the only external citation on the page (the CGS April 15 Resolution) is cgsnet.org, which is not an official government/university domain in official-domains.json. Nothing official was fetched that confirms the Nov 15 - Dec 15 / Jan 15 - Mar 1 windows. | none | Needs a decision on whether cgsnet.org can be an official source; otherwise source per-university deadline pages. |
| `usa-gre-gmat-waiver-directory` | The directory lists seven universities' waiver policies and priority deadlines; each row would need that university's own .edu page. No single official page confirms the table, and ETS (the GRE owner) is not in the allowlist. | none | Row-by-row .edu verification is a bigger job than a one-URL source. |
| `usa-toefl-ielts-duolingo-cutoffs` | Fees and acceptance percentages are ETS / IELTS / Duolingo claims on commercial test-owner domains, which are not official government/university sources. No .edu or .gov page fetched today confirms the fee table. | none | Test-owner domains are commercial; the page needs university .edu admission pages or a rewrite that drops universal percentages. |
| `us-education-loans-guide` | Every rate in the comparison table belongs to a commercial lender (SBI, Credila, Prodigy, Mpower). The Section 80E rule is an Indian tax rule, but no Income Tax Department page was fetched in this pass and 80E is not the page's main claim. | none | Indian tax/remittance side (incometax.gov.in, rbi.org.in) is the next place to look for the 80E part; lender rates cannot be an official_source here. |

## Pages I did NOT check

Checked = the 21 pages in the two tables above. The remaining 33 published USA guides were left for a later pass:

- `usa-3yr-bachelor-acceptance`
- `usa-assistantship-interview-guide`
- `usa-assistantships-ta-ra-ga`
- `usa-destination-overview`
- `usa-duolingo-det-preparation-guide`
- `usa-fall-vs-spring-intakes`
- `usa-fulbright-interview-prep`
- `usa-fulbright-scholarship-master-guide`
- `usa-fulbright-tata-scholarships`
- `usa-gpa-conversion-matrix`
- `usa-gradcas-commonapp-portals`
- `usa-gre-quant-170-strategy`
- `usa-gre-verbal-awa-prep-guide`
- `usa-health-insurance-waiver-guide`
- `usa-ms-data-science-business-analytics`
- `usa-ms-engineering-management-miso`
- `usa-multiple-offers-decision-matrix`
- `usa-off-campus-housing-lease`
- `usa-prerequisites-deficiency-courses`
- `usa-public-vs-private-unis`
- `usa-rejection-analysis-appeal`
- `usa-scholarship-directory-hub-guide`
- `usa-sop-lor-resume-us-standards`
- `usa-stem-opt-designated-ms-cs`
- `usa-toefl-ielts-preparation-guide`
- `usa-top-us-public-r1-unis`
- `usa-university-listing-hub-guide`
- `usa-wes-credential-evaluation-manual`
- `usa-wes-gpa-40-conversion`
- `usa-work-experience-research-paper-points`
- `collateral-free-loan-approved-universities`
- `prodigy-vs-mpower-vs-sbi-loan-usa`
- `section-80e-tax-deduction-worked-example`

Also deliberately skipped:

- **No body_md on staging (3 loan pages):** `collateral-free-loan-approved-universities`, `prodigy-vs-mpower-vs-sbi-loan-usa`, `section-80e-tax-deduction-worked-example`. These three 'loan' pages have no body_md on staging (summary only). Their money claims are commercial lender rates / illustrative tax math; they need an editorial rewrite plus a decision on Indian tax sources, not just a source tag.
- **Draft guides (out of C2 scope):** `usa-i20-proof-of-funds-calc-spec`, `usa-master-program-listing-guide`, `usa-master-university-profile-guide`, `usa-stem-opt-timeline-calc-spec`, `usa-wes-gpa-calculator-spec`. 5 draft USA guides on staging are out of scope (C2 is published pages only).

## Fetched pages (provenance)

| HTTP | URL | Saved file |
|---|---|---|
| 404 | https://studyinthestates.dhs.gov/students/study/practical-training | /tmp/sa-c2b/pages-html/sist-cpt.html |
| 404 | https://studyinthestates.dhs.gov/students/study/employment | /tmp/sa-c2b/pages-html/sist-employment.html |
| 404 | https://studyinthestates.dhs.gov/students/study/training-opportunities | /tmp/sa-c2b/pages-html/sist-training.html |
| 200 | https://studyinthestates.dhs.gov/stem-opt-hub | /tmp/sa-c2b/pages-html/sist-stemopt.html |
| 404 | https://studyinthestates.dhs.gov/students/maintaining-status/social-security-number | /tmp/sa-c2b/pages-html/sist-ssn.html |
| 404 | https://studyinthestates.dhs.gov/students/prepare/arriving-in-the-united-states | /tmp/sa-c2b/pages-html/sist-arrive.html |
| 200 | https://studyinthestates.dhs.gov/sitemap.xml | /tmp/sa-c2b/pages-html/sist-sitemap.html |
| 200 | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students | /tmp/sa-c2b/pages-html/uscis-opt.html |
| 404 | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students | /tmp/sa-c2b/pages-html/uscis-stemopt.html |
| 200 | https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations | /tmp/sa-c2b/pages-html/uscis-h1b.html |
| 200 | https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2 | /tmp/sa-c2b/pages-html/uscis-eb2.html |
| 200 | https://www.uscis.gov/i-765 | /tmp/sa-c2b/pages-html/uscis-i765.html |
| 200 | https://www.ice.gov/sevis/i901 | /tmp/sa-c2b/pages-html/ice-i901.html |
| 200 | https://www.ice.gov/sevis/students | /tmp/sa-c2b/pages-html/ice-students.html |
| 200 | https://studyinthestates.dhs.gov/guide-to-studying-in-the-states | /tmp/sa-c2b/pages-html/sist-guide.html |
| 200 | https://studyinthestates.dhs.gov/students/maintaining-status | /tmp/sa-c2b/pages-html/sist-maint.html |
| 200 | https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states | /tmp/sa-c2b/pages-html/sist-train.html |
| 200 | https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20 | /tmp/sa-c2b/pages-html/sist-i20.html |
| 200 | https://studyinthestates.dhs.gov/students/prepare/paying-the-i-901-sevis-fee | /tmp/sa-c2b/pages-html/sist-i901.html |
| 200 | https://studyinthestates.dhs.gov/students/travel/applying-for-a-visa-to-travel-to-the-united-states | /tmp/sa-c2b/pages-html/sist-visa.html |
| 200 | https://studyinthestates.dhs.gov/stem-opt-hub/stem-opt-extension-overview | /tmp/sa-c2b/pages-html/sist-stemo.html |
| 200 | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt | /tmp/sa-c2b/pages-html/uscis-stemo.html |
| 200 | https://www.uscis.gov/forms/filing-fees | /tmp/sa-c2b/pages-html/uscis-fees.html |
| 200 | https://studyinthestates.dhs.gov/students/work/working-in-the-united-states | /tmp/sa-c2b/pages-html/sist-work.html |
| 200 | https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number | /tmp/sa-c2b/pages-html/sist-ssnp.html |
| 200 | https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states | /tmp/sa-c2b/pages-html/sist-gtus.html |
| 200 | https://studyinthestates.dhs.gov/students/prepare/financial-ability | /tmp/sa-c2b/pages-html/sist-fin.html |
| 200 | https://studyinthestates.dhs.gov/students/work/applying-for-practical-training | /tmp/sa-c2b/pages-html/sist-apppt.html |
| 200 | https://www.uscis.gov/newsroom/alerts/uscis-announces-fy-2027-inflation-increase-for-certain-immigration-related-fees | /tmp/sa-c2b/pages-html/uscis-feealert.html |
| 200 | https://www.uscis.gov/g-1055 | /tmp/sa-c2b/pages-html/uscis-g1055.html |
| 200 | https://www.federalregister.gov/public-inspection/2026-20187/fiscal-year-2027-inflation-adjustment-to-the-one-big-beautiful-bill-act-immigration-fees | /tmp/sa-c2b/pages-html/fedreg-fees.html |
| 200 | https://www.ice.gov/sevis/employment | /tmp/sa-c2b/pages-html/ice-employment.html |
| 200 | https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors | /tmp/sa-c2b/pages-html/uscis-students.html |

Rows marked 404 are wrong URL guesses from the first discovery round; they were not used for any quote.

(`travel.state.gov` was NOT fetched successfully - it answers 403 to curl, as PR 97 found. No quote in this batch comes from it.)

## Follow-ups (not fixed here, out of scope)

- usa-routes-hub-guide and usa-visa-routes-hub-guide have byte-identical body_md and the same title - duplicate page; owner should redirect/merge.
- Systemic: 20 published USA guides still start with a '## Executive Summary' heading. scripts/lib/sa-inbox.js bans the phrase 'executive summary', so NO body_md proposal can pass for any of them until that heading is renamed. The OPT correction in this batch had to rename it; the other 19 pages will hit the same wall in a future C1/C2 pass.
- Allowlist: no domain needs adding for the 8 verified rows - uscis.gov, ice.gov and studyinthestates.dhs.gov are already listed in data/study-abroad/official-domains.json. The gap pages would only be sourceable with usvisascheduling.com (consulate slots) or cgsnet.org (April 15 resolution); I did NOT use either and do NOT recommend adding them without an owner decision.
- Several visa pages will stay unsourced until travel.state.gov answers; a single successful fetch there unblocks 5 pages.
- The corrections file changes body_md, which is a large diff for a one-number fix - the owner may prefer to edit the fee row by hand; the proposal is there either way.

## Questions for the owner

1. **Correct the OPT fee row?** The only contradiction found is the Form I-765 paper fee ($410 -> $520). It is in a separate corrections file so it can be approved or rejected on its own.
2. **Allowlisting:** no new domain is needed for the 8 verified rows (uscis.gov, ice.gov, studyinthestates.dhs.gov are already in `official-domains.json`). If a later pass wants to source the consulate-slot and deadline pages, `usvisascheduling.com` and `cgsnet.org` would need an owner decision - I did not propose either.
3. **Duplicate page:** `usa-routes-hub-guide` and `usa-visa-routes-hub-guide` have identical body_md and title. Merge or redirect?
4. **Bare source on `us-f1-student-visa-application-checklist`:** staging stores `official_source = https://travel.state.gov` (domain only, no page) and no checked_at. It is not a usable source; leave it until travel.state.gov can be fetched.

## Done

- Read body_md + infobox_json for 21 published USA guides from staging and listed the money/visa/deadline/eligibility claims.
- Fetched the official page for each claim area with curl today (2026-10-30), saved each to /tmp/sa-c2b/pages-html/, quoted from the saved file.
- Wrote `c2b-sources-usa-2026-10-30.json` (8 pages) and `c2b-corrections-usa-2026-10-30.json` (1 page, money only).
- Re-fetched every proposed source in `selfcheck.cjs` and asserted every recorded quote is present (output: `selfcheck.txt`).
- Ran the proposals dry run against staging: sources file "Proposed 16, already waiting 0, unchanged 0, refused 0" and corrections file "Proposed 2, already waiting 0, unchanged 0, refused 0" (full output: `dryrun.txt`).
- Did **not** submit to staging (the Lead commits the file and submits once, to avoid stale pending proposals).
- Did **not** edit `plans/study-abroad-content-spec.md` (C2a owns it) or `official-domains.json`.
