# Localized (Hindi/Bengali/Tamil/etc.) content — durable plan

## Background
We tried this once (commits `e281e68`...`7f0dac0`). It translated ~500 scholarship
pages into 6 languages using AI, wrote the output as a frozen copy in
`scholarship_translations`, and served it at `/hi/scholarships/...` etc.

Problems found in the Sep 2026 audit:
- Only 116 of 500 scholarships were ever translated. The other 384 silently
  served English text under a `/hi/` URL.
- Because the translation is a **frozen copy**, it drifts from the English
  source every time the English page is corrected. We found 21 live pages
  quoting scholarship amounts that don't match the current English figures.
- The pages were pulled from the sitemap and blocked in `robots.txt` in July,
  but never actually taken down — they kept building and staying indexed with
  no way for Google to see they'd changed.

That version has now been removed (see `chore/pull-localized-pages`). This
doc is the plan for doing it properly, not a promise to build it next.

## Goal
Serve accurate, current-language pages for scholarships, without creating a
second copy of the data that can go stale.

## Design: translate the shell, not the facts
Numbers, dates, and eligibility rules should **never live in translated
text**. They should be pulled at render time from the same fields the
English page already uses (`amount_annual`, `deadline`, `income_limit`,
`always_open`, etc.) and formatted in the target language. Only the
explanatory prose — what the scholarship is for, how to apply, general
guidance — gets translated.

Concretely:
- Keep one source of truth: the `scholarships` table (English fields +
  structured numeric/date fields already used for filters and cards).
- A `/hi/scholarships/[slug]` page renders the structured fields (amount,
  deadline, eligibility) using the existing English data with Hindi labels
  and number formatting, and only pulls translated text for the free-text
  sections (`intro_seo`, `benefits` narrative, `step_guide` narrative, FAQs).
- Add a lightweight "translation freshness" check: store an
  `english_content_hash` alongside each translation row when it's written.
  If the English row's content hash has changed since, the page shows the
  translated narrative behind an explicit "may be outdated, English is
  current" note, or falls back to English narrative — but the numbers are
  always correct because they're never stored translated.

This is the one decision that matters. Everything else (which pages, which
languages, when) can change; this can't be skipped without repeating the
same failure.

## Scope for a v1
- **Hindi only.** Bengali/Tamil/Telugu/Odia/Kannada wait until Hindi proves
  out and until there's a plan for reviewing translation quality per state.
- **Top 20-30 pages by traffic/impressions** (central government schemes +
  the highest-traffic state schemes), not all 500. Check Search Console for
  which English pages actually get regional-language search demand first.
- Proper `hreflang` + sitemap entries for just those pages, submitted via
  Search Console so indexing is deliberate, not incidental.

## Hinglish/Tanglish/Kanglish
Not as separate URLs — Google mostly reads code-mixed queries as the base
language, and there's no hreflang for "Hinglish," so a dedicated page would
just cannibalize the English one. Instead, teach the scholarship assistant
(`app/assistant/`, `lib/assistant/`) to reply in whatever mix the user types.
That gets the value without creating a duplicate-content problem.

## Steps (when this gets picked up)
1. Decide the top 20-30 pages from Search Console data.
2. Add `locale` route + render structured fields from English data,
   translated narrative from a (rebuilt) translations table.
3. Add the freshness-hash check so a stale translation is visibly flagged
   instead of silently wrong.
4. hreflang + sitemap for just those pages.
5. Watch Search Console for 6-8 weeks before deciding whether to expand
   language or page count.

## Questions
- Do we review AI-translated narrative with a human Hindi speaker before
  publishing, or accept it as-is with the "AI-translated" disclaimer that
  was already on the old pages? Given the wrong-number failure mode, some
  spot-check step is worth it even for narrative text.
- Where does regional-language search demand actually show up in Search
  Console right now, if anywhere, given the pages were blocked for months?

## Done
Not started. This is the plan, not the work.
