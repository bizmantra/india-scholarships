# Calculator Page Template

`/study-abroad/tools/{slug}` (blocked account, I-20 cost, Bavarian grade, RBI LRS/TCS). Shared rules: [README.md](README.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (Calculator).

**The reader:** someone who needs a number now: how much to deposit, what my German grade is, how much TCS I pay.

**The job of the page:** give a correct answer in seconds, explain how it was worked out, and lead to the next step.

**Today (audit, 11 Oct 2026):** 5 pages, median 225 words, all appearing in Google at an average position of 7. Calculators were used 5 times in two weeks. Almost nothing links to them.

## Sections

| # | Section | Content |
|---|---|---|
| 1 | **The calculator** | First on the page, usable without scrolling on a phone. Inputs prefilled with a realistic example. Every rule and amount it uses comes from `sa_facts` (never hard-coded), so a rule change is made once. |
| 2 | **Your result explained** | Shown under the result: what the number means and what to do with it. |
| 3 | **How it's calculated** | The formula or rule in plain words, with the official source and checked date (e.g. the Bavarian formula, the blocked account amount, the TCS rates). |
| 4 | **Next step** | Links to the guide it supports and, where relevant, the provider comparison. |
| 5 | **FAQs** | 3–5, e.g. "Is the blocked account amount the same for every city?". |

## Rules

- Numbers used by the calculator are read from `sa_facts` with `checked_at`; the page shows "Rules checked {date}".
- Each calculator use is recorded as an Analytics event (already done for the blocked account and I-20 calculators; add to the others).
- No sign-up or email gate to see the result.

## Checklist

- [ ] All amounts and rates read from `sa_facts`, with source and date
- [ ] Works and is readable at phone width
- [ ] Usage event recorded
- [ ] Linked from every relevant cost section (automatic block)
