# Study Abroad content rules (tone, headings, intros, jargon)

Restored from the retired `Study-Abroad-IS` repo (`docs/internal-specs/STUDY_ABROAD_CONTENT_RULES.md`), which was not carried over in the September 2026 cut-over. This file is the authority for **how study-abroad prose is written**. The page *structure* lives in [templates/](templates/README.md); the two work together. See [PORT_MAP.md](PORT_MAP.md) for what else came from the old repo.

## 1. Audience and tone

- **Readers:** Indian students, and the parents who often fund the education and need visas and money explained simply.
- **Reading level:** Grade 6–8 English (B1/B2). Sentences under 15 words. Active voice. No corporate jargon or passive phrasing.
- **Persona:** a knowledgeable, supportive mentor. Never a high-pressure salesperson or a distant institution.
- The shared rules in [templates/README.md](templates/README.md) still apply (no hype words, no emoji, no exclamation marks, byline, sources).

## 2. Headings: direct, human English

| Avoid | Use |
|---|---|
| Embassy & Consulate Roadmap | Step-by-Step Visa Process / Embassy & Interview Steps |
| Side-by-Side Provider Comparison Matrix | Compare Your Options Side-by-Side |
| Verified Financial Comparison | Compare Loans & Blocked Accounts |
| Cost Comparison vs Peer Universities | How Costs Compare to Similar Universities |
| Document Verification Requirements | Documents You Need |
| Financial Proof Thresholds | Money You Need to Show |
| Tuition & Fee Structure Breakdown | Tuition & Living Expenses |
| Admission Eligibility Criteria | What You Need to Get In |

## 3. Opening two sentences (detail pages)

Start every detail page with a friendly, direct answer to the search intent, then promise what the page gives (fees, timelines, checklist).

- Visa: "Getting your US F-1 student visa doesn't have to be overwhelming. Here is the step-by-step checklist of documents you need, total fees, and tips to pass your embassy interview."
- Loan or blocked account: "Choosing the right loan or blocked account can save you thousands of dollars. We compared popular options side-by-side on interest rates, processing fees, and payout speed so you can pick what works best."
- University: "Thinking of studying at Technical University of Munich? Here is what it really costs to live and study here, entry requirements, and how tuition compares to other top German universities."

(The title and description rules in the templates still decide length; this section is about the first two sentences of the body.)

## 4. Jargon: keep the official term, always explain it

Keep official terms, because students see them on government sites. Never assume the reader knows them. **On first use in a page, put a one-sentence plain explanation next to the term**, inline or in a short callout. The list and approved wording are in [TERMS.md](TERMS.md). Add new terms there.

> The old site did this with a `TermCallout` component. The live site has no such component. Until one is built, define terms inline. If a component is built later, it should read from the same list as TERMS.md.

## 5. Readability

- Use bullet lists over long paragraphs.
- Bold every cost, fee and timeline (**₹18,000 APS fee**, **4–6 weeks processing**).
- Numbers must still come from an official source with a check date; the examples above are style, not facts.
