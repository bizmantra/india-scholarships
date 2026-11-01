# University Page Template (Study Abroad)

The standard for every page under `/study-abroad/universities/[slug]`. Anyone writing or updating a university page, person or agent, follows this. Backlog IS-143 (recovery plan E4); rebuild order in IS-153.

**The reader:** an Indian student, often with a parent reading alongside, deciding whether to apply. They want straight answers: what it costs in total, whether they can get in, what to do and by when.

**The job of the page:** answer those questions fully and correctly for this one university, better than the university's own website does for an Indian family.

---

## 1. Rules that apply to every page

1. **No fact without an official source.** Every fee, deadline, test score, visa or money figure links to the university's own site or a government/official body (DAAD, embassy, Studierendenwerk, USCIS, etc.). Third-party sites (blogs, coaching centres, rankings sites) are never the source for a number.
2. **Leave it out rather than guess.** If an official source does not say it, the page does not say it. Never write "around", "usually", "approx." to cover a number you have not found. Never write research notes on the page ("not specified in the source used here").
3. **Record the check date.** Every page has `checked_at` (the day the facts were checked) and a Sources section listing every link used.
4. **Written for this university only.** No paragraph may appear word-for-word on another university page, except the short standard lines in §4. If a sentence would be true of any German university, it belongs in a country guide, linked from here.
5. **Correct common myths.** If something widely believed is wrong (e.g. "TUM is free"), say so plainly near the top.
6. **Plain, conversational English.** Short sentences. Explain German or American terms the first time (e.g. "semester fee (Semesterbeitrag)"). Talk to the reader as "you". No hype words ("premier", "world-class", "holy grail", "elite"), no exclamation marks, no emoji, no ALL CAPS.
7. **Money in the local currency.** Euros for Germany, US dollars for the USA. No rupee conversions in the body (exchange rates change); link to the cost calculators instead.
8. **Dates are real dates.** "1 February – 31 May", not "early spring".

## 2. Page structure

Sections in this order. Headings may be adjusted to fit the university, but the order and purpose stay. Skip a section only if there is genuinely nothing official to say, and never leave an empty heading.

| # | Section | What it must answer |
|---|---|---|
| 1 | **At a glance** | 2–3 sentences: what the university is, where, why Indian students look at it. Then the single most important thing to know (often cost). Then a short facts table: type, city/campus, tuition for Indian students, semester/other fees, teaching language, GRE/GATE, English test. |
| 2 | **What it really costs** | Each cost separately: tuition (per semester and full degree, by program if it varies), compulsory fees, living costs / proof of funds for the visa. A worked total for the first year for one popular program. Note on how expensive the city is, only with a source. |
| 3 | **Ways to reduce the cost** | The university's own scholarships, fee waivers, tuition exemptions: amount, who qualifies, deadlines. Link to relevant external scholarships (DAAD etc.). If none exist, say so in one line. |
| 4 | **Getting in** | How admission is decided (aptitude assessment, holistic review, cutoffs if published), special rules for Indian degrees (GRE/GATE, 3-year degrees, APS), subject-match rules, English requirement. Link to our APS, ECTS and grade guides. |
| 5 | **Deadlines** | Table per popular program: intake, application window. One line of advice on applying early because of visa timing. |
| 6 | **Popular programs for Indian students** | A short paragraph on which programs Indian students choose and why, naming 3–6 of them. Each named program must exist as a course page and is linked to it; if a program is missing, add it to `sa_programs` first (backlog IS-154). The full course list and table are added automatically by the layout from `sa_programs`, so the article never repeats it. Programs that need German must say so. |
| 7 | **Where you'll live** | Which campus/city, how it connects to the city, official student housing (rent range and waiting time from the housing office), what most new students do instead. |
| 8 | **Who it's a good fit for** | Two short bullet lists: strong choice if…, think carefully if…, with a link to compare alternatives. Based only on facts already on the page. |
| 9 | **FAQs** | See §5. |
| 10 | **Sources** | Every official link used, with the check date. Ends with: "Fees and rules change. Always confirm on the university's own website before you pay or apply." |

**Length:** whatever it takes to cover the sections properly. Typically 1,200–2,000 words. Never pad to hit a number.

## 3. Database fields to fill

The page layout reads these fields, so they must match the article.

| Field | Rule |
|---|---|
| `name` | Official name, with the common short name in brackets: "Technical University of Munich (TUM)". |
| `city` | City and campus where Master's students study, e.g. "Munich (Garching campus)". Never "Germany, Germany". |
| `summary` | 1–2 sentences, under 200 characters, specific to this university. Leads with the most useful fact. Never "Complete 2026 guide to…". |
| `seo_title` | Pattern: `{Short name} for Indian Students: Fees, Admission & Deadlines {year}`. Under 65 characters. Adjust if a more specific angle fits (e.g. "TUM Fees for Indian Students 2026: €6,000/Semester Explained"). |
| `meta_description` | 140–160 characters. States the key fact (cost or admission rule) and what the page covers. No figure that is not on the page. |
| `tuition_per_year`, `tuition_currency` | Tuition for Indian students for the most popular Master's program, per year (e.g. 12000, EUR). 0 if genuinely free. Blank only if no official figure. |
| `gre_required` | `true`, `false`, or blank if it depends on the program (explain in the article). |
| `application_deadlines` | JSON with the main intake windows for the most popular program. |
| `infobox_json` | The "at a glance" facts table, same values as section 1. |
| `faq_json` | The FAQs from section 9 (they are also sent to Google as FAQ rich results). |
| `official_source` | The university's main admissions or fees page (not just the homepage). |
| `checked_at` | Date the facts were checked (YYYY-MM-DD). |
| `body_md` | Sections 1–8 and 10. |

## 3a. What the layout adds automatically

The writer does not type these; the page layout builds them from the database (see [LINKING_RULES.md](LINKING_RULES.md)):

- Course table: every published course at this university, linked.
- Comparison pages for each subject the university offers.
- 3–5 similar universities (same country, overlapping subjects, closest tuition).
- Scholarships that apply.
- Proof-of-funds calculator link in the cost section, and loan line.
- Visa guides for the country (one line in "Next steps").
- Byline and "facts checked" date from `checked_at`.

## 3b. Country differences

| | Germany | USA |
|---|---|---|
| Currency | EUR | USD |
| Living-cost proof | Blocked account (standard line, §4) | I-20 proof of funds: the university's own published cost of attendance, linked to the I-20 calculator |
| Extra admission items | APS certificate, ECTS subject match, Uni-Assist or direct portal | WES or the university's own evaluation, GRE policy per program, application fee |
| Work after study | Job seeker permit (link the guide) | OPT and STEM OPT (state whether the main programs are STEM-designated, from the university's site) |
| Funding | University waivers, DAAD and foundations | Assistantships (TA/RA), university scholarships, external scholarships |

## 4. Standard lines allowed on every page

Only these may repeat across pages, and each must link to the full guide:

- The blocked account line (Germany): "For the student visa, you need to show €11,904 for the first year, usually in a blocked account. This is your own money, released at €992 a month." → blocked account guide. (Update all pages together if the amount changes.)
- The APS line (Germany): "Indian applicants need an APS certificate; apply 4 to 5 months before your deadline." → APS guide.
- The closing line of the Sources section.

## 5. FAQs

- **5 to 8 questions**, written the way an Indian student or parent would type them into Google: "Is TUM free for Indian students?", "Does TUM require GRE for Indian students?", "What is the TUM application deadline for winter 2027?".
- Answer in 1–3 sentences, starting with the direct answer ("No. Since 2024…").
- Every answer must agree with the article and use only facts from it.
- No question that applies to every university unchanged ("What is a blocked account?"); link the guide instead.

## 6. Search targeting

- **Main target:** "{university} for Indian students" plus fees, admission, deadlines, GRE. Use the short name people search with (TUM, RWTH, KIT).
- **Supporting questions** come from: Google's "People also ask" for the university, our keyword research files, and Search Console queries once the page gets impressions.
- Put the main question's answer in the first two paragraphs.
- Links follow [LINKING_RULES.md](LINKING_RULES.md) (University section). In the text: at most one link per guide, placed where it helps.

## 7. Trust (E-E-A-T)

- **Byline:** shown by the page layout: "By IndiaScholarships Editorial Team. Facts checked {checked_at}." The same byline is used on every Study Abroad page.
- **Sources section** on every page, as above.
- **Corrections:** when a fact changes, update the page and `checked_at`; do not leave the old figure anywhere on the page.
- **No invented experience.** Never write "students tell us", "in our experience" or made-up examples.

## 8. Before a page goes live: checklist

- [ ] Every number traced to a link in Sources, checked within the last 30 days
- [ ] No research notes, placeholders, "Varies", or "Complete 2026 guide to"
- [ ] No paragraph copied from another university page (except §4 lines)
- [ ] All database fields in §3 filled and consistent with the article
- [ ] 5–8 FAQs that agree with the article
- [ ] `seo_title` under 65 characters, `meta_description` 140–160 characters
- [ ] Every program named in the text links to its course page, and every link is to a live page
- [ ] Links follow [LINKING_RULES.md](LINKING_RULES.md)
- [ ] Read aloud once: does it sound like a knowledgeable person explaining, not a brochure?
- [ ] Submitted through the Agent Center inbox for owner approval (once Study Abroad support exists)
