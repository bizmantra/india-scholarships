# Study Abroad: Internal Linking Rules

How every Study Abroad page type links to the others, and to the main site's international scholarships. Every page template in this folder points here for its links. Source: Study Abroad audit, 11 October 2026 (backlog IS-143).

## Why this matters

The audit found that 42 of 45 university pages are linked from only one or two pages. University pages link to at most one course, and never to other universities, comparison pages or scholarships. The 127 international scholarship pages, which get about 100 times more Google exposure than Study Abroad, do not link to it at all. Links are how both readers and Google find the pages that matter.

## Principles

1. **Links follow the reader's next question.** After "what does TUM cost?" comes "which courses?", "can I get a scholarship?", "what are cheaper alternatives?". Link to those.
2. **Automatic first.** Lists, "similar" blocks and scholarship blocks are built into the page layouts and filled from the database, so they stay correct as pages are added or removed. Writers only add links inside the article text.
3. **Relevant, not exhaustive.** A link in the text must help at that point in the text. No end-of-page link dumps of 10+ guides.
4. **One owner per topic.** Each search topic has one page that owns it (see the audit's Overlap section). Other pages link to the owner rather than repeating it.
5. **Descriptive link text.** "TUM's Informatics Master's", not "click here" or a bare URL.
6. **Only live pages.** Never link to a draft, a hidden country (`launched: false`) or a redirect. The route/link check (IS-137) fails the build if one appears.

## URL patterns

| Page type | URL |
|---|---|
| Study Abroad home | `/study-abroad` |
| Country page | `/study-abroad/study-in/{country}` |
| Country lists | `/study-abroad/study-in/{country}/universities`, `/scholarships`, `/visas`, `/loans` |
| Course comparison | `/study-abroad/programs/{country}/{degree}/{field}` |
| University | `/study-abroad/universities/{slug}` |
| Course | `/study-abroad/program-detail/{country}/{university-slug}/{slug}` |
| Guide | `/study-abroad/study-in/{country}/{slug}` |
| Visa guide | `/study-abroad/visas/{slug}` |
| Loan page | `/study-abroad/loans/{slug}` |
| Calculator | `/study-abroad/tools/{slug}` |
| International scholarship (main site) | `/scholarships/{slug}` |

## Rules by page type

"Auto" means the layout builds the block from the database. "Text" means the writer adds the link in the article.

### Study Abroad home
- **Links to:** each launched country page (auto); featured universities, 3–6 per country, chosen by search traffic (auto); every course comparison page (auto); calculators (auto); the international scholarships list (auto); 4–6 top guides (text, chosen by demand).
- **Linked from:** main menu; main site home page; `/scholarships/international` and the scholarships-by-country pages.

### Country page
- **Links to:** the four country lists (auto); top 6–10 universities (auto, by search traffic); every course comparison page for the country (auto); scholarships for that country (auto, top 6, then "see all"); key guides grouped by stage (text: costs, applying, visa, arrival, work); calculators for that country (auto).
- **Linked from:** home; breadcrumbs of every page in the country; every international scholarship for that country (the "Plan your study" block).

### Country lists (universities, scholarships, visas, loans)
- **Links to:** every item in the list (auto); the country page (auto); related comparison pages (auto, on the universities list).
- **Linked from:** country page; home (universities and scholarships lists); breadcrumbs of each item.

### Course comparison (country + degree + subject)
- **Links to:** every listed course and its university (auto); the same subject in the other launched countries (auto); related subjects in the same country (auto); funding and visa guides (text, in "Paying for it" and "Next steps").
- **Linked from:** country page; home; each listed course and university (auto); guides that discuss that subject (text).

### University
- **Links to:**
  - All its courses (auto, from `sa_programs`; never a typed list of course names). Course names mentioned in the article text link to their course page.
  - The comparison page for each subject it offers (auto).
  - 3–5 similar universities (auto): same country, overlapping subjects, then closest tuition. Never more than 5.
  - Scholarships that apply (auto): the university's own scholarships if listed, then country scholarships at the student's level.
  - Country page (breadcrumb, auto).
  - Guides where the text needs them (text): APS, blocked account, ECTS, visa. At most one link per guide.
  - The calculator for that country's proof of funds (auto, in the cost section).
- **Linked from:** country university list; each of its courses; similar universities; comparison pages; guides that mention it (text); scholarships it hosts (auto).

### Course
- **Links to:** its university (auto); the comparison page (auto); 4–6 most similar courses (auto: same subject and country, ranked by tuition band, then entry rules such as GRE; never alphabetical); scholarships that apply (auto); application guides needed for this course (text: APS, Uni-Assist or the university portal, English tests, visa).
- **Linked from:** its university; its comparison page; similar courses.

### Guide
- **Links to:** the country page (breadcrumb, auto); every university, course, calculator or scholarship it names (text); the topic owner page when it mentions a topic owned elsewhere (text). No closing list of more than 5 related guides (auto, same stage and country).
- **Linked from:** country page (grouped by stage); pages whose text needs it.

### Visa guide
- **Links to:** country page (auto); proof-of-funds calculator (text); blocked account or I-20 guide (text); the other visa guide of the same country only if it covers a different step (text).
- **Linked from:** country page and visa list; universities and courses (one line in "Next steps", auto).

### Loan and money page
- **Links to:** providers through tracked `/study-abroad/out/{id}` links (text); calculators (text); scholarships for the country (auto); country page (auto).
- **Linked from:** the cost section of every university and course page (auto, one line); country page; calculators.

### Calculator
- **Links to:** the guide it supports (text); providers where relevant (tracked); country page (auto).
- **Linked from:** every cost section on universities, courses and money guides (auto, one line).

### International scholarship (main site)
- **New "Plan your study in {country}" block (auto)**, shown when `country_of_study` matches a launched country: the country page, the universities and courses it can be used for (if known), the proof-of-funds calculator, the visa guide.
- For countries not launched yet: link to the scholarships-by-country list only. Never link to a hidden country.
- **Linked from:** country scholarship list; universities and courses it applies to; the Study Abroad home's scholarships block.

## Checks

The route and link check (IS-137) should fail if:
- a page links to a draft, a hidden country, a redirect or a missing page;
- a university page has published courses but does not link to all of them;
- a published university or course page is linked from fewer than 3 other pages;
- a "similar" block has fewer than 3 items when more are available.
