# Course Comparison Page Template

`/study-abroad/programs/{country}/{degree}/{field}`, e.g. MS Computer Science in Germany. Shared rules: [README.md](README.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (Course comparison).

**The reader:** a student who knows the subject and country and wants to compare programs side by side.

**The job of the page:** own the search "{degree} in {subject} in {country}" with a fair, sourced comparison and real guidance on choosing.

**Today (audit, 11 Oct 2026):** a strong table (1,618 words for Germany MS CS, every figure from the program's page), but many cells show research notes ("Not specified in the official source used here"), TUM's tuition cell is blank, and there is no guidance on choosing. The guides "MS in Computer Science & AI Directory" and "STEM OPT MS CS Directory" compete with it. Data Science comparison pages exist with 1 course each and are not in the sitemap.

## Publish rule

A comparison page is published (and in the sitemap) only with **at least 5 courses** from at least 3 universities. Below that, it stays hidden and its courses link to the university pages only.

## Sections

| # | Section | Content |
|---|---|---|
| 1 | **Intro** | 2–3 sentences: how many programs at how many universities, the key differences (e.g. "most charge no tuition; TUM and KIT charge Indian students tuition"), how data is checked. |
| 2 | **How to choose** | 200–400 words specific to this subject and country: subject-match rules, GRE policies, tuition vs free, teaching language, city costs, intakes. With sources. |
| 3 | **Program cards and comparison table** (auto) | Per program: university, tuition for Indian students, minimum grade rule, English requirement, GRE rule, deadlines, language. Blank values show "Not published", never notes. Sortable by tuition and deadline. |
| 4 | **Paying for it** | Scholarships for this subject and country (auto), calculator, loans line. |
| 5 | **Same subject elsewhere** (auto) | The same comparison in other launched countries, and related subjects in this country. |
| 6 | **FAQs** | 4–6, answered from the table: "Which universities in Germany offer MS Computer Science without GRE?", "Is MS CS free in Germany for Indian students?". |
| 7 | **Sources** | Each program's official page with check date (auto). |

## Fields

The intro, "How to choose" and FAQs are in code today; IS-159 moves them to the database. Table data always comes from `sa_programs`.

## Search

- Target: "{degree} {subject} in {country}", "{subject} masters in {country} for Indian students", "{subject} in {country} without GRE".
- Title (under 65): "MS Computer Science in Germany: Fees, GRE & Deadlines".

## Checklist

- [ ] At least 5 programs from 3 universities
- [ ] No research notes in any cell
- [ ] "How to choose" written for this subject and country
- [ ] Competing directory guides redirected here (IS-149)
