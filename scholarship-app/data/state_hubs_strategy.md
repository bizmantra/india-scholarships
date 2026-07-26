# 🏛️ State Hubs Single-Page Architecture & SEO Strategy

## 1. Executive Summary

We are sunsetting all programmatic state sub-page routes (`/scholarships-in/[state]/[subpage]`) and consolidating state scholarship information into single, high-authority **Master State Hub Pages** (`/scholarships-in/[state]`).

---

## 2. What Was The Problem?

For all 36 state hub locations with $\ge 3$ active schemes (Uttar Pradesh, West Bengal, Karnataka, Maharashtra, Odisha, Bihar, Rajasthan, MP, AP, TN, Delhi, etc.), 7 sub-routes were automatically generated:
1. `/scholarships-in/[state]/eligibility`
2. `/scholarships-in/[state]/income-limit`
3. `/scholarships-in/[state]/documents-required`
4. `/scholarships-in/[state]/last-date`
5. `/scholarships-in/[state]/selection-process`
6. `/scholarships-in/[state]/apply-online`
7. `/scholarships-in/[state]/renewal-process`

### Fatal Flaw: 95%+ Content Duplication
All 7 sub-pages rendered the **exact same table of state scholarships**, extracting only 1 field into Column 2 (e.g. `s.eligibility` vs `s.docs_needed`). They shared identical titles, header markup, sidebars, site footers, and boilerplate text. 

Across 36 states $\times$ 7 subpages, this generated **252 thin state sub-pages**, exposing the site to severe Google Helpful Content System (HCU) penalties.

---

## 3. The Solution: Master State Hub Architecture (Both Table + Cards)

All state scholarship data is consolidated into a single, comprehensive Master State Hub featuring **both Comparison Tables and Interactive Card Lists**:

1. **State Stats & Overview (`#overview`):** Total available schemes, max annual scholarship amount, and 'Open Now' count.
2. **Sticky Mobile Navigation Pill Bar:**
   `[ 📊 Overview ] [ 🎓 All Schemes List ] [ 🎯 Eligibility ] [ 💵 Income Caps ] [ 📄 Documents ] [ 📅 Deadlines ] [ 🔔 State News ]`
3. **Master Comparison Table & Anchor Sections:**
   * `#comparison-matrix` — Master Comparison Table (Name, Category, Amount, Deadline)
   * `#eligibility` — State-wide Eligibility Criteria & Income Limit Breakdown
   * `#documents` — Master Checklist of Mandatory State Documents
   * `#deadlines` — Application Schedules & Deadlines Matrix
4. **Interactive Scholarship Cards List (`<ScholarshipsList>` / `#scholarship-list`):** Rich interactive card layout with thumbnail badges, level filters, category tags, and 'View Details' CTAs.
5. **Local Regional News & Updates (`getNewsForState` / `#state-news`):** Live state portal announcements.

---

## 4. 301 Redirect Protocol (`next.config.ts`)

> ⚠️ **CRITICAL BUGFIX:** The redirect keys must **EXACTLY match** the 7 keys defined in `SUBPAGE_METRICS` (`eligibility`, `income-limit`, `documents-required`, `last-date`, `selection-process`, `apply-online`, `renewal-process`). Using loose aliases like `documents` or `online-application` will result in 404 errors for real crawled URLs.

In `next.config.ts`, add clean dynamic 301 redirects:

```typescript
{
  source: '/scholarships-in/:state/(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
  destination: '/scholarships-in/:state',
  permanent: true,
}
```

---

## 5. Companion Generated State Hub Document

For the complete verbatim page copy, section-by-section layout, and interactive mobile blueprint of a refreshed State Hub with all section anchors fully aligned, refer to:

📄 **[uttar_pradesh_refreshed_state_hub.md](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app/data/uttar_pradesh_refreshed_state_hub.md)**
