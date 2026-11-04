# Verification C: non-fee facts in the four 2026-11-03 drafts

Independent check of the drafts in `scripts/study-abroad/proposals/uk-university-<slug>-2026-11-03.json` (body_md and faq_json). Drafts were not changed.

- Date read for every row: 2026-11-03.
- Scope: application deadlines and open dates, tuition deposits, application fees, scholarship amounts, dates and eligibility, accommodation prices and windows, IELTS requirements, India degree grade claims, course lengths and start months. Tuition, visa money, visa fee, Immigration Health Surcharge, placement fees and extension fees are fee or visa-cost facts and are left out.
- Sources: official ac.uk and gov.uk pages only. Text was read with `document.body.textContent` after opening each select or tab, so hidden accordion content was included.
- Verdicts: MATCH = page says the same, same entry year. MISMATCH = page says something different (quote given). UNREADABLE = could not be checked from an allowed source, reason given.
- Tab note: the shared browser tab kept switching to other universities' pages during the run. Every reading was taken from a fresh tab, with the URL confirmed before reading.

---

## 1. Newcastle University

| Fact as written (draft) | Verdict | What the live page says | URL | Date read |
|---|---|---|---|---|
| MSc Computer Science, MSc Data Science and MBA are 12 months, full time | MATCH | CS: "Full time: 12 months". DS: "Full time: 12 months". MBA: "Full time: 12 months". | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ ; .../5543f/ ; .../5823f/ | 2026-11-03 |
| Start September 2027 (all three courses) | MATCH | Each course page: "Next start date September 2027". | same three URLs | 2026-11-03 |
| No application closing date (all three courses) | MATCH | "There is no application closing date for this course." | same three URLs | 2026-11-03 |
| Tuition deposit £3,000 or sponsorship letter by 27 August 2027 for students from India | MATCH | "All International students (excluding those from the markets above)... deposit of £3,000 or submit an official letter of sponsorship by 27th August 2027." India is not in the listed higher-deposit markets. | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ (Deposit section) | 2026-11-03 |
| ATAS deposit date 13 August 2027 | MATCH | "If your programme requires ATAS you are required to pay a deposit of £3,000 or submit an official letter of sponsorship by 13th August 2027." | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ | 2026-11-03 |
| India Future Leaders Scholarship: £10,000 tuition award, automatic, no separate application | MATCH | "Newcastle University India Future Leaders... Award amount: £10,000 tuition fee awards... Eligible candidates will automatically be awarded". | https://www.ncl.ac.uk/study/global-scholarships/ | 2026-11-03 |
| India Future Leaders eligibility: domiciled in India, offer for 2027/28, deposit paid in full by 2 August 2027, assessed as international for fees | MATCH | "be domiciled in India... have been offered a place... for the 2027/28 academic year... paid the tuition fee deposit... in full by 2nd August 2027... be assessed as international for fee purposes". | https://www.ncl.ac.uk/postgraduate/fees-funding/search-funding/?code=nuifls27 | 2026-11-03 |
| Vice-Chancellor's International award: £8,000, automatic, accept offer and pay deposit in full by 2 August 2027 | MATCH | "Vice-Chancellor's International Scholarships Award amount: £8,000... Automatically considered... pay their tuition fee deposit in full by 2 August 2027." | https://www.ncl.ac.uk/study/global-scholarships/ | 2026-11-03 |
| Vice-Chancellor's Excellence scholarship: up to 50% off tuition, apply by 8 June 2027 | MATCH | Postgraduate section: "Award amount: Up to 50% off tuition fees... Scholarship deadline: 8 June 2027." (The 2 April 2027 date is the undergraduate listing.) | https://www.ncl.ac.uk/study/global-scholarships/ | 2026-11-03 |
| MSc Computer Science: may be eligible for a scholarship worth 25% off the international fee | MATCH | "You may be eligible for a scholarship worth 25% off the international fee." | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ | 2026-11-03 |
| MBA applicants are considered for MBA scholarships at interview | MATCH | "All selected applicants will be interviewed... you will also be considered for our MBA scholarships." | https://www.ncl.ac.uk/postgraduate/degrees/5823f/ | 2026-11-03 |
| General IELTS rule: overall 6.5, at least 5.5 in each part | MATCH | "Our typical IELTS scores are: IELTS... overall score of 6.5 with at least IELTS 5.5 in each sub-skill." Note: the MBA course page asks for a minimum of 6.0 in each sub-skill, so the course page should be checked for MBA. | https://www.ncl.ac.uk/international/language/ | 2026-11-03 |
| MSc Computer Science: 2:2 honours or equivalent, in any subject except those related to computer science | MATCH | "A 2:2 honours degree, or equivalent, in any subject except those related to computer science." | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ | 2026-11-03 |
| MSc Data Science: 2:2 plus GCSE Mathematics grade 6 or equivalent | MATCH | "A 2:2 honours degree, or international equivalent. GCSE Mathematics grade 6 in Mathematics (or equivalent)". | https://www.ncl.ac.uk/postgraduate/degrees/5543f/ | 2026-11-03 |
| MBA: 2:1 honours plus at least three years of managerial work experience | MATCH | "A 2:1 honours degree, or international equivalent. An equivalent of three years (minimum) significant, full-time, post-graduation work experience... managerial responsibilities". | https://www.ncl.ac.uk/postgraduate/degrees/5823f/ | 2026-11-03 |
| Indian degree grade table: 2:1 = 60% or CGPA 6.0; 2:2 = 58% or CGPA 5.8 | MISMATCH | The table is split by section. 2:1: "Section 1 - 60% or CGPA 6.0/10; Section 2 - 62% or CGPA 6.2/10; Section 3- 65% or CGPA 6.5/10". 2:2: "Section 1 - 58%... Section 2 - 60%... Section 3- 63%". The draft gives only Section 1 and does not say so. | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ (select country = India, Entry requirements tab) | 2026-11-03 |
| Apply at least two months before the course starts (international students) | MATCH | "We suggest international students apply at least two months before the course starts." | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ | 2026-11-03 |
| Accommodation: postgraduate taught students guaranteed a place if they apply by the accommodation deadline | UNREADABLE | The page gives the deadline as "30 June 2026" and "guarantee deadline" for the 2026 cycle. No 2027 window is published, so the 2027 deadline cannot be checked. | https://www.ncl.ac.uk/accommodation/applying-for-accommodation/applying-for-postgraduate-accommodation/ | 2026-11-03 |

Counts: MATCH 16. MISMATCH 1. UNREADABLE 1. (Total 18 rows; rows that cover all three courses are merged into one row.)

---

## 2. UCL

| Fact as written (draft) | Verdict | What the live page says | URL | Date read |
|---|---|---|---|---|
| MSc Computer Science: 1 calendar year, full time | MATCH | "Duration 1 calendar year". | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/computer-science-msc | 2026-11-03 |
| MSc Data Science and MSc Management: 1 calendar year; MBA: 16 months | MATCH | DS: "Duration 1 calendar year". Management: "Duration 1 calendar year". MBA: "Duration 16 months". | .../courses/data-science-msc ; .../courses/management-msc ; .../courses/business-administration-mba | 2026-11-03 |
| Course starts September 2027 (all four) | MATCH | CS: "Course starts: September 2027". Management: "Course starts: September 2027". MBA: "Course starts: September 2027". DS: "September 2027" in course header. | the four course URLs | 2026-11-03 |
| Applications open 19 October 2026 (all four courses) | MATCH | "19 Oct 2026 - 22 Mar 2027" (CS, DS, MBA) and "19 Oct 2026 - 25 Jun 2027" (Management). | the four course URLs | 2026-11-03 |
| Visa applicants close 22 March 2027, 5pm UK time (CS, DS, MBA) | MATCH | CS: "Applicants who require a visa 19 Oct 2026 - 22 Mar 2027 Applications close at 5pm UK time". DS and MBA: same wording. | .../computer-science-msc ; .../data-science-msc ; .../business-administration-mba | 2026-11-03 |
| MSc Computer Science, no-visa deadline 27 August 2027, 5pm UK time | MISMATCH | "Applicants who do not require a visa 19 Oct 2026 - 27 Aug 2027 Applications close at 10am UK time." | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/computer-science-msc | 2026-11-03 |
| No-visa deadline 27 August 2027, 5pm UK time (DS, Management, MBA) | MATCH | DS: "Applications close at 5pm UK time". Management: "Applications close at 5pm UK time". MBA: "Applications close at 5pm UK time". | .../data-science-msc ; .../management-msc ; .../business-administration-mba | 2026-11-03 |
| MSc Management visa deadline 25 June 2027 (draft table) | MATCH | "Applicants who require a visa 19 Oct 2026 - 25 Jun 2027 Applications close at 5pm UK time." | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/management-msc | 2026-11-03 |
| Application fee £90 for online applications | MATCH | "There is an application processing fee for this course of £90 for online applications." | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/computer-science-msc | 2026-11-03 |
| Fee deposit: 10% of the first-year fee for overseas offer holders | MATCH | "For full-time and part-time offer holders with a fee status classification of Overseas, a fee deposit will be charged at 10% of the first year fee." | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/computer-science-msc | 2026-11-03 |
| MSc Computer Science IELTS: 7.0 overall, at least 6.5 in each part (Level 2) | MATCH | Course page: "The English language level for this programme is: Level 2". English requirements page: "Level 2: Overall score of 7.0 and a minimum of 6.5 in each component." | .../computer-science-msc ; https://www.ucl.ac.uk/study/prospective-students/graduate/how-apply/english-language-requirements | 2026-11-03 |
| MSc Data Science IELTS: 6.5 overall, at least 6.0 in each part (Level 1) | MATCH | Course page: "Level 1". English requirements page: "Level 1: Overall score of 6.5 and a minimum of 6.0 in each component." | .../data-science-msc ; English requirements page | 2026-11-03 |
| MSc Management IELTS: 7.0 overall, at least 6.5 in each part (Level 2) | MATCH | Course page: "Level 2". English requirements page: Level 2 = 7.0 with minimum 6.5. | .../management-msc ; English requirements page | 2026-11-03 |
| MBA IELTS: 6.5 overall, at least 6.0 in each part | MATCH | Course page: "Level 1". English requirements page: "Level 1: Overall score of 6.5 and a minimum of 6.0 in each component." | .../business-administration-mba ; English requirements page | 2026-11-03 |
| MSc Computer Science: upper second-class (2:1) UK Bachelor's or equivalent | MATCH | "A minimum of an upper second-class UK Bachelor's degree... in a subject other than computer science or information technology." The draft omits the "other than computer science" limit. | .../computer-science-msc | 2026-11-03 |
| MSc Data Science: upper second-class Bachelor's in a quantitative discipline | MATCH | "A minimum of an upper second-class Bachelor's degree in a quantitative discipline from a UK university..." | .../data-science-msc | 2026-11-03 |
| MSc Management: upper second-class (2:1) UK Bachelor's or overseas equivalent | MATCH | "A minimum of an upper second-class Bachelor's degree from a UK university... in any subject." | .../management-msc | 2026-11-03 |
| MBA: lower second-class degree in a relevant discipline, plus 3 years full-time work experience, plus GMAT or GRE | MATCH | "A minimum of a lower second-class Bachelor's degree in a relevant discipline... three years of full-time working experience... A GMAT or GRE". | .../business-administration-mba | 2026-11-03 |
| India 2:1 equivalent: CGPA 7.5/10, 6.0/8.0, 5.5/7.0, 4.0/6.0, 3.0/4.0 or 60%, depends on institution ranking | MATCH | "A Bachelor's degree with a minimum overall CGPA of 7.5/10, 6.0/8.0, 5.5/7.0, 4.0/6.0, 3.0/4.0 or 60%... dependent on the ranking of the institution". | https://www.ucl.ac.uk/study/international/region/south-asia/india | 2026-11-03 |
| Chevening: full tuition and living allowance for UCL Computer Science Master's; 2027/28 closed; next window August to October 2027 | MATCH | "Value: Full tuition and living allowance... Applications for the 2027/28 cohort are now closed. The next application window will be August - October 2027." | https://www.ucl.ac.uk/engineering/computer-science/study/scholarships/postgraduate-taught-scholarships | 2026-11-03 |
| UCL Global Master's: £15,000, for international students from low-income backgrounds, all PGT courses, closed for 2026 | MATCH | "Value: £15,000. Eligible courses: All postgraduate taught courses. Key dates: Applications are closed for 2026." | same scholarships URL | 2026-11-03 |
| Accommodation: first-year full-time international postgraduates prioritised if they apply before the deadline (priority, not guaranteed) | MATCH | "Postgraduate students are prioritised for an offer of accommodation if... first year... full-time, international". Apply "no later than 30 June in your year of study". The draft does not state the 30 June date. | https://www.ucl.ac.uk/study/accommodation/how-apply-accommodation/how-apply-postgraduates | 2026-11-03 |

Counts: MATCH 21. MISMATCH 1. UNREADABLE 0. (Total 22 rows.)

---

## 3. University of Warwick

| Fact as written (draft) | Verdict | What the live page says | URL | Date read |
|---|---|---|---|---|
| MSc Computer Science: 1 year, full time | MATCH | "Duration 1 year full-time". | https://warwick.ac.uk/study/postgraduate/courses/msc-computer-science/ | 2026-11-03 |
| MSc Statistics with Data Science and MSc Management: 1 year, full time | MATCH | Stats: "Duration 1 year full-time". Management: "Duration 1 year full-time". | https://warwick.ac.uk/study/postgraduate/courses/msc-statistics-data-science/ ; .../msc-management/ | 2026-11-03 |
| Full-time MBA: 12 or 16 months | MATCH | "Duration 12-month or 16-month options". | https://warwick.ac.uk/study/postgraduate/courses/mba-full-time-mba/ | 2026-11-03 |
| Start 27 September 2027 (all four courses) | MATCH | CS, Stats, MBA and Management each show "Start date 27 September 2027". | the four course URLs | 2026-11-03 |
| On-time application deadline 2 August 2027 (all four) | MATCH | "The on-time deadline for taught postgraduate courses starting in September/October 2027 is 2 August 2027." | https://warwick.ac.uk/study/postgraduate/apply/ | 2026-11-03 |
| Late applications still accepted, but Warwick cannot promise a decision in time | MATCH | "We will still accept late applications, however cannot guarantee that the application will be processed in time..." | https://warwick.ac.uk/study/postgraduate/apply/ | 2026-11-03 |
| MSc Computer Science IELTS: 6.5 overall, no part below 6.0 | MATCH | "Band A IELTS overall score of 6.5, minimum component scores not below 6.0." | https://warwick.ac.uk/study/postgraduate/courses/msc-computer-science/ | 2026-11-03 |
| MSc Statistics with Data Science IELTS: 6.5 overall, no part below 6.0 | MATCH | "Band A IELTS overall score of 6.5, minimum component scores not below 6.0." | https://warwick.ac.uk/study/postgraduate/courses/msc-statistics-data-science/ | 2026-11-03 |
| Full-time MBA IELTS: 7.0 overall, at least 6.0 in each of the four parts | MATCH | "Band B IELTS overall score of 7.0. All four languages elements have to be scored 6.0+." | https://warwick.ac.uk/study/postgraduate/courses/mba-full-time-mba/ | 2026-11-03 |
| MSc Management IELTS: 7.0 overall | MATCH | "Band B IELTS overall score of 7.0, minimum component scores of two at 6.0/6.5 and the rest at 7.0 or above." The draft omits the component rule. | https://warwick.ac.uk/study/postgraduate/courses/msc-management/ | 2026-11-03 |
| MSc Computer Science: First Class or high 2:1 in CS, Maths, Statistics, Physics or a related quantitative degree | MATCH | "First Class Honours degree or a high 2:1... The degree must be in Computer Science, Mathematics, Statistics, Physics, or another relevant quantitatively focused degree." | https://warwick.ac.uk/study/postgraduate/courses/msc-computer-science/ | 2026-11-03 |
| MSc Statistics with Data Science: 2:1 in Statistics, Maths or a science with high mathematical content | MATCH | "2:1 undergraduate degree (or equivalent) in Statistics, Mathematics or a science with sufficiently high mathematical content." | https://warwick.ac.uk/study/postgraduate/courses/msc-statistics-data-science/ | 2026-11-03 |
| Full-time MBA: at least three years post-graduate business experience; 2:2 preferred but not essential | MATCH | "You must have at least three years' post-graduate professional business experience. A 2:2... is preferred but not essential." | https://warwick.ac.uk/study/postgraduate/courses/mba-full-time-mba/ | 2026-11-03 |
| Indian students: the minimum score depends on your institution | MATCH | "we would require a minimum score depending on your institution." | https://warwick.ac.uk/study/international/countryinformation/southasia/india/india-entry-requirements/ | 2026-11-03 |
| Student visa: apply up to 6 months before the course starts | MATCH | Applying from outside the UK: "The earliest you can apply for a visa is 6 months before you start your course." (gov.uk, not a Warwick page) | https://www.gov.uk/student-visa | 2026-11-03 |
| Visa decisions take 3 to 6 weeks when applying from outside the UK | MISMATCH | gov.uk: "You'll usually get a decision on your visa within: 3 weeks, if you're outside the UK". The 6-week upper figure comes from UKCISA, which is not an allowed source, so it was not checked. | https://www.gov.uk/student-visa | 2026-11-03 |

Counts: MATCH 15. MISMATCH 1. UNREADABLE 0. (Total 16.)

Not checked (no figures stated in the draft): Warwick scholarships and accommodation pages. The draft names them as places to check and gives no amounts or dates from them.

---

## 4. Coventry University

| Fact as written (draft) | Verdict | What the live page says | URL | Date read |
|---|---|---|---|---|
| MSc Computer Science: 1 year full time (up to 2 years with a professional placement) | MATCH | "Duration 1 year full-time. Up to 2 years full-time with professional placement." | https://www.coventry.ac.uk/course-structure/pg/ees/computer-science-msc/?term=2027-28 | 2026-11-03 |
| MSc Data Science and Computational Intelligence and MBA: 1 year full time | MATCH | DS and CI: "Duration 1 year full-time". MBA: "Duration 1 year full-time". | .../data-science-and-computational-intelligence-msc/?term=2027-28 ; .../masters-in-business-administration/?term=2027-28 | 2026-11-03 |
| Start months: September 2027, November 2027, January 2028, March 2028, May 2028, July 2028 | MATCH | CS page: "Start date September 2027 November 2027 January 2028 March 2028 May 2028 July 2028". | https://www.coventry.ac.uk/course-structure/pg/ees/computer-science-msc/?term=2027-28 | 2026-11-03 |
| IELTS 6.5 overall, no component below 5.5 (all three courses) | MATCH | CS: "IELTS: 6.5 overall, with no component lower than 5.5". DS and CI: "IELTS: 6.5 overall (with at least 5.5 in each component area)". MBA: "IELTS: 6.5 overall with no component lower than 5.5". | the three 2027-28 course URLs | 2026-11-03 |
| MSc Computer Science: 2:2 or above (or international equivalent) in a computational discipline | MATCH | "An honours degree 2:2 or above (or international equivalent) in a computational discipline." | .../computer-science-msc/?term=2027-28 | 2026-11-03 |
| MBA: 2:2 or above in any discipline, plus at least three years relevant work experience | MATCH | "An honours degree 2:2 or above... in any discipline and at least three years' relevant post-graduation work experience." | .../masters-in-business-administration/?term=2027-28 | 2026-11-03 |
| Coventry University Group Scholarship: £2,000 a year off tuition | MATCH | "Value £2,000 scholarship per year of study." | https://www.coventry.ac.uk/international-students-hub/apply-for-a-scholarship/coventry-university-group-scholarship/ | 2026-11-03 |
| Group Scholarship eligibility: self-funded, not from the EU, full-time taught degrees, 2026/27 or 2027/28 entry, no application needed, online courses excluded | MATCH | "The scholarship/discount is only available to self-funded students... full-time... 2026/27 or 2027/28... There is no application process." "100% online (Coventry University Online) and NITE courses are excluded." | same Group Scholarship URL | 2026-11-03 |
| Alumni discount: 25% off postgraduate courses for Coventry graduates | MATCH | "Coventry University alumni... can now receive a 25% discount on our postgraduate courses." | https://www.coventry.ac.uk/international-students-hub/apply-for-a-scholarship/ | 2026-11-03 |
| Alumni discount applies for 2026-27 and 2027-28 entry | MISMATCH | "Alumni Discount: Available for all start dates across 2026-27." The phrase "2026/27 or 2027-28" on the same page belongs to the EU Support Bursary, not the alumni discount. | https://www.coventry.ac.uk/international-students-hub/apply-for-a-scholarship/ | 2026-11-03 |
| Indian degrees: 60% for a three-year undergraduate degree, 55% for a four-year degree (postgraduate) | MATCH | "Postgraduate Students must achieve 60% in a three year undergraduate degree or 55% in a four year undergraduate degree." | https://www.coventry.ac.uk/international-students-hub/entry-requirements/ | 2026-11-03 |
| 55% accepted for a three-year degree from named Indian universities | MATCH | "students from the following universities will be considered with 55% in a three year undergraduate degree... Delhi, Mumbai, Kolkata, Chennai (Madras)..." | same entry requirements URL | 2026-11-03 |
| January 2027 intake: final application deadline 1 December 2026; conditions 4 December 2026; enrolment 1 February 2027 | MATCH | "January 2027 Tuesday 1 December 2026 Friday 4 December 2026 Monday 1 February 2027." | https://www.coventry.ac.uk/international-students-hub/apply/ | 2026-11-03 |
| The international deadline table has no September 2027 intake | MATCH | Table rows: November 2026, January 2027, March 2027, May 2027, July 2027. No September 2027 row. | https://www.coventry.ac.uk/international-students-hub/apply/ | 2026-11-03 |
| Tuition deposit: students from Punjab, Uttarakhand and Haryana must pay full first-year tuition | MATCH | "Pakistan, Bangladesh, India (Punjab, Uttarakhand, Haryana) - Full tuition fees charged for the first year of your course." The page also lists "All other countries (including Nigeria, Ghana and Kenya) - £8,000.00", which the draft does not mention. | https://www.coventry.ac.uk/international-students-hub/apply/ | 2026-11-03 |
| Tuition deposit is required before the CAS is released | MATCH | "This payment is required to release the Confirmation of Acceptance of Studies (CAS) letter." | https://www.coventry.ac.uk/international-students-hub/apply/ | 2026-11-03 |
| Student visa: apply up to 6 months before the course starts | MATCH | "The earliest you can apply for a visa is 6 months before you start your course." | https://www.gov.uk/student-visa | 2026-11-03 |
| Visa decision usually 3 weeks from outside the UK (gov.uk) | MATCH | "3 weeks, if you're outside the UK." | https://www.gov.uk/student-visa | 2026-11-03 |
| Visa decision takes 3 to 6 weeks (UKCISA) | UNREADABLE | The 3 to 6 week figure is from UKCISA, which is not an allowed source (official ac.uk and gov.uk pages only). Not checked. | n/a (UKCISA not opened) | 2026-11-03 |
| Accommodation: deluxe studio at Bishop Gate / Godiva Place £232 a week, £11,600 for the year (2026-27 rates, 50 weeks) | MATCH | "Deluxe studio £232 50 weeks £11,600" under "2026/27 accommodation fees". The page has no 2027/28 rates, so the draft's 2026-27 label is correct. | https://www.coventry.ac.uk/life-on-campus/accommodation/applying/accommodation-fees/ | 2026-11-03 |

Counts: MATCH 18. MISMATCH 1. UNREADABLE 1. (Total 20.)

---

## Summary

| University | MATCH | MISMATCH | UNREADABLE |
|---|---|---|---|
| Newcastle University | 16 | 1 | 1 |
| UCL | 21 | 1 | 0 |
| University of Warwick | 15 | 1 | 0 |
| Coventry University | 18 | 1 | 1 |

## MISMATCH list

1. Newcastle: Indian grade table. The draft gives one figure per grade (2:1 = 60% / 6.0; 2:2 = 58% / 5.8). The live page splits the table into three sections, for example 2:1 "Section 2 - 62% or CGPA 6.2/10".
2. UCL, MSc Computer Science: no-visa deadline closes "at 10am UK time". The draft says 5pm UK time.
3. Warwick: visa decisions. The draft says "3 to 6 weeks"; gov.uk says "3 weeks, if you're outside the UK".
4. Coventry: alumni discount. The draft says "for 2026-27 and 2027-28 entry"; the page says "Available for all start dates across 2026-27".

## Notes for the editor (not verdicts)

- Newcastle MBA course page asks for IELTS 6.0 in each sub-skill, not 5.5. The draft's general-rule wording is accurate, but the MBA row should say 6.0 if it is ever stated.
- UCL MSc Computer Science omits "other than computer science or IT" from its degree rule.
- Coventry Indian postgraduate deposit: the draft omits the £8,000 "all other countries" rate. Fee amounts are outside this brief.
- Accommodation windows for 2027 entry were not published on any page checked (Newcastle: 2026 guarantee deadline of 30 June 2026 is shown; UCL: 30 June each year; Coventry: 2026-27 rates only).
