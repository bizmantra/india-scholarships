# Architectural Advice & Onboarding Brief for ChatGPT
**Project Name:** IndiaScholarships (Scholarship Decision Engine)  
**Target Audience:** AI Coding Assistants (ChatGPT, Claude, etc.)  
**Author:** Original System Architect  
**Date:** June 27, 2026

---

## 1. Things to Preserve (Do Not Modify)
1. **SQLite-in-Repo Pattern:** Keep the SQLite file local. Do not try to migrate the codebase to a live server PostgreSQL/MySQL instance unless explicitly requested. The zero-cost, zero-latency local SQLite model is foundational.
2. **Slug Year Invariant:** Never allow year numbers (e.g. `2025`, `2026`) in page URL slugs. Slugs must remain evergreen (`/scholarships/pm-yashasvi-scholarship`).
3. **Structured Subpage Routing:** Maintain the nested subpage structure (e.g., `/eligibility`, `/documents-required`). These match exact search queries and build density.
4. **Google Search Grounding in Ingestion:** Keep the Google Search grounding tools in the AI scripts. Raw LLM generations without Search tools will cause critical factual hallucinations.
5. **Static Site Generation (SSG):** All dynamic listing pages and dynamic directories must export `generateStaticParams()` to compile static HTML. Do not convert these to dynamic, server-side-rendered runtime routes.

---

## 2. Things to Question & Review
1. **Messy Text Mappings in `utils.ts`:** The hardcoded `CATEGORY_SLUG_MAP` string lists are brittle. Question this mapping and refactor it into clean database category records.
2. **Denormalized SQLite schema:** The single-table layout will break when adding non-scholarship domains (Colleges, Jobs). Challenge the current flat layout and propose a polymorphic schema.
3. **Missing Automated Testing:** There are no automated tests checking sitemap compilations or link routing. Propose tests for sitemap formats.
4. **Hardcoded Year Filters in Scripts:** Some ingestion scripts contain hardcoded search references for specific years. Refactor them to pull the current system year dynamically.

---

## 3. Areas to be Opinionated
1. **Factual Accuracy Policy:** Reject any code edits that generate fallback dummy values or mock data. Inaccurate info breaks student trust and search rankings.
2. **Gen-Z Visual Aesthetics:** Enforce premium design rules. Avoid browser default dropdowns, plain colors, and table interfaces. Use custom HSL cards, rounded pills, icons, and smooth transitions.
3. **Edge Optimization:** Block any library dependencies that increase serverless cold start times or enlarge client bundles.

---

## 4. Areas to Avoid Making Assumptions
1. **Indian Castes and Reservation Categories:** The differences between SC, ST, OBC, EBC, General EWS, and religious minorities are highly specific. Never simplify, merge, or translate these categories.
2. **Domicile Residency Rules:** "Domicile" in India is a legally validated status. A student studying in Karnataka who is originally from Odisha has different eligibility profiles. Keep domicile checks strict.
3. **Income Limits:** Threshold limits (e.g., ₹1 Lakh, ₹2.5 Lakh, ₹5 Lakh) represent official legal boundaries for government schemes. Never approximate or guess these limits.

---

## 5. Major Architectural Pitfalls
* **SQLite Write Locks in Serverless:** Never execute SQL write queries during a visitor's page request. Serverless execution environments will lock up if concurrent write connections hit the SQLite file. Keep the frontend database read-only.
* **Build-Time Memory Limits:** Next.js can exhaust memory when generating static HTML params for over 10,000 paths at build time. Implement dynamic chunking or fallback routes (`fallback: 'blocking'`) if dataset sizes scale rapidly.
* **Broken Internal Anchor Paths:** Moving routes without updating the internal linking query maps will break sitemaps and cause search indexing drops.

---

## 6. Product Philosophy & Vision
* **Quality over Quantity:** Having 200 fully verified, highly detailed, date-stamped scholarships is significantly better than having 10,000 parsed or outdated records.
* **Decision Engine over Directory:** The site does not exist to list data. It exists to verify, score, rank, and guide students step-by-step.
* **The AI-Enabled Future:** The codebase is designed to be maintained by a team of 1-2 people using AI loops. Do not write complex, developer-heavy code. Keep configurations declarative and code simple.

---

## 7. Product Manager (PM) Context: Brand Identity & AI Guidelines

### Guarding the Core Metric: "Brand Trust"
As an AI model reviewing this codebase, your primary constraint is **Trust Preservation**. If a student applies to a scholarship using our details and finds an outdated deadline or incorrect income threshold, we lose them permanently.
* **Zero-Hallucination Mandate:** Never suggest code changes that generate fallback strings or fill empty columns with generalized text. It is always better to display "Check Official Notification" than to guess.
* **Date-Stamping:** Always maintain the date-stamp validation UI block. Proving data freshness is our number one selling point against older, cluttered competitors.

### AI Development Directive: Keep It Lean
* **Low-Maintenance Code:** Do not recommend heavy runtime architectures, microservices, or complex backend dashboard logic. The product must remain cheap to host (serverless) and easy for a single developer to maintain.
* **Opinionated UX Guidelines:** When recommending visual changes, prioritize mobile-first interfaces, touch target size, clean typography, and fast page load times over complex animations or multi-step form funnels. Speed is a key SEO and user retention metric.

