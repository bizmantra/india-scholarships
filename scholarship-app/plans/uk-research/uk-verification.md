# UK fee verification: browser re-check (MSc CS, MSc DS, MBA)

Checked: 2026-11-02, in the built-in browser. Text read with find and read_page on the live page DOM (raw page text, not an AI summary). Where a fee sits outside the main content, read_page or find was used instead of get_page_text.

Scope: every fee figure marked as found in uk-universities.md, uk-universities-gaps-a.md or uk-universities-gaps-b.md for MSc CS, MSc DS or MBA. Where one file said found and another said NOT CONFIRMED, the figure was checked (noted below). Not checked, because every file marks them NOT CONFIRMED: Birmingham CS, DS, MBA; Glasgow DS and AI; Manchester DS and AI; Manchester MBA; Coventry DS; Coventry MBA; Nottingham MBA.

Verdicts: MATCH = value and entry year agree with the page. MISMATCH = the page gives a different value or year. UNREADABLE = the page could not be read. "Basis not stated" means the page shows no per-year or total label; each of these is a 12-month course, so the annual figure is also the total.

## Verification table

| University | Course | Claimed | Actual (what the page says) | Verdict | URL |
|---|---|---|---|---|---|
| Manchester | MSc Advanced Computer Science (closest to CS) | £41,400 per year | £41,400. "International, including EU, students (per annum): £41,400". Entry 2027. | MATCH | https://www.manchester.ac.uk/study/masters/courses/list/21573/msc-advanced-computer-science/ |
| Leeds | MSc Computer Science (k299) | £34,600 (Total) | £34,600 (Total). "International: £34,600 (Total)". Year of entry 2027. | MATCH | https://courses.leeds.ac.uk/k299/computer-science-msc |
| Nottingham | Advanced Computer Science (AI) MSc | £34,800 | £34,800. "International fees: £34,800". 2027 entry. Basis not stated; page says "These fees are for full-time study." | MATCH (basis not stated) | https://www.nottingham.ac.uk/pgstudy/course/taught/computer-science-artificial-intelligence |
| Southampton | MSc Computer Science | £36,800 per year | £36,800. "EU and international students pay £36,800." Under "Fees for a year's study". Entry 2027-28. | MATCH | https://www.southampton.ac.uk/courses/computer-science-masters-msc |
| Glasgow | MSc Computing Science | £34,815 | £34,815. "Full-time fee: £34,815", under "International & EU", "Tuition fees for 2027-28". Basis not stated. | MATCH (basis not stated) | https://www.gla.ac.uk/postgraduate/taught/computingscience/ |
| Coventry | MSc Computer Science | £19,500 per year (year not stated) | The 2027-28 International fee is £19,980 per year. The £19,500 figure is shown only in the default 2026-27 view. Quote: "£19,980 per year". | MISMATCH (entry year: 2026-27 not 2027-28; actual £19,980) | https://www.coventry.ac.uk/course-structure/pg/ees/computer-science-msc/?term=2027-28 |
| Sheffield | MSc Computer Science (2027-28) | £34,550 per year | £34,550. "Overseas students", under "2027-28 tuition fee". 1-year course. Basis not stated. | MATCH (basis not stated) | https://sheffield.ac.uk/postgraduate/taught/courses/2027/computer-science-msc |
| Newcastle | MSc Computer Science (5055F) | £33,400 per year | £33,400. "FT International:", under "Fees (per year)". Entry 2027-28. | MATCH | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ |
| Edinburgh | MSc Computer Science | £47,680 per year | £47,680.00. "International / EU fee rate (per year)", 2027/8. Page: "The tuition fee shown in the table is for one year only." | MATCH | https://study.ed.ac.uk/programmes/postgraduate-taught/110-computer-science (fee page: programme_code=PTMSCCMPSI1F, year=2027) |
| UCL | MSc Computer Science | £44,400 per year | £44,400 per year. "International: £44,400 per year", under "Fees (2027/28)". | MATCH | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/computer-science-msc |
| Warwick | MSc Computer Science (P-G5PD) | £39,330 per year | £39,330. Overseas row, 2027-28 column (the columns are 2025-26, 2026-27, 2027-28). Page: "Tuition fees are payable for each year". | MATCH | https://warwick.ac.uk/study/postgraduate/courses/msc-computer-science/ (fee table: https://warwick.ac.uk/services/finance/studentfinance/fees/postgraduatefees/) |
| Nottingham | Data Science MSc | £34,800 | £34,800. "International fees: £34,800". 2027 entry. Basis not stated. | MATCH (basis not stated) | https://www.nottingham.ac.uk/pgstudy/course/taught/data-science-msc |
| Southampton | MSc Data Science | £36,800 per year | £36,800. "EU and international students pay £36,800." Under "Fees for a year's study". Entry 2027-28. | MATCH | https://www.southampton.ac.uk/courses/data-science-masters-msc |
| Leeds | MSc Data Science and Analytics (i071; closest DS) | £34,600 (Total) | £34,600 (Total). "International: £34,600 (Total)". Year of entry 2027. | MATCH | https://courses.leeds.ac.uk/i071/data-science-and-analytics-msc |
| Sheffield | MSc Data Science (2027-28) | £36,055 per year | £36,055. "Overseas students", under "2027-28 tuition fee". The page also lists Overseas rates of £18,027 and £12,018, which look like part-time rates. Basis not stated. | MATCH (basis not stated) | https://sheffield.ac.uk/postgraduate/taught/courses/2027/data-science-msc |
| Newcastle | MSc Data Science (5543F) | £32,800 per year | £32,800. "FT International:", under "Fees (per year)". Entry 2027-28. | MATCH | https://www.ncl.ac.uk/postgraduate/degrees/5543f/ |
| Edinburgh | MSc Data Science | £47,680 per year | £47,680.00. "Data Science (MSc) (Full-time)", 2027/8, per year (fee page). | MATCH | https://study.ed.ac.uk/programmes/postgraduate-taught/902-data-science (fee page: programme_code=PTMSCDATSC1F, year=2027) |
| UCL | MSc Data Science | £48,600 per year | £48,600 per year. "International: £48,600 per year", under "Fees (2027/28)". | MATCH | https://www.ucl.ac.uk/study/prospective-students/graduate/courses/data-science-msc |
| Warwick | MSc Statistics with Data Science (P-G4P1; closest DS, not a plain "Data Science" MSc) | £39,330 per year | £39,330. Overseas row, labelled "Statistics (MSc)" in the fee table, 2027-28 column. | MATCH | https://warwick.ac.uk/study/postgraduate/courses/msc-statistics-data-science/ |
| Leeds | Full-time MBA (a992) | £41,200 (Total) | £41,200 (Total). "International: £41,200 (Total)". Year of entry 2027. | MATCH | https://courses.leeds.ac.uk/a992/full-time-mba |
| Southampton | MBA | £37,400 per year | £37,400. "EU and international students pay £37,400." Under "Fees for a year's study". Entry 2027-28. | MATCH | https://www.southampton.ac.uk/courses/master-of-business-administration-masters-mba |
| Glasgow | MBA | £41,100 | £41,100. "Full-time fee: £41,100", under "International & EU", "Tuition fees for 2027-28". Basis not stated. | MATCH (basis not stated) | https://www.gla.ac.uk/postgraduate/taught/businessadministration/ |
| Sheffield | MBA (2027-28) | £37,630 per year | £37,630. "Overseas students", under "2027-28 tuition fee". Basis not stated. | MATCH (basis not stated) | https://sheffield.ac.uk/postgraduate/taught/courses/2027/mba-master-business-administration-mba |
| Newcastle | MBA (5823F) | £34,400 | £34,400. "FT International:", under "Fees (per year)". Entry 2027-28. | MATCH | https://www.ncl.ac.uk/postgraduate/degrees/5823f/ |
| Edinburgh | MBA (Business Administration, 12 months) | £47,680 per year | £47,680.00. 2027/8. Page: "The tuition fee shown in the table is for one year only." | MATCH | https://study.ed.ac.uk/programmes/postgraduate-taught/267-business-administration-master-of (fee page: programme_code=PTMBABUSAD5F, year=2027) |
| Warwick | Full-time MBA (P-N1P2) | £62,500 per year | £62,500. Fee status "ALL", 2027-28 column. | MATCH | https://warwick.ac.uk/study/postgraduate/courses/mba-full-time-mba/ |

Totals: 26 checked. MATCH 25 (of these, 7 have basis not stated on the page). MISMATCH 1. UNREADABLE 0.

Conflicts between files: Nottingham CS and DS, Glasgow CS and MBA, and Coventry CS were marked found in uk-universities.md and NOT CONFIRMED (basis or year) in gaps-B. They are included here on the strength of the found mark. Edinburgh (three courses) and UCL were NOT CONFIRMED in uk-universities.md and found in gaps-A; the gaps-A figures were checked here.

Sheffield DS: the page also shows Overseas figures of £18,027 and £12,018 under the same heading. These are not the full-year fee and are not used.

## GREAT Scholarships (India)

Source: https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/india (page text read 2026-11-02)

| Item | Claimed | Actual (what the page says) | Verdict |
|---|---|---|---|
| Value | £10,000 | "GREAT Scholarships offer students the opportunity to receive £10,000 towards their tuition fees" | MATCH |
| Eligibility | (not stated in files) | "be a passport holder and permanent resident of India"; "have an undergraduate degree"; "meet the English language requirement of the UK HEI" | Recorded |
| Dates | (not stated in files) | Scheme is for "one-year taught postgraduate courses in the 2026-27 academic year". Terms: "GREAT Scholarships 2026-27 terms and conditions". Deadlines "vary according to each institution". | Recorded. The page covers 2026-27 only; no 2027-28 terms are shown. |

Note: none of the 13 institutions listed on the page is among the universities in the research files.
