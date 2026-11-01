# Study Abroad — Country Expansion Plan

**Status:** Draft for owner approval (28 Sep 2026).
**Depends on:** `STUDY_ABROAD_RECOVERY_PLAN.md`. That plan says *"Do not start new content or new countries until Phase 2 is done."* This plan respects that: **Step 0 (the template and the fact data) can start now because nothing gets published. Publishing a new country waits for Phase 2.**

Audience stays India-focused. All pages live in `scholarship-app` under `/study-abroad/*` and use the main site design.

---

## 1. Which countries, in what order

| # | Country | Why this position | Money angle |
|---|---|---|---|
| 1 | **UK** | Big Indian intake; 1-year master's; Graduate Route (post-study work). Stable rules make the content easy to keep correct. | Loans, forex, insurance, IHS fee |
| 2 | **Canada** | Highest search volume from India, but rules change often (study permit caps, PAL/TAL, GIC amount). Worth it, but needs the Facts agent running first. | GIC (blocked-account style), loans, forex |
| 3 | **Australia** | Large intake; rules on funds, the Genuine Student test and English scores change often. | OSHC insurance, loans, forex |
| 4 | **Ireland** | Smaller but growing; 1-year master's; Stamp 1G. Cheap to build once UK is done (similar template). | Loans, forex, insurance |
| 5 | France, Netherlands, New Zealand | Only once 1–4 get traffic in GSC. Research only until then. | — |

UK, Canada, Australia and Ireland already exist as hidden empty shells (recovery #15/"Empty countries"). They stay hidden and noindexed until each one passes the launch checklist in §4.

## 2. What "a country" means (minimum launch set)

A country goes live only when it has **all** of these. Fewer pages done well, not many thin ones.

1. **Country hub** — `/study-abroad/study-in/{country}` with real stat cards (tuition range, living cost, proof of funds, visa fee, post-study work). No "Varies".
2. **Visa guide** — one main student visa page (UK Student visa, Canada study permit, Australia subclass 500, Ireland Stamp 2) with fee, funds, documents and timeline, each fact from `sa_facts` with `source_url` + `checked_at`.
3. **Cost of studying** guide — tuition + living, in the local currency and ₹.
4. **Universities** — 10–15 per country, chosen from the ones Indian students search for most (Keyword Research files). Each with its own body text, not a template.
5. **Programs** — MS/MSc Computer Science, Data Science, and MBA/Management first (the same fields that work for Germany/USA). Real per-program fees and entry requirements, never copied values (recovery #23).
6. **Scholarships** — the country listing reads the parent `scholarships` table (`scholarship_scope = 'International'`). Add missing major scholarships (Chevening, Commonwealth, GREAT; Vanier/university awards; Australia Awards/university awards; Government of Ireland IoE) through the Scout inbox, not directly.
7. **Loans page** — reuse existing loan partners; country-specific notes (e.g. Canada GIC).
8. **One calculator** per country:
   - UK: proof-of-funds + IHS calculator
   - Canada: GIC + funds calculator
   - Australia: financial capacity calculator
   - Ireland: funds calculator
9. Affiliate disclosure (recovery #34) on every page with partner links.

## 3. Build steps

### Step 0 — Groundwork (can start now, no publishing)
- [x] **E1.** Make countries data, not code. Today `COUNTRIES` in `scholarship-app/lib/study-abroad/data.ts` hard-codes Germany and USA. Add `uk`, `canada`, `australia`, `ireland` with a `launched: false` flag. Hubs, sitemap and nav show only `launched: true`; others return 404 or noindex.
- [x] **E2.** Build a **country fact sheet** in `sa_facts` for each of the four countries: visa fee, proof-of-funds amount, health surcharge/insurance, post-study work length, English test minimums, intake months. Every row gets an official `source_url` and `checked_at` (recovery rule 4). This is the single source for hub stat cards, visa pages and calculators.
- [x] **E3.** Keyword shortlist per country from `docs/study-abroad/country-expansion-shortlist-uk-canada-australia-ireland.md` → choose the 10–15 universities and the 3 fields per country. Add these terms to rank tracking (with recovery #36).
- [ ] **E4.** Write one **page template per page type** (hub, visa, cost, university, program) as an Agent Center content spec, so new pages come in through gated inbox proposals.

### Step 1 — UK (first country, after Phase 2)
- [ ] **E5.** Hub + visa guide + cost guide (from E2 facts).
- [ ] **E6.** 12 university pages + MSc CS / Data Science / Management programs.
- [ ] **E7.** UK funds + IHS calculator (`/study-abroad/tools/uk-funds-calculator`).
- [ ] **E8.** Scholarships: Chevening, Commonwealth, GREAT + top university awards via Scout.
- [ ] **E9.** Launch checklist (§4) → set `launched: true` → submit sitemap.

### Step 2 — Canada
- [ ] **E10.** Turn on the **Study Abroad Facts agent** first (recovery "New agents"). Canada's numbers change too often to maintain by hand.
- [ ] **E11.** Same set as UK (E5–E9) plus GIC calculator and a "current caps and PAL" page with a visible checked date.

### Step 3 — Australia, then Ireland
- [ ] **E12.** Australia (same set; financial capacity calculator; OSHC through insurance partner).
- [ ] **E13.** Ireland (reuse UK template; Stamp 1G / post-study page).

### Step 4 — Cross-country pages (after at least 3 countries are live)
- [ ] **E14.** Comparison pages: "UK vs Canada vs Australia for Indian students", "MS CS: Germany vs USA vs UK". Needs the methodology note (recovery #34).
- [ ] **E15.** Country picker on `/study-abroad` home driven by `launched` countries.

## 4. Launch checklist for each country

- [ ] Every money/visa number is in `sa_facts` with `source_url` + `checked_at` from the last 90 days.
- [ ] No placeholder values, no identical rows across universities, no boilerplate summaries (recovery rule 5).
- [ ] Each page passes the parent site's data-format gate and route/link check (recovery #15).
- [ ] Titles and descriptions reviewed (no repeated brand, under length).
- [ ] Affiliate disclosure present where partner links appear.
- [ ] Mobile LCP checked on the hub and one university page.
- [ ] Hub added to nav + sitemap; country removed from noindex.

## 5. How we measure it

For each country, 8 weeks after launch:
- GSC impressions and clicks for `/study-abroad/study-in/{country}/*`
- Outbound partner clicks (loans, forex, insurance) per country (recovery #35)
- Ad revenue per section

Next country starts only if the previous one is indexed and showing impressions. If a country gets nothing after 8 weeks, fix it before adding another.

## 6. Rough effort

| Piece | Per country |
|---|---|
| Fact sheet (E2) | 1–2 days |
| Hub + visa + cost pages | 2–3 days |
| 10–15 universities + ~10 programs | 1–2 weeks (via gated inbox) |
| Calculator | 1–2 days |
| Launch QA | 1 day |

About **3 weeks per country** once the template (E1, E4) exists. UK → Canada → Australia → Ireland is roughly one quarter.

## 7. Decisions needed from the owner

1. Approve the order UK → Canada → Australia → Ireland (or swap Canada to first because of its search volume, accepting more upkeep).
2. OK to start Step 0 (E1–E4) now while Phase 2 cleanup is still open?
3. Scope per country: 10–15 universities and 3 fields, as above?
