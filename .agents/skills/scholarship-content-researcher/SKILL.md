---
name: scholarship-content-researcher
description: Research official details (disbursement amount, selection criteria, renewal, helplines, FAQs) for Indian scholarships using web search tools.
---

# Scholarship Content Researcher Skill

This skill allows the agent to systematically research official guidelines for Indian scholarships and enrich the SQLite database with 100% verified, non-hallucinated data.

## Workflow

### 1. Identify Target Scholarships
Run `node scripts/list-gaps.js` inside the `scholarship-app` directory to scan `scholarships.db` and generate a fresh `data/gaps-list.json` of all scholarships that are underperforming (low CTR) and have content gaps.

### 2. Perform Web Research
For each scholarship slug in `data/gaps-list.json`:
1. Use `search_web` to query the official state or corporate portal (e.g., search terms: `"[Scholarship Name] eligibility criteria amount helpline 2025 2026"`).
2. Open and read the official source URLs (prioritize domains like `.gov.in`, `ffe.org`, `tatatrusts.org`, `vidyasaarathi.co.in`, etc.).
3. Cross-reference at least two search results to verify numbers and contact details.

### 3. Extract Structured JSON Data
Ensure the researched data conforms exactly to this schema:
```json
{
  "slug": "scholarship-slug-matching-db",
  "amount_annual": 15000, // Integer (estimated or exact annual amount in INR, 0 if unknown)
  "amount_min": 5000, // Integer (minimum annual amount in INR, 0 if unknown)
  "amount_description": "Detailed description of the amount, payment schedule, and Aadhaar Direct Benefit Transfer (DBT) details.",
  "min_marks": 50, // Integer (minimum percentage marks required, 0 if none/unknown)
  "selection": "Clear description of how candidates are selected (e.g., merit ranking, family income limits).",
  "renewal": "Clear conditions for annual renewal (e.g., passing previous year, no backlogs, attendance) and the process.",
  "helpline": "Official support phone numbers and email address, comma-separated.",
  "official_source": "Official department/provider URL.",
  "apply_url": "Official direct application portal link URL.",
  "faq_json": [
    {
      "question": "Anxiety-solving question 1?",
      "answer": "Clear, verified answer."
    },
    {
      "question": "Anxiety-solving question 2?",
      "answer": "Clear, verified answer."
    },
    {
      "question": "Anxiety-solving question 3?",
      "answer": "Clear, verified answer."
    }
  ]
}
```

### 4. Apply Database Updates
Write the compiled results to a JSON file and run `node scripts/apply-subagent-enrichment.js` to execute a transactional update on `scholarships.db`.

### 5. Verify Build
Run `npm run build` inside `scholarship-app` to verify that Next.js static generation builds successfully with the newly updated database rows.
