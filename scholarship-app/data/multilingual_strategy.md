# 🌐 Multilingual Single-Page Architecture & SEO Strategy

## 1. Executive Summary

We are sunsetting all programmatic multilingual sub-pages (`/[locale]/scholarships/[slug]/[subpage]` and `/[locale]/scholarships-in/[state]/[subpage]`) across all 6 supported regional languages (**Hindi `hi`, Bengali `bn`, Tamil `ta`, Telugu `te`, Odia `or`, Kannada `kn`**).

All localized traffic is consolidated into **Canonical Multilingual Master Detail URLs** (`/[locale]/scholarships/[slug]`) and **Canonical Multilingual Master State Hubs** (`/[locale]/scholarships-in/[state]`).

---

## 2. Database Architecture & Graceful Translation Fallback

Our localized rendering system (`lib/db.ts` $\rightarrow$ `getLocalizedScholarshipBySlug`) queries the SQLite `scholarship_translations` table:

1. **Top 20 High-Volume Scholarships:** Fully translated rows in `scholarship_translations` for all 6 languages (e.g. PM Yashasvi, NSP Post-Matric, UP Post-Matric).
2. **Graceful Fallback for Remaining ~430 Schemes:** If no localized translation row exists for a given locale, `lib/db.ts` automatically falls back to the English column value (`s.title`, `s.eligibility`, `s.docs_needed`).
3. **Zero Maintenance Burden:** This architecture scales seamlessly without requiring manual translation of 450+ scholarships upfront.

---

## 3. Scope & Route Mapping

| Multilingual Route | Issue | Action |
| :--- | :--- | :--- |
| `/[locale]/scholarships/[slug]/[subpage]` | 80% Duplicated Translated Boilerplate | ❌ **Delete Route & 301 Redirect** to `/[locale]/scholarships/[slug]` |
| `/[locale]/scholarships-in/[state]/[subpage]` | 95% Duplicated Translated List Markup | ❌ **Delete Route & 301 Redirect** to `/[locale]/scholarships-in/[state]` |
| `/[locale]/scholarships/[slug]` | Master Multilingual Detail Page | ✅ **Retain 100% & Enhance with Localized Hero & Anchors** |
| `/[locale]/scholarships-in/[state]` | Master Multilingual State Hub | ✅ **Retain 100% & Enhance with Localized State Matrix** |

---

## 4. SEO Metadata & Hreflang Tags

Every Master Multilingual Page outputs complete `alternates` metadata mapping all 6 regional languages to resolve Google Search duplicate indexing issues:

```typescript
alternates: {
    canonical: `https://www.indiascholarships.in/scholarships/${slug}`,
    languages: {
        'x-default': `https://www.indiascholarships.in/scholarships/${slug}`,
        'en': `https://www.indiascholarships.in/scholarships/${slug}`,
        'hi': `https://www.indiascholarships.in/hi/scholarships/${slug}`,
        'bn': `https://www.indiascholarships.in/bn/scholarships/${slug}`,
        'ta': `https://www.indiascholarships.in/ta/scholarships/${slug}`,
        'te': `https://www.indiascholarships.in/te/scholarships/${slug}`,
        'or': `https://www.indiascholarships.in/or/scholarships/${slug}`,
        'kn': `https://www.indiascholarships.in/kn/scholarships/${slug}`,
    }
}
```

---

## 5. Clean 301 Redirect Protocol (`next.config.ts`)

> ⚠️ **CRITICAL BUGFIX:** The redirect keys must **EXACTLY match** the 7 keys defined in `SUBPAGE_METRICS` (`eligibility`, `income-limit`, `documents-required`, `last-date`, `selection-process`, `apply-online`, `renewal-process`).

```typescript
{
  source: '/:locale(hi|bn|ta|te|or|kn)/scholarships/:slug/(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
  destination: '/:locale/scholarships/:slug',
  permanent: true,
},
{
  source: '/:locale(hi|bn|ta|te|or|kn)/scholarships-in/:state/(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
  destination: '/:locale/scholarships-in/:state',
  permanent: true,
}
```

---

## 6. Companion Generated Multilingual Documents

For complete verbatim page copy, localized layout, and passage blueprints of Hindi routes, refer to:

* 📄 **[pm_yashasvi_hindi_detail_page.md](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app/data/pm_yashasvi_hindi_detail_page.md)** *(Hindi Scholarship Detail Page)*
* 📄 **[uttar_pradesh_hindi_state_hub.md](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app/data/uttar_pradesh_hindi_state_hub.md)** *(Hindi State Hub Page)*
