# Study Abroad page templates

One template per page type. Every page is written, rebuilt and checked against its template, by people and agents alike. Backlog IS-143; source: Study Abroad audit, 11 October 2026.

| Page type | URL | Template | Where its text lives today |
|---|---|---|---|
| Study Abroad home | `/study-abroad` | [HOME_PAGE_TEMPLATE.md](HOME_PAGE_TEMPLATE.md) | Code |
| Country page | `/study-abroad/study-in/{country}` | [COUNTRY_PAGE_TEMPLATE.md](COUNTRY_PAGE_TEMPLATE.md) | Code + `sa_facts` |
| Country lists | `/study-abroad/study-in/{country}/{universities,scholarships,visas,loans}` | [COUNTRY_LIST_TEMPLATE.md](COUNTRY_LIST_TEMPLATE.md) | Code |
| Course comparison | `/study-abroad/programs/{country}/{degree}/{field}` | [COMPARISON_PAGE_TEMPLATE.md](COMPARISON_PAGE_TEMPLATE.md) | Code + `sa_programs` |
| University | `/study-abroad/universities/{slug}` | [UNIVERSITY_PAGE_TEMPLATE.md](UNIVERSITY_PAGE_TEMPLATE.md) | `sa_universities` |
| Course | `/study-abroad/program-detail/{country}/{university}/{slug}` | [COURSE_PAGE_TEMPLATE.md](COURSE_PAGE_TEMPLATE.md) | `sa_programs` (fields to add: IS-158) |
| Guide | `/study-abroad/study-in/{country}/{slug}` | [GUIDE_PAGE_TEMPLATE.md](GUIDE_PAGE_TEMPLATE.md) | `sa_guides` (kind `guide`) |
| Visa guide | `/study-abroad/visas/{slug}` | [VISA_PAGE_TEMPLATE.md](VISA_PAGE_TEMPLATE.md) | `sa_guides` (kind `visa`) |
| Loan and money page | `/study-abroad/loans/{slug}` | [LOAN_PAGE_TEMPLATE.md](LOAN_PAGE_TEMPLATE.md) | `sa_guides` (kind `loan`) |
| Calculator | `/study-abroad/tools/{slug}` | [CALCULATOR_PAGE_TEMPLATE.md](CALCULATOR_PAGE_TEMPLATE.md) | Code |
| International scholarship block | on `/scholarships/{slug}` (main site) | [SCHOLARSHIP_BLOCK_TEMPLATE.md](SCHOLARSHIP_BLOCK_TEMPLATE.md) | To build (IS-146) |

Links for every type: [LINKING_RULES.md](LINKING_RULES.md).

Pages whose text lives in code cannot go through the Agent Center inbox. Backlog IS-159 moves their editable text (intro, guidance sections, FAQs, title and description) into the database.

## Rules shared by every template

These come from the [university template](UNIVERSITY_PAGE_TEMPLATE.md) §1 and §7 and are not repeated in each file.

1. **No fact without an official source**, linked in a Sources section with the check date (`checked_at`). Third-party sites are never the source for a number.
2. **Leave it out rather than guess.** Never show research notes; a missing value shows "Not published by {source}" with the official link.
3. **Written for this page only.** No paragraph copied from another page, except the standard lines (blocked account, APS, I-20, closing line).
4. **Plain, conversational English** for an Indian student and parent. Short sentences, "you", real dates, local currency. No hype ("premier", "holy grail", "hacks", "master manual", "executive summary"), no emoji, no exclamation marks.
5. **Byline on every page:** "By IndiaScholarships Editorial Team. Facts checked {checked_at}."
6. **One owner per search topic.** If another page owns the topic, link to it instead of covering it again.
7. **Titles under 65 characters, descriptions 140–160**, both stating the page's most useful fact.
8. **FAQs** (where the template asks for them): written as people search, direct answer first, consistent with the page.
9. **All content changes go through the Agent Center inbox** for owner approval (IS-147); code changes through pull requests.
