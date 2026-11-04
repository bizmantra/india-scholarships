# Verification D: Newcastle University MBA (5823F)

Draft checked: `scholarship-app/scripts/study-abroad/proposals/uk-course-newcastle-university-mba-2026-11-03.json` (changes[0].fields). The draft was not changed.

Method: each fact was checked against the live official page in the built-in browser. The Entry requirements tab was opened with country set to India, and the English block was set to IELTS. Text was read from the DOM (raw innerText and textContent). Date read for every row: 2026-11-03.

Pages used:
- MBA page: https://www.ncl.ac.uk/postgraduate/degrees/5823f/ (also the cited "official_source")
- VCES page: https://www.ncl.ac.uk/postgraduate/fees-funding/search-funding/?code=vces27

| Fact as written in the draft | Verdict | What the live page says (quote) | URL | Date read |
|---|---|---|---|---|
| Tuition £34,400 (tuition_per_year 34400); body: "£34,400 for the full 12-month programme" | MATCH | "Fees (per year) FT Home:£34,400 FT International:£34,400". Page labels it per year. Course is 12 months, so per year equals the whole programme. | MBA page | 2026-11-03 |
| Length 12 months | MATCH | "Study mode and duration Full time: 12 months" | MBA page | 2026-11-03 |
| Start month September 2027 | MATCH | "Next start date September 2027" and "The course starts in September." | MBA page | 2026-11-03 |
| Entry: 2:1 honours or international equivalent | MATCH | "A 2:1 honours degree, or international equivalent." | MBA page | 2026-11-03 |
| Work experience: 3 years minimum, managerial responsibility | MATCH | "An equivalent of three years (minimum) significant, full-time, post-graduation work experience." | MBA page | 2026-11-03 |
| Exceptional applicants without degree: more than 5 years | MATCH | "if you have more than five years of significant, full-time, post-graduation work experience" | MBA page | 2026-11-03 |
| GMAT not needed (faq and body) | MATCH | "You do not need to take the GMAT to study our MBA." | MBA page | 2026-11-03 |
| Interview: all selected applicants interviewed | MATCH | "All selected applicants will be interviewed for the course." | MBA page | 2026-11-03 |
| English: IELTS 6.5 overall | MATCH | "Direct Entry: IELTS 6.5 overall (with a minimum of 6.0 in all sub-skills)." | MBA page | 2026-11-03 |
| English: at least 6.0 in each sub-skill | MATCH | "(with a minimum of 6.0 in all sub-skills)" | MBA page | 2026-11-03 |
| Body: general university rule is 5.5 in each sub-skill | UNREADABLE | Not stated on the MBA page. The general English rule is not on the page, so it was not checked. | MBA page | 2026-11-03 |
| India grade table: 2:1 at a Section 1 university = 60% or CGPA 6.0/10 (gpa_min) | MATCH | With country set to India: "2.1 Section 1 - 60% or CGPA 6.0/10" | MBA page (country set to India) | 2026-11-03 |
| India grade table: three sections (Section 1, 2, 3) | MATCH | "Section 1 - 65%... Section 2 - 68%... Section 3- 70%" (1st class); "Section 2 - 62% or CGPA 6.2/10"; "Section 3- 65% or CGPA 6.5/10" (2.1) | MBA page (country set to India) | 2026-11-03 |
| Deposit for students from India: £3,000 | MATCH | "All International students (excluding those from the markets above) You are required to pay a deposit of £3,000 or submit an official letter of sponsorship by 27th August 2027." The India-specific £5,000 markets are Bangladesh, Ghana, Nigeria, Sri Lanka and Pakistan. | MBA page | 2026-11-03 |
| Deposit due 27 August 2027 | MATCH | "by 27th August 2027" (2027 Entry section) | MBA page | 2026-11-03 |
| ATAS programmes: deposit due 13 August 2027 | MATCH | "If your programme requires ATAS you are required to pay a deposit of £3,000 or submit an official letter of sponsorship by 13th August 2027" | MBA page | 2026-11-03 |
| Deposit non-refundable and taken off tuition on registration | MATCH | "This deposit is non-refundable and will be deducted from your tuition fees when you register." | MBA page | 2026-11-03 |
| Deposit payable after receiving an offer | MATCH | "The deposit is payable after you receive an offer to study with us." | MBA page | 2026-11-03 |
| Application deadline: no closing date | MATCH | "There is no application closing date for this course." | MBA page | 2026-11-03 |
| Apply at least two months before start | MATCH | "We suggest international students apply at least two months before the course starts." | MBA page | 2026-11-03 |
| Scholarship: Vice-Chancellor's Excellence, up to 50% of tuition | MATCH | "Up to 50% off tuition fees." | VCES page | 2026-11-03 |
| VCES: degree offer applied by 31 May 2027 | MATCH | "have applied for a degree programme offer by 31st May 2027" | VCES page | 2026-11-03 |
| VCES: scholarship deadline 8 June 2027 | MATCH | "Application Closing Date 8th June 2027" | VCES page | 2026-11-03 |
| VCES: apply through Apply to Newcastle Portal | MATCH | "Applications must be submitted through the University's Apply to Newcastle Portal" | VCES page | 2026-11-03 |
| MBA scholarships considered at interview | MATCH | "you will also be considered for our MBA scholarships" | MBA page | 2026-11-03 |
| Scholarship worth 25% off the international fee | MATCH | "You may be eligible for a scholarship worth 25% off the international fee." | MBA page | 2026-11-03 |
| Accreditation: AACSB, EQUIS, AMBA | MATCH | "Newcastle University Business School is accredited by the: Association to Advance Collegiate Schools of Business (AACSB) European Quality Improvement System (EQUIS) Association of MBAs (AMBA)" | MBA page | 2026-11-03 |
| AMBA accreditation for over 35 years | MATCH | "We've been professionally accredited by AMBA for over 35 years" | MBA page | 2026-11-03 |
| Outcomes: 91% in work or study 15 months after graduation (GOS 2018/19 to 2023/24) | MATCH | "91% In work or further study 15 months after graduation Graduate Outcomes Survey 2018/19 to 2023/24" | MBA page | 2026-11-03 |
| Careers Consultant one-to-one coaching | MATCH | "Dedicated Careers Consultant offering one-to-one coaching" | MBA page | 2026-11-03 |
| Modules: two phases of core modules | MISMATCH | Page shows three phases: "Developing your core skills – Phase One", "Preparing you for global business – Phase Two", "Making an impact – Phase Three". | MBA page | 2026-11-03 |
| Modules: core subjects include finance, marketing, strategy, operations, entrepreneurship | MATCH | "NBS8122 – Financial Management ... NBS8124 – Marketing Management ... NBS8126 – Strategic Management ... ISO8008 – Operations and Supply Chain Management" (Phase One); "NBS8497 – Entrepreneurship and Innovation" (Phase Two) | MBA page | 2026-11-03 |
| Two electives | MATCH | "You will also choose two electives – one from each of the below groups" | MBA page | 2026-11-03 |
| Consultancy project with a live client | MATCH | "Work with a live client on this team-based consultancy project." The page also offers an individual project option (NBS8523). | MBA page | 2026-11-03 |
| Module list is an example, published before each year | MATCH | "The module information on our course pages is intended to provide an example of what you will study." and "This usually happens in May." | MBA page | 2026-11-03 |
| Taught on campus, in English | UNREADABLE | "Course delivery On Campus" is stated. "Taught in English" is not on the page (only the English requirement is). | MBA page | 2026-11-03 |
| Newcastle city centre campus (body, location) | MATCH | Not on the MBA page. VCES page: "hold an offer for an eligible Master's degree programme at the University's Newcastle city centre campus for the 2027/28 academic year". The draft cites the MBA page, which does not say this. | VCES page | 2026-11-03 |
| How to apply: apply online via the application portal | MATCH | "If you're ready, you can select Apply Online and you'll be taken directly to the application portal." | MBA page | 2026-11-03 |
| Documents: transcripts, CV, personal statement, English test results if needed, two referees | MATCH | "academic transcripts / your cv / a personal statement / English language test results (if applicable) / two referees" | MBA page | 2026-11-03 |
| Deposit payable and "Pay ... by 27 August 2027" (how-to-apply step 5) | MATCH | Same as the India deposit row above. | MBA page | 2026-11-03 |

## Not checked (outside the brief)

- UK visa fee, visa living money (£1,171 and 9 months) and Immigration Health Surcharge: excluded as instructed.
- Accommodation guarantee (India country page), Graduate visa duration and fee, TB test, ATAS list, CAS: not MBA facts on the MBA page. Not checked.

## Totals

- MATCH: 37
- MISMATCH: 1 (modules "two phases" vs three phases on the page)
- UNREADABLE: 2 (general English rule of 5.5; "taught in English" not on page)
- Total rows: 40
