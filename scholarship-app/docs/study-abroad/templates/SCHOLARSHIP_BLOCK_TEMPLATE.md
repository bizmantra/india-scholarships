# International Scholarship Block Template

A block added to every international scholarship page on the main site (`/scholarships/{slug}` where `scholarship_scope = 'International'`), and its mirror on Study Abroad pages. Shared rules: [README.md](README.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (International scholarship). Backlog IS-146.

**The reader:** a student who found a scholarship (Chevening, DAAD, Fulbright) and now needs to plan the study itself.

**The job of the block:** turn scholarship visitors into Study Abroad readers. The 127 international scholarship pages got about 37,000 Google impressions and 223 clicks in 90 days (to 9 Oct 2026), roughly 100 times Study Abroad, and today none of them link to it.

## On scholarship pages: "Plan your study in {country}"

Placed after the eligibility and amount sections, before FAQs. Generated from data; no typing per scholarship.

| Element | Rule |
|---|---|
| Heading | "Plan your study in {country}" (one country) or "Plan your study abroad" (several). |
| One line | Plain sentence, e.g. "This scholarship covers part of your costs. Here's what studying in Germany costs and how to apply." |
| Country page link | When `country_of_study` matches a launched country. |
| Universities and courses | Only where the scholarship is tied to specific universities or subjects (from a mapping table, see below); up to 4 links. |
| Calculator | Proof-of-funds calculator for the country. |
| Visa guide | The country's "how to apply" visa page. |
| Not launched yet | If the country is not launched (UK, Canada, Australia today): link to the main site's scholarships list for that country only. Never link to a hidden page. |

`country_of_study` holds text such as "Germany", "United States", "United States, United Kingdom, Europe". The block maps these to country slugs; values that map to several launched countries show "Plan your study abroad" with each country.

## On Study Abroad pages: "Scholarships for this {country / university / course}"

| Page | Shows |
|---|---|
| Country page | Top 6 scholarships for the country by traffic, then "see all". |
| University page | The university's own scholarships (from the mapping table), then up to 4 country scholarships at Master's level. |
| Course page | Subject-specific scholarships first (from the mapping table), then up to 3 country scholarships. |
| Comparison page | Scholarships for this subject and country. |

Each item: name, amount (as on the scholarship page), deadline, link to the main-site scholarship page. The main-site scholarship page always owns the scholarship; Study Abroad never copies its details.

## Data needed

- Country slug mapping for `country_of_study` values (code).
- Optional mapping table `sa_scholarship_links` (scholarship id → university slugs and/or subject fields), filled through the inbox for scholarships tied to specific universities or subjects (e.g. TUM waivers, university-specific awards). Most scholarships need only the country.
- Main-site duplicates (Chevening, Commonwealth Master's, Fulbright-Nehru Master's, Rhodes) merged first (IS-152), so links point to one page each.

## Checklist

- [ ] Block appears on all international scholarships whose country is launched; others link to the country scholarship list
- [ ] No links to hidden countries or drafts
- [ ] Study Abroad pages show scholarships from the database, not copied text
- [ ] Clicks from the block are measurable (Analytics event or referrer)
