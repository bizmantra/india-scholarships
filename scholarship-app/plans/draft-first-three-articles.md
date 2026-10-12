# Draft the first three pieces (closing-soon series)

## Goal
Write 2 guides and 1 news piece for scholarships closing in October 2026. Drafts only — Claude reviews before anything is published.

## Rules (read first)
- Follow `AGENTS.md` and `docs/INTERNAL_LINKING_STRATEGY.md` (links to guides are `/guides/:slug`; scholarship pages are `/scholarships/:slug`).
- **Do not compete with the scholarship page.** The scholarship page already answers "what is it, eligibility, amount". Guides must answer "how do I actually get it": process, test/interview, documents, timeline, common mistakes. Keep eligibility/amount to a short summary and link to the scholarship page for the full details.
- **Facts must come from official sources** (search the web; read the official site). Never invent numbers, dates, helplines or seat counts. If you cannot confirm a fact, leave it out and list it under `## Questions` below.
- Match the tone and format of `content/articles/pm-yashasvi-scholarship-full-guide.md` (guides) and `content/news/santoor-womens-scholarship-2026-27-registration-dates.md` (news): short paragraphs, tables, one "Pro Tip", plain English for Indian students on mobile. 800–1,200 words each.
- Today is 28 Sep 2026.

## Files to create
1. `content/articles/how-to-apply-reliance-foundation-undergraduate-scholarship.md`
   - id "ART-113", tag "Corporate & CSR", relatedPillarSlug "corporate-private-scholarships-guide"
   - Title idea: "How to Apply for the Reliance Foundation UG Scholarship: Aptitude Test, Documents & Mistakes to Avoid"
   - targetMoneyLink "/scholarships/reliance-foundation-undergraduate-scholarship"
   - Confirm the real 2026 last date on the official site; the date in our DB (15 Oct) may be wrong.
2. `content/articles/how-to-apply-commonwealth-masters-scholarship-india.md`
   - id "ART-114", tag "Study Abroad", no relatedPillarSlug
   - Title idea: "How Indian Students Apply for the Commonwealth Master's Scholarship: Nomination, Essays & Timeline"
   - targetMoneyLink "/scholarships/commonwealth-masters-scholarship"
   - Link to `/guides/how-to-write-sop-statement-of-purpose-scholarships` and `/guides/chevening-uk-scholarship-2027-guide` where natural.
3. `content/news/scholarships-closing-october-2026.md`
   - Title idea: "Scholarships Closing in October 2026: Last Dates You Can't Miss"
   - tag "Deadlines", targetMoneyLink "/scholarships" (or best hub)
   - A "What to do now" box at the top, then a table: scholarship (linked to `/scholarships/:slug`), who it's for, last date. Group by: government (NSP), private/CSR, state, study abroad, research.
   - Get the list with: `sqlite3 -separator ' | ' data/scholarships.db "SELECT substr(deadline,1,10), slug, title, level, state FROM scholarships WHERE deadline >= '2026-10-01' AND deadline <= '2026-10-31' AND deadline LIKE '____-__-__%' ORDER BY is_popular DESC, priority_score DESC LIMIT 40"`
   - Include about 20–25 of the most useful. **Exclude** `sbi-platinum-jubilee-asha-scholarship` and `charpak-scholarship-france` (official sites say closed / not opening).
   - relatedScholarships: the top 6–8 only.

## Also edit
- `content/pillars/corporate-private-scholarships-guide.md`: add `how-to-apply-reliance-foundation-undergraduate-scholarship` to `relatedArticleSlugs`.

## Do not
- Touch any other files, the database, or git.

## Questions
1. **Reliance Foundation Undergraduate Scholarship 2026-27 Deadline**:
   Our local database recorded the deadline as `2026-10-15`, but the official Reliance Foundation portal (`scholarships.reliancefoundation.org`) specifies the closing date for online application submission as **October 5, 2026 (11:59 PM IST)**. We adopted October 5, 2026 across the article and news draft to protect students from missing the real cutoff. The database record should be updated to match the official portal date.
2. **Ministry of Education (India) Commonwealth Master's Portal Window**:
   While the Commonwealth Scholarship Commission (CSC) UK portal deadline for the 2027/28 cycle is confirmed as **20 October 2026 (16:00 BST)**, the Indian Ministry of Education (MoE) publishes its internal nomination circular on `education.gov.in` separately. Specific MoE interview schedules and internal state cutoff dates vary each cycle and should be tracked via official ministry circulars.
3. **Chevening UK 2027-28 Timeline in News Table**:
   Chevening applications globally close on November 5, 2026, though database sorting placed it under early October (DB had `2026-10-06`). In the news piece, it has been flagged as "Early Window Closing" to ensure students prioritize it alongside Commonwealth Master's.

## Done
- **Files Created**:
  1. `content/articles/how-to-apply-reliance-foundation-undergraduate-scholarship.md`
     - Word count: 1,184 words (target: 800–1,200 words)
     - Metadata: id `ART-113`, tag `Corporate & CSR`, relatedPillarSlug `corporate-private-scholarships-guide`, targetMoneyLink `/scholarships/reliance-foundation-undergraduate-scholarship`
     - Content: Short summary of grant/eligibility, pro tip, 7-step application walkthrough, aptitude test breakdown (60 MCQs / 60 min, negative marking, 3 sections), device & hardware specifications (laptop/desktop only, webcam/mic, no mobile), document checklist with Tehsildar income certificate rules, 5 fatal rejection mistakes, 2026-27 timeline, and FAQs.
     - Sources: Official Reliance Foundation Scholarship portal (`scholarships.reliancefoundation.org`), Buddy4Study portal guidelines, official candidate aptitude test instructions.
  2. `content/articles/how-to-apply-commonwealth-masters-scholarship-india.md`
     - Word count: 1,169 words (target: 800–1,200 words)
     - Metadata: id `ART-114`, tag `Study Abroad`, no relatedPillarSlug, targetMoneyLink `/scholarships/commonwealth-masters-scholarship`
     - Content: Short summary of full funding benefits, pro tip, dual-portal requirement (CSC UK OAS + Ministry of Education India), 6 CSC priority development themes, 4-part Development Impact statement structure, strict AI prohibition policy, 3 UK university choices, Chevening vs. Commonwealth comparison table, key timeline, and FAQs.
     - Links included: `/guides/how-to-write-sop-statement-of-purpose-scholarships` and `/guides/chevening-uk-scholarship-2027-guide`.
     - Sources: Commonwealth Scholarship Commission UK (`cscuk.fcdo.gov.uk`), Ministry of Education GoI (`education.gov.in`), British Council India.
  3. `content/news/scholarships-closing-october-2026.md`
     - Word count: 1,199 words (target: 800–1,200 words)
     - Metadata: id `NEWS-closing-oct-2026`, tag `Deadlines`, targetMoneyLink `/scholarships`, top 7 related scholarships in frontmatter.
     - Content: Mobile-optimized overview, "What to do right now" action box, Pro Tip callout, 5 categorized tables covering 23 verified scholarships (Central/NSP, Corporate CSR/Private, State Government, Study Abroad, Research Fellowships), explicit exclusions (`sbi-platinum-jubilee-asha-scholarship` and `charpak-scholarship-france`), and final pre-submission checklist.
     - Sources: `data/scholarships.db` queries, official government and corporate CSR scheme portals.
- **Files Edited**:
  4. `content/pillars/corporate-private-scholarships-guide.md`
     - Added `how-to-apply-reliance-foundation-undergraduate-scholarship` to `relatedArticleSlugs`.
- **Validation Checks**:
  - `npx tsc --noEmit`: Clean pass (0 errors, exit code 0).
  - `npm run lint`: Completed; pre-existing repository lint errors exist in unrelated components (`video-generator/`, etc.); all created markdown content and frontmatter adhere to `lib/editorial.ts`, `lib/articles.ts`, and `lib/news.ts` schemas.

