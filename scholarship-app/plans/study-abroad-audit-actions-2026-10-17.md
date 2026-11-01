# Study Abroad audit actions (17 October 2026)

Source: the 11 October Study Abroad audit and the approved recovery plan. Work from the current main branch. Existing university/course templates, inbox support, and some internal link blocks shipped in PRs #53–#60.

## Scope

1. Add a country-aware planning block to international scholarship detail pages. Show only launched country links; for other destinations use the international scholarships directory. Link to country, university list, funding and visa/tool pages when applicable. Do not infer a specific university or course match from country alone.
2. Identify stale/high-risk money and visa claims in the current data. Correct only facts verified on current official sources, with source URL and checked date. Submit content changes through the Study Abroad inbox; do not edit production data directly.
3. Improve the university and course pages with the strongest early search exposure using their existing templates. Source each number and keep unpublished claims out of the page.
4. Review overlap clusters and merge only confirmed duplicate intent/content. Preserve useful information, set a canonical destination and redirect retired URLs.
5. Record a consistent `provider_click` GA4 event for links to `/study-abroad/out/*`, including the provider ID and source page. Keep sponsored disclosure and existing redirects.

## Files

- `app/scholarships/[slug]/page.tsx`
- `app/components/StudyAbroadPlan.tsx` (new)
- `lib/study-abroad/planning.ts` (new)
- `app/study-abroad/_components/ProviderClickTracker.tsx` (new)
- `app/study-abroad/layout.tsx` (new)
- `app/study-abroad/page.tsx`
- `app/study-abroad/_components/blocks.tsx`
- `app/study-abroad/universities/[slug]/page.tsx`
- `app/study-abroad/program-detail/[country]/[university]/[program]/page.tsx`
- `app/study-abroad/_components/calculators/BlockedAccountCalculator.tsx`
- `app/study-abroad/tools/blocked-account-calculator/page.tsx` if its fact sourcing needs correction
- `app/study-abroad/out/[slug]/route.ts`
- `lib/study-abroad/data.ts`
- `next.config.ts` and `lib/study-abroad/redirects.json` only for verified duplicate redirects
- `scripts/study-abroad/` for a read-only audit of claims and overlap
- `scripts/study-abroad/proposals/tum-informatics-2026-10-17.json` for an owner-reviewed content proposal
- This plan for findings and check results

## Checks

- Validate the rendered links against launched routes and the current data.
- Run `npx tsc --noEmit` and `npm run lint` in `scholarship-app`.
- Review the diff for unrelated changes before PR creation.

## Findings

- The current TUM university page already has a sourced article and university/course templates shipped in earlier PRs. The Informatics programme still shows no tuition in its programme row. The proposal in this PR supplies the current €6,000-per-semester figure, application periods, source and checked date, with a warning about TUM's announced 2027/28 increase. It requires owner approval in the Study Abroad inbox; this PR alone does not publish database changes.
- The calculator FAQ incorrectly said an Indian education loan replaces a blocked account. German Missions in India says it is additional proof. The corrected copy links directly to the mission's FAQ.
- The Germany and USA generic routes-hub guide URLs already redirect permanently to their visa-routes guides in `lib/study-abroad/redirects.json`. No second redirect or new merge is warranted without confirming another duplicate pair and preserving unique content.
- The current university/course template displayed country-only scholarship matches as if they were relevant to a specific institution or course. Those pages now link to the country funding directory and ask readers to check eligibility. Country-level pages retain their scholarship cards.
- Production Study Abroad data was not edited directly. A broader money/visa audit requires read access to the live structured records and owner review of each proposed correction.

## Done

- Added country-aware planning links from international scholarship pages and removed unverified course/university scholarship matches.
- Corrected the blocked-account loan FAQ and the Germany landing-card claim; prepared a sourced TUM Informatics proposal for inbox review.
- Confirmed the two reported routes-hub overlaps are already redirected, so no duplicate merge was made.
- Added one `provider_click` GA4 event for Study Abroad provider links and removed the calculator-only event.
- `npx tsc --noEmit`, targeted ESLint and proposal-value validation passed. `npm run lint` fails on pre-existing repository-wide issues (1,210 errors and 2,528 warnings); the touched Study Abroad files pass targeted lint. `git diff --check` passed.
