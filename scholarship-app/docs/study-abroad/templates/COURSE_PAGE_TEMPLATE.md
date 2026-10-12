# Course Page Template (Study Abroad)

The standard for every page under `/study-abroad/program-detail/[country]/[university]/[program]`: one degree program at one university (for example TUM M.Sc. Informatics). Anyone writing or updating a course page, person or agent, follows this. Backlog IS-143.

Shared rules (sourcing, tone, trust, byline) are the same as the [university template](UNIVERSITY_PAGE_TEMPLATE.md) §1 and §7. Links follow [LINKING_RULES.md](LINKING_RULES.md) (Course section).

**The reader:** an Indian student who has narrowed down to a subject and is checking one specific program: can I get in, what will it cost me in total, what do I submit and by when, and is it worth it compared with similar programs.

**The job of the page:** everything needed to decide on and apply to this one program, without opening five tabs on the university's website.

**What the audit found (11 Oct 2026):** course pages average 214 words: a facts box, one deadline line and a list of other courses. Some show research notes to visitors, and the "official program page" button sometimes goes to a fees page.

---

## 1. Page structure

| # | Section | What it must answer |
|---|---|---|
| 1 | **About this program** | 2–4 sentences: what the program is, its focus or specialisations, teaching language, length (semesters/years and ECTS or credits), campus. Then the single most important thing for an Indian applicant (e.g. "Indian applicants need GRE 164 Quant or a GATE score"). |
| 2 | **Can you get in?** | Degree and subject background required (as the university states it); minimum grades if published, and how Indian grades are assessed (Bavarian formula, WES, the university's own evaluation); GRE/GATE rule for Indian degrees; English test minimums per test; German level if needed; selection process (aptitude assessment, interview, test, holistic review). Exact numbers only from the program's official page. |
| 3 | **What it costs** | Tuition per semester/year and for the whole program; compulsory fees; living-cost proof for the visa (standard line); a worked total for the full program. Link to the cost calculator. |
| 4 | **Funding** | Program- or department-specific scholarships, fee waivers, assistantships (USA). Then one line linking to the university's general funding section. If nothing program-specific exists, say so in one line. |
| 5 | **Deadlines and intakes** | Table: intake, application window, where to apply (Uni-Assist, university portal, GradCAS, etc.), result timing if published. One line on applying early for visa timing. |
| 6 | **How to apply** | Numbered steps specific to this program: portal, documents (statement of purpose, CV, recommendation letters, transcripts, test scores, APS/WES), application fee. Link to the guide for each step (text, one link each). |
| 7 | **After the program** | Only facts: career areas the department lists, STEM designation (USA, from the university or ICE list), post-study work route for the country (link the guide). No invented salary numbers; salaries only with an official or government source. |
| 8 | **Who it suits** | Strong choice if… / think carefully if…, using only facts from the page. |
| 9 | **FAQs** | 4–6 questions as students type them: "Does TUM Informatics require GRE for Indian students?", "What is the deadline for TUM Informatics winter 2027?". Direct answer first. |
| 10 | **Sources** | Every official link used, with the check date, and the closing line from the university template. |

**Length:** typically 800–1,400 words. A program with little official information gets a shorter page; never pad.

## 2. What the layout adds automatically

- Facts box and sidebar: tuition, fees, GPA rule, English test, GRE, deadlines, official program link, facts-checked date.
- Its university (link and short card).
- The comparison page for this subject and country.
- 4–6 most similar programs: same subject and country, ranked by tuition band, then entry rules (GRE yes/no, English minimum). Never alphabetical.
- Scholarships that apply (country and level; university-specific if listed).
- Proof-of-funds calculator and loan line in the cost section.
- Byline: "By IndiaScholarships Editorial Team. Facts checked {checked_at}."
- Course structured data (schema.org `Course` with `provider` = the university, `offers` with tuition where known, `hasCourseInstance` with mode and duration), plus FAQ structured data.

## 3. Database fields

Fields that exist today in `sa_programs`, and fields to add (code change, separate PR).

| Field | Exists | Rule |
|---|---|---|
| `title` | Yes | The program's official name: "M.Sc. Informatics". |
| `university_slug`, `country`, `degree`, `field` | Yes | `field` must match a comparison page subject. |
| `location` | Yes | City and campus: "Munich (Garching campus)". |
| `tuition_per_year`, `tuition_currency` | Yes | Tuition for Indian (non-EU / international) students. 0 only if genuinely free. |
| `living_cost_per_year`, `living_currency` | Yes | The official visa proof-of-funds amount for the first year unless the university publishes its own cost of attendance (USA). |
| `gpa_min` | Yes | Short rule as stated officially. Blank if not published. **Never a research note.** |
| `ielts_min` | Yes | Number only (e.g. 6.5). Other tests go in `english_requirements`. Blank if not published. |
| `gre` | Yes | Short rule: "Required for Indian degrees: GRE Q 164, AWA 4.0, or GATE CS". |
| `application_deadlines` | Yes | JSON per intake. |
| `official_source` | Yes | The program's own official page, not a fees or general page. |
| `checked_at` | Yes | Date facts were checked. |
| `summary` | **Add** | 1–2 sentences, under 200 characters, leading with the most useful fact. |
| `seo_title` | **Add** | Under 65 characters. Pattern: `{Program} at {University short name}: Fees, GRE & Deadlines`. |
| `meta_description` | **Add** | 140–160 characters. |
| `body_md` | **Add** | Sections 1–8 and 10. |
| `faq_json` | **Add** | Section 9. |
| `language` | **Add** | "English", "German", "German and English". |
| `duration` | **Add** | e.g. "4 semesters (120 ECTS)" or "2 years (30 credits)". |
| `intakes` | **Add** | "Winter, Summer" / "Fall, Spring". |
| `english_requirements` | **Add** | All accepted tests and minimums, e.g. "IELTS 6.5, TOEFL iBT 88, or degree taught ≥50% in English". |
| `application_portal` | **Add** | "Uni-Assist", "TUMonline", "GradCAS", university portal URL. |
| `application_fee` | **Add** | Amount and currency, if any. |
| `stem_designated` | **Add (USA)** | true / false / blank. |

**Display rule for missing values:** when a field is blank, the page shows "Not published by the university" with the official link, never a note about our research.

## 4. Standard lines

Same as the university template §4 (blocked account, APS, closing line). For the USA, the I-20 line: "For the I-20, you must show funds covering the university's published cost of attendance for the first year." → I-20 guide and calculator.

## 5. Search targeting

- **Main target:** "{program} {university short name}" and "{university short name} {subject} for Indian students", plus fees, GRE, deadline, requirements.
- Put the GRE/English/deadline answers in the first screen (facts box and section 1).
- Do not compete with the comparison page: the course page answers about this one program; "best MS CS in Germany" belongs to the comparison page.

## 6. Before a page goes live: checklist

- [ ] Every number traced to the program's official page or another official source, checked within the last 30 days
- [ ] `official_source` is the program's own page
- [ ] No research notes, placeholders or "Varies"; blank fields show "Not published by the university"
- [ ] No paragraph copied from another course page except the standard lines
- [ ] All fields in §3 filled where the university publishes the information
- [ ] 4–6 FAQs that agree with the article
- [ ] `seo_title` under 65 characters, `meta_description` 140–160
- [ ] Links follow [LINKING_RULES.md](LINKING_RULES.md); all links go to live pages
- [ ] Submitted through the Agent Center inbox for owner approval
