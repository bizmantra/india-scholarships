# Round 5 verification B: independent check of four UK draft pages (2027 entry)

Verifier: independent check against live official pages. Drafts were not edited.
Drafts checked: `scripts/study-abroad/proposals/uk-university-<slug>-2026-11-03.json` (`changes[0].fields.body_md`, `faq_json`).
Date read: 2026-11-03 for every row (gov.uk pages also read 2026-11-03).

Scope: non-fee facts only. Included: deadlines, tuition deposit (CAS deposit), application fee, scholarship amounts, dates and eligibility, accommodation prices and guarantee/application windows, IELTS and English requirements, degree grade requirements, course length and start months, and the living-money rule. Excluded as fee amounts: tuition fee figures, the Student visa application fee (£558) and the Immigration Health Surcharge (£776).

Verdicts: MATCH = page says the same, same entry year. MISMATCH = page says something different (quote given). UNREADABLE = the fact could not be confirmed on the page read (reason given).

Method notes: pages were read from rendered DOM text, including collapsed sections. Where a site redirected or changed tab during reading, the page was reopened and its URL confirmed before the text was used.

---

## 1. University of Manchester (draft: MSc Advanced Computer Science)

Counts: MATCH 20, MISMATCH 0, UNREADABLE 1.

| # | Fact as written in draft | Verdict | What the live page says (quote) | URL | Date read |
|---|---|---|---|---|---|
| 1 | Length: 12 months, full-time | MATCH | "Duration: 12 months full-time" | https://www.manchester.ac.uk/study/masters/courses/list/21573/msc-advanced-computer-science/ | 2026-11-03 |
| 2 | Start: September 2027 | MATCH | "For entry in the academic year beginning September 2027" (also "Year of entry: 2027") | same | 2026-11-03 |
| 3 | IELTS 7.0 overall, no part below 6.5 | MATCH | "IELTS : overall score of 7.0 with no subskill below 6.5." | same | 2026-11-03 |
| 4 | Deposit £2,500 | MATCH | "Self-funded international applicants are required to pay a deposit of £2500" | same | 2026-11-03 |
| 5 | Deposit "taken off your fees on registration" | UNREADABLE | Not stated on the CS page. The page says only "a deposit of £2500 towards their tuition fees before" CAS is issued. The registration wording came from the MGT page in the research notes, not this page. | same | 2026-11-03 |
| 6 | Application fee: none | MATCH | "There is no application fee for this programme." | same | 2026-11-03 |
| 7 | Stage 1: received by 6 Nov 2026, decision 8 Jan 2027 | MATCH | "Stage 1 : Application received by 6 November 2026; Decision by 8 January 2027." | same | 2026-11-03 |
| 8 | Stage 2: received by 1 Jan 2027, decision 5 Mar 2027 | MATCH | "Stage 2 : Application received by 1 January 2027; Decision by 5 March 2027." | same | 2026-11-03 |
| 9 | Stage 3: received by 26 Feb 2027, decision 30 Apr 2027 | MATCH | "Stage 3 : Application received by 26 Feb 2027; Decision by 30 April 2027." | same | 2026-11-03 |
| 10 | Stage 4: received by 21 May 2027, decision 18 Jun 2027 | MATCH | "Stage 4 : Application received by 21 May 2027; Decision by 18 June 2027." | same | 2026-11-03 |
| 11 | Later applications depend on course availability | MATCH | "Applications received after 21 May 2027 will be considered depending on course availability." | same | 2026-11-03 |
| 12 | Deferred entry not accepted | MATCH | "Applications for deferred entry are not accepted for this course." | same | 2026-11-03 |
| 13 | Global Futures Scholarship (India): £12,000, discount on overseas tuition | MATCH | "The value of The Global Futures Scholarships for Indian students is £12,000." (also: "a discount on published overseas tuition fees") | https://www.manchester.ac.uk/study/international/country-specific-information/india/ (the /scholarships/ URL redirects here) | 2026-11-03 |
| 14 | Eligibility: domiciled in India; offer for full-time, on-campus master's starting 2027 | MATCH | "The awards are open to applicants domiciled in India." Global Futures page: "hold an offer from the University for a full-time, on-campus course in Manchester" | https://www.manchester.ac.uk/study/international/finance-and-scholarships/funding/global-futures-scholarship/ | 2026-11-03 |
| 15 | Submit scholarship form by 25 Apr 2027; form sent only after offer | MATCH | "submit an online scholarship application form by 25 April 2027" (India page, master's section). "The form will be available once you've applied and been made an offer." | https://www.manchester.ac.uk/study/international/country-specific-information/india/ | 2026-11-03 |
| 16 | Awards in two rounds: 15 Mar 2027 and 1 Jun 2027 | MATCH | "Fifty per cent of the awards will be offered by 15 March 2027" and "awarded by 1 June 2027" | same | 2026-11-03 |
| 17 | India degree: 65% figure applies only to engineering degrees (BEng, BSc Eng, BTech) | MATCH | "a minimum of 65% or equivalent of a First Class with Distinction" "in a BSc Eng, BEng or BTech degree." | https://www.manchester.ac.uk/study/masters/courses/list/21573/msc-advanced-computer-science/ | 2026-11-03 |
| 18 | Accommodation 2025/26: shared rooms £119/wk (self-catering) to £184/wk (catered), 40–42 week basis | MATCH | "Fees for 2025/26, based on a 40–42 week letting period" ("from £119 per week for a single self-catering room with shared facilities"; "£184 per week for a single room with shared facilities in a catered hall") | https://www.manchester.ac.uk/study/international/accommodation/ | 2026-11-03 |
| 19 | Accommodation guarantee: international postgraduate, alone, apply and accept by 31 Aug (2026-27 rules) | MATCH | "firmly accept an unconditional place at the University by 31 August" ; guarantee "for 2026/2027" | https://www.manchester.ac.uk/study/accommodation/student-accommodation/guarantee/ | 2026-11-03 |
| 20 | Deadlines for 2027-28 accommodation to be updated early 2027 | MATCH | "Deadlines for 27/28 entry will be updated in early 2027." | same | 2026-11-03 |
| 21 | Living money: £1,171/month outside London, up to 9 months; 28 days in a row; within 31 days of applying | MATCH | "£1,171 for each month of your course (up to a maximum of 9 months)"; "enough money for 28 days in a row"; "no more than 31 days before the date you apply" | https://www.gov.uk/guidance/financial-evidence-for-student-and-child-student-route-applicants | 2026-11-03 |

---

## 2. University of Birmingham (draft: MSc Computer Science, with DS and MBA references)

Counts: MATCH 26, MISMATCH 0, UNREADABLE 0.

| # | Fact as written in draft | Verdict | What the live page says (quote) | URL | Date read |
|---|---|---|---|---|---|
| 1 | CS length: 1 year full-time | MATCH | "Duration 1 year full-time" | https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/computer-science-msc?location=India | 2026-11-03 |
| 2 | CS start: September or January | MATCH | "Start date September / January" | same | 2026-11-03 |
| 3 | DS start: September | MATCH | "Start date September" | https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/data-science-msc?location=India | 2026-11-03 |
| 4 | MBA start: September 2027 | MATCH | "Start date September 2027" | https://www.birmingham.ac.uk/study/postgraduate/subjects/business-and-management-courses/mba?location=India | 2026-11-03 |
| 5 | CS IELTS 6.5 overall, no less than 6.0 in any band | MATCH | "IELTS 6.5 with no less than 6.0 in any band" | CS URL above | 2026-11-03 |
| 6 | DS IELTS 6.5 overall, no less than 6.0 in any band | MATCH | "For this course we require IELTS 6.5 with no less than 6.0 in any band" | DS URL above | 2026-11-03 |
| 7 | CS degree: 2:1 honours in a subject other than computing | MATCH | "2:1 Honours Degree in any subject other than computing." | CS URL above | 2026-11-03 |
| 8 | India: UK 2:1 equivalent to 55% to 60% or higher | MATCH | "Holders of Bachelors degree will normally be expected to have achieved 55% - 60% or higher for 2:1 equivalency" | https://www.birmingham.ac.uk/study/international/country/india?securitytoken= (reached from https://birmingham.ac.uk/international/students/country/india/index.aspx) | 2026-11-03 |
| 9 | CS Jan 2027 visa-route deadline: 30 Oct 2026 (passed) | MATCH | "30 October 2026 | Application deadline for international students requiring a visa for January start." | CS URL above | 2026-11-03 |
| 10 | CS Jan 2027 non-visa deadline: 18 Dec 2026 | MATCH | "18 December 2026" "Application deadline for UK and non visa requiring applicants" | CS URL above | 2026-11-03 |
| 11 | CS Sept 2027 non-visa deadline: 27 Aug 2027 | MATCH | "27 August 2027" "Application deadline for UK and non visa requiring applicants." | CS URL above | 2026-11-03 |
| 12 | DS Sept 2027 non-visa deadline: 27 Aug 2027 | MATCH | "27 August 2027" (deadline fact box on the DS page) | DS URL above | 2026-11-03 |
| 13 | MBA Sept 2027 non-visa deadline: 27 Aug 2027 | MATCH | "27 August 2027" (deadline fact box on the MBA page) | MBA URL above | 2026-11-03 |
| 14 | CS Sept 2027 visa-route deadline: draft says "Check the course page" (no date given) | MATCH | Page shows "2 July 2027 | Application deadline for international students requiring a visa." The draft states no date, so nothing conflicts. Intake is not named next to this line on the page. | CS URL above | 2026-11-03 |
| 15 | Alumni Scholarship: £3,000 tuition discount, returning Birmingham undergraduate alumni, 2027 master's | MATCH | "£3,000 tuition fee discounts for our returning undergraduate alumni commencing their Masters in 2027" | DS URL above (#course-fees) | 2026-11-03 |
| 16 | Alumni Scholarship deadline: 31 Jul 2027 | MATCH | "Application deadline: 31 July 2027" | same | 2026-11-03 |
| 17 | Other India awards do not apply to 2027 entry | MATCH | Future Skills Scholarship: "Application deadline: Closed"; Chancellor's: awards for "September 2026"; High Fliers: "starting September 2026", "Application deadline: Closed" | same | 2026-11-03 |
| 18 | Accommodation guarantee: new international postgraduate, apply and book by 31 Jul 2027 | MATCH | "New international postgraduate – apply and book by 31 July 2027*" | https://www.birmingham.ac.uk/study/accommodation/apply-for-your-accommodation/guarantee-scheme | 2026-11-03 |
| 19 | Postgraduate room booking opens early Feb 2027 | MATCH | "*As postgraduate, you'll have the chance to book your room from early February 2027." | same | 2026-11-03 |
| 20 | Shared bathroom 2026/27: £107 to £167 per week (£5,335 to £8,332 a year) | MATCH | Postgraduate accommodation fees 2026/2027: "Maple Bank ... £107.00 £5,335.00" to "£167.00 £8,332.00" | https://www.birmingham.ac.uk/study/accommodation/our-accommodation/accommodation-fees | 2026-11-03 |
| 21 | En-suite 2026/27: £189 to £222 per week (£9,445 to £11,059 a year) | MATCH | "Jarratt Hall (standard) ... £189.00 £9,445.00" to "Bournbrook ... £222.00 £11,059.00" | same | 2026-11-03 |
| 22 | Oak Brook Park 2026/27: £215 to £219 per week | MATCH | "Oak Brook Park Partner Accommodation £215.00 - £219.00 £10,965.00 - £11,169.00" | same | 2026-11-03 |
| 23 | Studios and apartments 2026/27: £250 to £360 per week (£12,750 to £17,966 a year) | MATCH | "Studio The Metalworks Partner Accommodation £250.00 - £279.00 £12,750.00"; "Studio Apartment Plus ... £360.00 £17,966.00" | same | 2026-11-03 |
| 24 | Living money: £1,171 a month outside London, up to 9 months | MATCH | "£1,171 for each month of your course (up to a maximum of 9 months)" | https://www.gov.uk/guidance/financial-evidence-for-student-and-child-student-route-applicants | 2026-11-03 |
| 25 | UK student visa needs English at CEFR B2 for degree-level study | MATCH | "Degree level or above Equivalent to CEFR level B2" | https://www.gov.uk/student-visa/knowledge-of-english | 2026-11-03 |
| 26 | Tuition deposit is required before CAS (draft gives no amount) | MATCH | "International students undertaking a postgraduate taught degree are required to pay a tuition fee deposit before an electronic Confirmation of Acceptance for Studies (CAS) can be issued." | https://www.birmingham.ac.uk/study/international/fees/international-deposits | 2026-11-03 |

---

## 3. University of Nottingham (draft: MSc Advanced Computer Science, with DS and MBA references)

Counts: MATCH 19, MISMATCH 1, UNREADABLE 0.

| # | Fact as written in draft | Verdict | What the live page says (quote) | URL | Date read |
|---|---|---|---|---|---|
| 1 | CS length: 12 months full-time | MATCH | "Full-time: 12 months" | https://www.nottingham.ac.uk/pgstudy/course/taught/computer-science-artificial-intelligence | 2026-11-03 |
| 2 | CS start: September 2027 | MATCH | "Start date: September 2027" | same | 2026-11-03 |
| 3 | DS: 12 months full-time, September 2027 | MATCH | "Full-time: 12 months" / "Start date: September 2027" | https://www.nottingham.ac.uk/pgstudy/course/taught/data-science-msc | 2026-11-03 |
| 4 | MBA: 12 months full-time, September 2027 | MATCH | "Full-time: 12 months" / "Start date: September 2027" | https://www.nottingham.ac.uk/pgstudy/course/taught/business-administration-mba | 2026-11-03 |
| 5 | MSc IELTS 6.5 overall, 6.0 in each part (CS and DS) | MATCH | "IELTS 6.5 with at least 6.0 in each element" | CS URL above; DS URL above | 2026-11-03 |
| 6 | MBA IELTS 7.0 overall, no part below 6.0 | MATCH | "IELTS 7.0 (no less than 6.0 in any element)" | MBA URL above | 2026-11-03 |
| 7 | CS: each course asks for a 2:1; CS needs 2:1 in computing or STEM with substantial computing | MATCH | "2:1 (or international equivalent) in Computer Science" | CS URL above | 2026-11-03 |
| 8 | DS: 2:1 with an affinity for programming and/or statistics | MATCH | "2:1 (or international equivalent) with an affinity for programming and/or advanced statistics" | DS URL above | 2026-11-03 |
| 9 | MBA: 2:1 in any subject | MATCH | "2:1 (or international equivalent) in any discipline" | MBA URL above | 2026-11-03 |
| 10 | Deposit £4,500 as part of visa process; waived only with full sponsorship | MATCH | "you need to pay CAS deposit of £4,500 for start dates from August 2026 onwards"; "We will waive the CAS deposit requirement for students who are fully sponsored" | https://www.nottingham.ac.uk/pgstudy/fees/postgraduate-fees.aspx | 2026-11-03 |
| 11 | Living money: £1,171 a month outside London, up to 9 months (£10,539) | MATCH | "£1,171 for each month of your course (up to a maximum of 9 months)" | https://www.gov.uk/guidance/financial-evidence-for-student-and-child-student-route-applicants | 2026-11-03 |
| 12 | £3,000 scholarship, automatic, 2027 entry, self-funded, no application | MATCH | "we are offering scholarships worth £3,000 to students starting their studies with us in 2027"; "No scholarship application needed." | https://www.nottingham.ac.uk/studywithus/international-applicants/scholarships-funding-finance/international-postgraduate-scholarships.aspx | 2026-11-03 |
| 13 | Two-year master's: scholarship covers only year-one fees; Kaplan pathway students excluded | MATCH | "for a two year master's degree the scholarship only applies to the first year's fees"; Kaplan students "are not eligible for this scholarship scheme" | same | 2026-11-03 |
| 14 | Sept 2027 closing dates not yet published | MATCH | "To be confirmed - Applications for 2027/28 entry" | https://www.nottingham.ac.uk/pgstudy/how-to-apply/apply-online.aspx | 2026-11-03 |
| 15 | Rough guide: apply about six to seven weeks before start for international applicants | MATCH | "the application deadline is usually around six to seven weeks before the start date for international applicants" | https://www.nottingham.ac.uk/pgstudy/how-to-apply/taught.aspx | 2026-11-03 |
| 16 | India Tier 1: first 70%, 2:1 60% | MATCH | Tier 1 universities: "Percentage 70% 60% 55%" (1st, 2:1, 2:2) | https://www.nottingham.ac.uk/studywithus/international-applicants/country-info/countryinformation/india.aspx | 2026-11-03 |
| 17 | India Tier 2: first 75%, 2:1 65% | MATCH | Tier 2 universities: "Percentage 75% 65% 60%" | same | 2026-11-03 |
| 18 | India Tier 3: first 80%, 2:1 70% | MATCH | Tier 3 universities: "Percentage 80% 70% 65%" | same | 2026-11-03 |
| 19 | MBA work experience: "at least three to five years" (also in FAQ) | MISMATCH | The UK / home section says "at least three to five years of post-graduation full-time work experience". The international section says: "requires a minimum of three years post-graduation full-time work experience". The draft applies the 3-to-5 wording to Indian (international) applicants. | https://www.nottingham.ac.uk/pgstudy/course/taught/business-administration-mba | 2026-11-03 |
| 20 | MBA requires an interview | MATCH | "The application process will include an interview." | MBA URL above | 2026-11-03 |

---

## 4. University of Glasgow (draft: MSc Computing Science, with DS and MBA references)

Counts: MATCH 22, MISMATCH 3, UNREADABLE 0.

| # | Fact as written in draft | Verdict | What the live page says (quote) | URL | Date read |
|---|---|---|---|---|---|
| 1 | CS length: 12 months full-time | MATCH | "MSc: 12 months full-time" | https://www.gla.ac.uk/postgraduate/taught/computingscience/ | 2026-11-03 |
| 2 | CS start: September | MATCH | "Teaching start: September" | same | 2026-11-03 |
| 3 | Tuition deposit £2,000 for international and EU applicants | MATCH | "required to pay a deposit of £2000 to secure a place on this programme" | same | 2026-11-03 |
| 4 | IELTS: 6.5 overall, 6.5 in Writing and no other part below 6.0 (stated as the only route) | MISMATCH | The page gives two routes: "6.5 overall with Writing at 6.5 no other subtest less than 6.0; OR 6.5 overall with Writing at 6.0 and no other subtest less than 6.5" | same | 2026-11-03 |
| 5 | "Writing score is 6.0. The course asks for 6.5 in Writing." (think-carefully bullet) | MISMATCH | "OR 6.5 overall with Writing at 6.0 and no other subtest less than 6.5" (Writing 6.0 is acceptable if every other part is 6.5) | same | 2026-11-03 |
| 6 | Degree: "2.1 Honours degree or a non-UK equivalent" | MISMATCH | "2.1 Hons (or non-UK equivalent) in any degree with Computing as a major subject" | same | 2026-11-03 |
| 7 | CS application rounds for Sept 2027: R1 1 Oct to 5 Nov 2026 through R6 14 May to 8 Jul 2027 (last round closes 8 Jul 2027) | MATCH | "Round 1: 1 October 2026 to 5 November 2026"; "Round 6: 14 May 2027 to 8 July 2027" | same | 2026-11-03 |
| 8 | MBA closes 31 Jul 2027 for all applicants | MATCH | "All applicants 31 July 2027" | https://www.gla.ac.uk/postgraduate/taught/businessadministration/ | 2026-11-03 |
| 9 | World Changers India Excellence Award: £12,500 tuition fee waiver for one year | MATCH | "The scholarship is awarded as a tuition fee waiver of £12,500 for one year only." | https://www.gla.ac.uk/scholarships/worldchangersindiaexcellenceaward/ | 2026-11-03 |
| 10 | India Excellence: up to 12 awards for students from India | MATCH | "up to 12 scholarships for International students from India" (scholarship listing on the CS page; the award page itself does not repeat "12") | https://www.gla.ac.uk/postgraduate/taught/computingscience/ | 2026-11-03 |
| 11 | India Excellence: UK first-class equivalent, typically 85% and above | MATCH | "grades equivalent to a UK 1st Class Honours (typically 85% and above)" | https://www.gla.ac.uk/scholarships/worldchangersindiaexcellenceaward/ | 2026-11-03 |
| 12 | India Excellence: offer for Sept 2027, international fee status, domiciled in India | MATCH | "Have International fee status Be domiciled in India and hold a passport" ; "an offer of a place ... for September 2027 intake" | same | 2026-11-03 |
| 13 | India Excellence deadline 31 Mar 2027 11:45 UK time; outcome by 14 Apr 2027 | MATCH | "The application deadline for this scholarship is 31st March 2027 at 11:45AM UK Time." "Applicants will be advised of the outcome by 14th April 2027." | same | 2026-11-03 |
| 14 | India Excellence: page says applications "will open shortly" | MATCH | "This scholarship will open shortly, please register your interest" | same | 2026-11-03 |
| 15 | World Changers Glasgow: £5,000 tuition discount, applied automatically | MATCH | "awarded as a £5,000 tuition fee discount and will automatically awarded to all eligible applicants" | https://www.gla.ac.uk/scholarships/worldchangersglasgowscholarship/ | 2026-11-03 |
| 16 | World Changers Glasgow: India eligible; offer for Sept 2027 or Jan 2028; international fee status | MATCH | "be enrolled on an eligible postgraduate programme for September 2027 or January 2028 intake"; "have international fee status"; India listed under eligible countries | same | 2026-11-03 |
| 17 | World Changers Glasgow cannot be combined with another University scholarship | MATCH | "This discount cannot be combined with another University scholarship." | same | 2026-11-03 |
| 18 | India Excellence: Glasgow discounts cannot be combined with one another (except Alumni) | MATCH | "UofG discounts and scholarships cannot be combined with one another or any external sponsorship discounts (with the exception of Alumni Discount)." | https://www.gla.ac.uk/scholarships/worldchangersindiaexcellenceaward/ | 2026-11-03 |
| 19 | Accommodation 2026-27: Student Apartments twin shared from £141.47/wk | MATCH | "Twin (Shared) £5,517.33 £141.47" (period 11/9/2026 to 11/6/2027) | https://www.gla.ac.uk/postgraduate/accommodation/fees/ | 2026-11-03 |
| 20 | Accommodation 2026-27: Kelvingrove House studio up to £258.72/wk | MATCH | "Studio £13,194.72 £258.72" (Kelvingrove House; period 11/9/2026 to 3/9/2027) | same | 2026-11-03 |
| 21 | Postgraduate guarantee stated for September 2026 entry only; ask for 2027 | MATCH | "You are a Postgraduate Taught offer holder ... for September 2026 entry" ; "received by 14 July 2026" | https://www.gla.ac.uk/postgraduate/accommodation/admissionspolicy/postgraduateadmissionspolicy/ | 2026-11-03 |
| 22 | Living money: £1,171 a month outside London, up to 9 months, held 28 days | MATCH | "£1,171 for each month of your course (up to a maximum of 9 months)" | https://www.gov.uk/guidance/financial-evidence-for-student-and-child-student-route-applicants | 2026-11-03 |
| 23 | MBA: 12 months full-time, September | MATCH | "MBA: 12 months full-time" ; "Teaching start: September" | https://www.gla.ac.uk/postgraduate/taught/businessadministration/ | 2026-11-03 |
| 24 | MBA IELTS 6.5 overall, no part below 6.0 | MATCH | "6.5 overall with no subtest less than 6.0" | same | 2026-11-03 |
| 25 | Related DS & AI MSc: same international rounds and same IELTS rule as CS | MATCH | DS page: "Round 6: 14 May 2027 to 8 July 2027"; IELTS: "6.5 overall with Writing at 6.5 ... OR 6.5 overall with Writing at 6.0" (same two routes as CS) | https://www.gla.ac.uk/postgraduate/taught/data-science-artificial-intelligence/ | 2026-11-03 |

---

## Summary

| University | MATCH | MISMATCH | UNREADABLE |
|---|---|---|---|
| Manchester | 20 | 0 | 1 |
| Birmingham | 26 | 0 | 0 |
| Nottingham | 19 | 1 | 0 |
| Glasgow | 22 | 3 | 0 |

MISMATCHes:
- Nottingham, row 19: MBA work experience. The draft says three to five years. The international section says "a minimum of three years".
- Glasgow, row 4: IELTS. The draft gives one route. The page also allows Writing 6.0 with every other part at 6.5.
- Glasgow, row 5: the draft says Writing 6.0 is not enough. The page allows Writing 6.0 if the other parts are 6.5.
- Glasgow, row 6: degree. The page requires the 2.1 to be in a degree with Computing as a major subject. The draft does not say this.

UNREADABLE:
- Manchester, row 5: "deposit taken off your fees on registration". This is not on the CS page. The quote came from the MGT page.
