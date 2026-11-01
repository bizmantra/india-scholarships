# Country Page Template

`/study-abroad/study-in/{country}`. Shared rules: [README.md](README.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (Country page).

**The reader:** an Indian student considering one country for a Master's, wanting the full picture: cost, eligibility, steps, timelines, work rights, and where to go next.

**The job of the page:** the best single overview of studying in that country from India, with every number sourced, and a clear path to universities, courses, scholarships and the step-by-step guides. It owns searches like "study in Germany for Indian students" and "masters in Germany".

**Today (audit, 11 Oct 2026):** about 1,350 words; links to 51 guides but almost no individual universities or courses; no scholarships block beyond a short list; title 76 characters. "Masters in Germany" gets about 4,400 searches a month.

## Sections

| # | Section | Content |
|---|---|---|
| 1 | **At a glance** | 2–3 sentences, then a facts table from `sa_facts` (auto): tuition at public/private universities, proof of funds, visa fee, post-study work length, English requirement, intakes. Each fact with source and date. |
| 2 | **What it costs** | Tuition, compulsory fees, living costs and proof of funds, a worked first-year total for a typical Master's. Link to the calculator. |
| 3 | **Can you get in?** | What Indian applicants need: degree recognition (Anabin and 3-year degrees for Germany; WES and 3-year degrees for the USA), tests (GRE, English, German), documents (APS for Germany). Each item links to its owner guide. |
| 4 | **Universities** | Top 6–10 by search traffic (auto), with city and tuition, then "see all universities". |
| 5 | **Courses** | Every comparison page for the country (auto), with course counts. |
| 6 | **Scholarships** | Top 6 scholarships for this country (auto, from the scholarships table) and "see all". |
| 7 | **Step by step** | The application journey in order (choose → test → apply → admit → fund → visa → arrive → work), one or two sentences per stage, each linking to its owner guide. Replaces long lists of guide links. |
| 8 | **Work during and after study** | Work-hour rules during study and post-study work route, with sources, linking to the guides. |
| 9 | **FAQs** | 6–8: "Is studying in Germany free for Indian students?", "How much bank balance is needed for a German student visa?", "Can I study in Germany after a 3-year degree?". |
| 10 | **Sources** | All official links with check dates. |

## Fields

Until IS-159 lands, the intro, step-by-step text and FAQs are in code. After it: a `sa_pages` record (or equivalent) per country with `summary`, `seo_title`, `meta_description`, `body_md`, `faq_json`, `checked_at`, edited through the inbox. Facts always come from `sa_facts`.

## Search

- Target: "study in {country} for Indian students", "masters in {country}", "{country} masters cost for Indian students".
- Title (under 65): "Study in Germany for Indian Students: Costs & Steps 2026".

## Checklist

- [ ] Every number from `sa_facts` or another official source, with date
- [ ] Each stage links to exactly one owner guide
- [ ] Universities, courses and scholarships blocks are generated
- [ ] 6–8 FAQs consistent with the page
