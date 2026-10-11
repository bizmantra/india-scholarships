# Loan and Money Page Template

`/study-abroad/loans/{slug}` and money guides (blocked account, proof of funds, remittance/TCS, health insurance), stored in `sa_guides` with `kind = 'loan'` or `'guide'`. Shared rules: [README.md](README.md) and the [guide template](GUIDE_PAGE_TEMPLATE.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (Loan and money page).

**The reader:** a parent or student working out how to pay: which loan, which blocked account provider, how much tax on sending money, which insurance.

**The job of the page:** a fair, sourced comparison that helps them choose, and (later) the place where partner income comes from. Trust comes first: a page that looks like an advert earns nothing.

**Today (audit, 11 Oct 2026):** 4 loan pages averaging 287 words, 3 never shown in Google; "education loan" searches are among the largest in the keyword files (60,500 a month); "blocked account germany" (2,900 a month) and the blocked account guide has never appeared in Google. No partner programs are signed (decision 11 Oct 2026: track clicks first, sign up later).

## Sections (comparison pages)

| # | Section | Content |
|---|---|---|
| 1 | **The short answer** | Who each option suits, in 2–4 sentences. No "best" without a stated method. |
| 2 | **Comparison table** | Per provider: interest rate or fee range, collateral rule, maximum amount, processing time, countries covered, as published by the provider, with the date checked. Ranges, not single numbers, where the provider quotes ranges. |
| 3 | **How to choose** | By situation: with or without collateral, course and country, co-applicant income, amount needed. |
| 4 | **Costs people miss** | Processing fees, insurance, moratorium interest, TCS on remittance (sourced from the bank or tax rules). |
| 5 | **How to apply** | Documents and steps common to providers, then provider-specific notes. |
| 6 | **Tax benefit** | Section 80E in brief, linking to the worked-example guide. |
| 7 | **FAQs** | 5–8. |
| 8 | **Sources and method** | Provider pages with dates; how options were compared; the disclosure. |

## Rules specific to money pages

- **Disclosure:** the standard affiliate disclosure component appears on every page with provider links, even before any partnership exists ("some links may become partner links").
- **Provider links:** always through `/study-abroad/out/{id}` (tracked, `rel="sponsored"`). Click tracking is in IS-142.
- **Neutrality:** providers are listed in a stated order (e.g. by interest rate or alphabetically), never by partner status. Partner status never changes the facts.
- **Interest rates and fees** change often: checked within 30 days, shown with the date.
- **No financial advice wording** ("you should take X"); describe who an option suits.

## Checklist

- [ ] Every rate and fee from the provider's own page, checked within 30 days
- [ ] Disclosure and method shown
- [ ] Provider links tracked
- [ ] Calculators linked where amounts are involved
