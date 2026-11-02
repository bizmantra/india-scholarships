# UK master's research: gap round 4 (2026-11-02)

Scope: the six open items from the owner's round-4 list. Official ac.uk, gov.uk and UKCISA pages only. All pages were read on 2026-11-02 in the built-in browser, using the course's own selectors (country, fee-country, qualification) or accordion tabs. Quotes are under 15 words and verbatim from the page text. Prior-round fields in uk-gaps-round3.md were re-read where this round depended on them.

Note on method: where a country selector was needed, it was set to India by script (form value and change event), and the page then showed the India block. Where the page showed "Showing requirements for India" or "Fees information for: India" in the DOM, that is cited.

## Count

| Item | Fields | Filled | NOT CONFIRMED |
|---|---|---|---|
| 1 Newcastle (CS, DS, MBA): IELTS overall, IELTS per band, India grade | 9 | 9 | 0 |
| 2 Manchester (DS-AI fee and India; MBA fee, IELTS, India) | 5 | 2 | 3 |
| 3 Birmingham (CS, DS, MBA): international fee and entry year | 6 | 6 | 0 |
| 4 Coventry (DS-CI, MBA): per year or total | 2 | 2 | 0 |
| 5 Glasgow (DS-AI): fee basis, India entry | 2 | 1 | 1 |
| 6 CAS: when usually issued | 1 | 0 | 1 |
| **Total** | **25** | **20** | **5** |

---

## 1. Newcastle University

Entry-requirements block: the course page renders it only after the "Entry requirements" tab is opened. The "Select your country" and "Select your qualification" controls then show the India and IELTS blocks. Verified for CS by screenshot; DS and MBA by the same DOM action (the India block appeared after the change in each case; the MBA selector read back as "India").

| Course | Field | Result | Quote | Entry year | URL | Date read |
|---|---|---|---|---|---|---|
| MSc Computer Science (5055F) | IELTS overall | FILLED. IELTS 6.5 overall, direct entry. | "Direct Entry: IELTS 6.5 overall (with a minimum of 5.5 in all sub-skills)." | 2027-28 (page: "entrance requirements below apply to 2027 entry") | https://www.ncl.ac.uk/postgraduate/degrees/5055f/ | 2026-11-02 |
| MSc Computer Science | IELTS per band | FILLED. Minimum 5.5 in each sub-skill. | "minimum of 5.5 in all sub-skills" | 2027-28 | as above | 2026-11-02 |
| MSc Computer Science | India entry grade | FILLED. With India selected, the page shows the grade table: 2.1 = "Section 1 - 60% or CGPA 6.0/10" (2.2 = "Section 1 - 58% or CGPA 5.8/10"). Academic line on the page: "A 2:2 honours degree, or equivalent". | "Section 1 - 60% or CGPA 6.0/10" | 2027 | as above (India selected in "Qualifications from outside the UK") | 2026-11-02 |
| MSc Data Science (5543F) | IELTS overall | FILLED. IELTS 6.5 overall, direct entry. | "Direct Entry: IELTS 6.5 overall (with a minimum of 5.5 in all sub-skills)." | 2027-28 | https://www.ncl.ac.uk/postgraduate/degrees/5543f/ | 2026-11-02 |
| MSc Data Science | IELTS per band | FILLED. Minimum 5.5 in each sub-skill. | "minimum of 5.5 in all sub-skills" | 2027-28 | as above | 2026-11-02 |
| MSc Data Science | India entry grade | FILLED. Same India grade table as CS: 2.1 = "Section 1 - 60% or CGPA 6.0/10". Academic line: "A 2:2 honours degree, or international equivalent". | "Section 1 - 60% or CGPA 6.0/10" | 2027 | https://www.ncl.ac.uk/postgraduate/degrees/5543f/ | 2026-11-02 |
| MBA (5823F) | IELTS overall | FILLED. IELTS 6.5 overall, direct entry. | "Direct Entry: IELTS 6.5 overall (with a minimum of 6.0 in all sub-skills)." | 2027-28 | https://www.ncl.ac.uk/postgraduate/degrees/5823f/ | 2026-11-02 |
| MBA | IELTS per band | FILLED. Minimum 6.0 in each sub-skill (higher than the MSc courses). | "minimum of 6.0 in all sub-skills" | 2027-28 | as above | 2026-11-02 |
| MBA | India entry grade | FILLED. With India selected, the grade table shows 2.1 = "Section 1 - 60% or CGPA 6.0/10". Academic line: "A 2:1 honours degree, or international equivalent." The MBA also has a work-experience requirement ("three years (minimum)"). | "Section 1 - 60% or CGPA 6.0/10" | 2027 | as above | 2026-11-02 |

Fee rows from round 3 are unchanged: CS £33,400 (FT International), DS £32,800, MBA £34,400, all per year, 2027-28.

---

## 2. University of Manchester

| Course | Field | Result | Quote / reason | Entry year | URL | Date read |
|---|---|---|---|---|---|---|
| MSc Data Science and AI (Computer Science Data Informatics), list/22195 | International fee 2027 | NOT CONFIRMED. The course page's "Fees and funding" section (opened by its tab link) has only policy and scholarship text, with no figure. The fee-policy page says the fee is on the course profile, but this profile has none. | "Fees vary for each master's course" (fee policy page) | 2027 | https://www.manchester.ac.uk/study/masters/courses/list/22195/msc-data-science-and-artificial-intelligence-computer-science-data-informatics/ ; https://www.manchester.ac.uk/study/masters/fees-and-funding/international-student-fees/ | 2026-11-02 |
| MSc DS-AI | India entry line | NOT CONFIRMED. No India line on the course page. Only generic entry: "High 2:1 honours degree (or overseas equivalent)". | "High 2:1 honours degree (or overseas equivalent)" | 2027 | as above | 2026-11-02 |
| MBA (Alliance MBS, Full-time MBA) | Tuition fee | FILLED. One tuition fee for the whole programme (IMPLIED total): the page gives it for "18 or 15 months" rather than per year. No UK/international split is shown on the page. | "The tuition fee for the Full-time MBA is £51,500" | Start September 2027 (page: "Start September 2027") | https://www.alliancembs.manchester.ac.uk/study/mba/full-time-mba/fees-funding/ | 2026-11-02 |
| MBA | IELTS overall and per band | FILLED. Overall 6.5, with at least 6.5 in speaking and writing and no less than 6.0 in reading and listening. | "minimum overall score of 6.5"; "no less than 6.0 in reading and listening" | 2027 | https://www.alliancembs.manchester.ac.uk/study/mba/full-time-mba/entry-requirements/ (English section expanded) | 2026-11-02 |
| MBA | India entry line | NOT CONFIRMED for the degree grade. No India degree grade on the page; the entry line is "Good undergraduate degree or international equivalent". An India-specific line exists only for English: Class XII English at 80%. | "Indian Standard XII English CBSE ... 'English Core': 80%" (English-language route, not a degree grade) | 2027 | as above | 2026-11-02 |

Correction to round 3: the MBA entry-requirements page states the 6.5 IELTS and sub-score line in full; round 3 recorded it as "if applicable" (that was the summary line on the programme page only).

---

## 3. University of Birmingham

Method: the country selector "Fees information for:" set to India (page reloads with "?location=India"). The fee label then reads "Fees (international)". Round 3 read the default UK/Ireland label. This is a correction: the earlier "UK/Ireland" figures were not the overseas fee.

| Course | Field | Result | Quote | Entry year | URL | Date read |
|---|---|---|---|---|---|---|
| MSc Computer Science | International fee | FILLED. Two intakes. | "Fees (international)" "£34,740 January 2027 / £36,000 September 2027" | January 2027 and September 2027 | https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/computer-science-msc?location=India | 2026-11-02 |
| MSc Computer Science | Entry year | FILLED. Starts January or September 2027. | "Fees for 2027 entry are above." | 2027 | as above | 2026-11-02 |
| MSc Data Science | International fee | FILLED. | "Fees (international)" "£36,000 (full-time)" | September 2027 | https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/data-science-msc?location=India | 2026-11-02 |
| MSc Data Science | Entry year | FILLED. | "Fees for 2027 entry are above." | 2027 (September) | as above | 2026-11-02 |
| MBA (full-time, Edgbaston) | International fee | FILLED. | "Fees (international)" "£40,410 (full-time)" | September 2027 | https://www.birmingham.ac.uk/study/postgraduate/subjects/business-and-management-courses/mba?location=India | 2026-11-02 |
| MBA | Entry year | FILLED. 1 year. | "Start date September 2027" | 2027 (September) | as above | 2026-11-02 |

Basis for all three: "We charge an annual tuition fee." and "The fees quoted are for one year only." Those lines sit on the same pages. For CS and DS the course is 1 year full-time (the CS and DS pages say "Fees for 2027 entry are above"); the MBA is 1 year.

Also read (not asked): the CS India entry block says "2:1 Honours Degree" in any subject other than computing, and "55% - 60% or higher for 2:1 equivalency" for Indian degrees. The DS and MBA pages show the same 2:1 line.

---

## 4. University of Coventry

Both pages state the basis in the fee table footnote. The table has no "per year" label on the International row, so the basis comes from the footnote, not the label.

| Course | Field | Result | Quote | Entry year | URL | Date read |
|---|---|---|---|---|---|---|
| MSc Data Science and Computational Intelligence | Per year or total | FILLED (basis from footnote). The footnote says Coventry will charge "the tuition fees that are stated in the above table" for the first academic year. Duration is "1 year full-time", so the figure is per academic year and equals the total for the 1-year course (before any optional placement). | "International £19,980"; "1 year full-time" | 2027-28 | https://www.coventry.ac.uk/course-structure/pg/ees/data-science-and-computational-intelligence-msc/?term=2027-28 | 2026-11-02 |
| MBA | Per year or total | FILLED (same basis). The International figure is "£21,825" in the first-year table; Duration "1 year full-time". | "International £21,825"; "1 year full-time" | 2027-28 | https://www.coventry.ac.uk/course-structure/pg/cbl/masters-in-business-administration/?term=2027-28 | 2026-11-02 |

Round-3 corrections confirmed on re-read: DS-CI International £19,980 and MBA International £21,825 are the 2027-28 fees (the ?term=2027-28 URL and the 2027-28 radio). Coventry's 2027-28 CS figure (£19,980) is in round 3.

---

## 5. University of Glasgow (MSc Data Science and Artificial Intelligence)

Method: the page's "Country of residence" and "Select your country/region" controls were set to India in the browser. The entry block then showed "Showing requirements for India". The page is read in the browser's DOM (not WebFetch). Cookie choices were set to the minimum (analytics and personalised ads declined).

| Course | Field | Result | Quote | Entry year | URL | Date read |
|---|---|---|---|---|---|---|
| MSc Data Science and AI | International fee: per year or total | NOT CONFIRMED. The page gives "Full-time fee: £34,815" under "Tuition fees for 2027-28" for "International & EU", with no per-year or total label. The page also says "MSc: 12 months full-time", which suggests the fee covers the full course, but the page does not say so. | "Full-time fee: £34,815" | 2027-28 | https://www.gla.ac.uk/postgraduate/taught/data-science-artificial-intelligence/ | 2026-11-02 |
| MSc Data Science and AI | India entry line | FILLED. With India selected: "Bachelor degree at 55-63% (depending on university attended)" in any degree with Computing as a major subject, at an average grade of pass. Note: the page's default line is "2.1 Hons (or non-UK equivalent)"; the India line is the India-specific one. | "Bachelor degree at 55-63% (depending on university attended)" | 2027-28 | as above (block titled "Showing requirements for India") | 2026-11-02 |

---

## 6. CAS (Confirmation of Acceptance for Studies): when usually issued

| Item | Result | Quote / reason | Source | Date read |
|---|---|---|---|---|
| When the CAS is usually issued | NOT CONFIRMED. None of the pages read gives a usual issue date or window. UKCISA says only to receive the CAS from the institution. The gov.uk pages read cover how a CAS is created and assigned in SMS, and the only date rule is that the course start date "must not be in the past". The sponsor compliance guidance covers sponsor duties and refusal and enrolment rates, not issue timing. | "The date must not be in the past." (course start date field, a constraint, not a usual issue date) | UKCISA: https://www.ukcisa.org.uk/student-advice/visas-and-immigration/student-route-applying-in-the-uk/ (read in round 3); gov.uk SMS guide 4: https://www.gov.uk/government/publications/confirmation-of-acceptance-for-studies-cas-sms-user-manual/sms-guide-4-creating-and-assigning-cas-accessible ; SMS 4A: https://www.gov.uk/government/publications/certificates-of-sponsorship-cos-sms-user-manual/sms-guide-4a-creating-a-cas-guide-for-student-sponsors-accessible ; sponsor compliance: https://www.gov.uk/government/publications/student-sponsor-guidance/student-sponsor-compliance-accessible | 2026-11-02 |

Not used: a search snippet in round 3 said a CAS is valid for six months from assignment. It was not verified on a page read this round, so it is not used. The gov.uk student visa page (https://www.gov.uk/student-visa) gives the 6-month and 3-month application windows, which are visa windows, not CAS issue timing.

---

## Still NOT CONFIRMED (5 fields) and why

| # | Item | Field | Reason |
|---|---|---|---|
| 1 | Manchester DS-AI | International fee 2027 | No figure on the course page, the Fees and funding section, or the fee policy page; policy says "details ... can be found on course profiles", and the profile has none |
| 2 | Manchester DS-AI | India entry line | No India line on the course page; only "High 2:1 honours degree (or overseas equivalent)" |
| 3 | Manchester MBA | India entry line (degree grade) | No India degree grade; an India Class XII English line exists but it is an English-language route, not a degree grade |
| 4 | Glasgow DS-AI | International fee: per year or total | "Full-time fee: £34,815" has no per-year or total label; course is 12 months |
| 5 | CAS | When CAS is usually issued | No usual issue date or window on the UKCISA or gov.uk pages read |

## Leads not used as figures

- The Manchester pre-sessional IELTS lines (6.5 overall, 6.0 each sub-skill; 6.0 overall for the 10-week course) are not the course requirement and are not used.
- Newcastle's India page general line ("IELTS score of 6.5") is university-level; the course figures above are used instead.
- Birmingham MSc International Business fee lead (round 3) is not a CS, DS or MBA figure and is not used.
