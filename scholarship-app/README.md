# India Scholarships Portal (Scholarship Tracker POC)

A modern Next.js web application for discovering and tracking Indian scholarships, curation pipelines, and eligibility criteria.

## 🚀 Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠️ Project Architecture & Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Database**: local SQLite database (`scholarship.db` / queried via `lib/db.ts`)
- **Deployment**: Automatic Vercel deployment connected to GitHub main branch.

---

## 📋 Content Quality Audit System (Implemented)

We designed and executed a complete content quality audit system to scan the scholarship database and detail pages for formatting gaps, missing metadata, and critical display bugs.

### 1. The Audit Engine
- **Script**: `scripts/content-quality-audit.js`
- **Execution**: Runs locally to parse all SQLite records:
  ```bash
  node scripts/content-quality-audit.js
  ```
- **Funnels Audited**: Missing amounts, expired deadlines, invalid dates, incomplete renewal criteria, empty step-by-step guides, missing helplines/FAQs, and raw HTML tags.

### 2. Audit Reports
- **Markdown Report**: Detailed breakdown of results at [data/content-quality-report.md](file:///Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/data/content-quality-report.md).
- **CSV Database Checklist**: Filterable spreadsheet exported at [data/content-quality-audit.csv](file:///Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/data/content-quality-audit.csv).

---

## 🩹 Completed UI/UX Fixes & Gaps Resolved

We have implemented key layout updates and bug fixes based on the audit outcomes:

1. **Fixed "Up to ₹0k" Similar Opportunities Display**:
   - Upgraded the card lists inside `page.tsx` with a fallback display chain: `amount_annual` -> `amount_min` -> `"Amount Varies"`. Zero/null values no longer display as `₹0k`.
2. **Fixed "Invalid Date" Deadline Output**:
   - Implemented standard date checks and parsing logic inside `ScholarshipCard.tsx`, `ScholarshipDetailTemplate.tsx`, and `page.tsx`.
   - Fallback values such as `"Check Portal"` or `"Open Now"` are displayed if deadline data is absent, `"NA"`, or `"Not specified"`.
3. **Redesigned Similar Opportunities Layout**:
   - Moved the related/similar opportunities container out of the sticky right sidebar to the bottom of the main content column.
   - Refactored it into a responsive, premium 3-column grid for desktop view.
   - Configured `scroll-mt-24` positioning on the container to prevent occlusion from the sticky site header when clicked from Status Check alerts.
4. **Deleted Persistent CTAs and Alert Boxes**:
   - Fully deleted the `MobileStickyCTA` component (`app/components/MobileStickyCTA.tsx`) and references.
   - Removed the `SubscribeForm` container and imports from detail pages to keep focus entirely on applying and official site verification.
5. **Fixed Broken State Hub Link**:
   - Updated the `getAllStates()` query in `lib/db.ts` to omit empty strings and placeholders (like `'All India'`, `'Multiple States'`), fixing the broken `/scholarships-in` link on the main page.
