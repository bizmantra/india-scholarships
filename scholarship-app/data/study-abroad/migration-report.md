# Study Abroad migration report

Run: 2026-09-27 16:35:45. Source: old Study Abroad app database (199 records) + programs.json.

## Rows written
- sa_universities: 45 (duplicates merged: 6)
- sa_guides: 118 (guide 103, visa 11, loan 4)
- sa_programs: 32
- sa_facts: 14
- Scholarships: not copied. 20 redirect to the main site; 9 sent to the Scout as leads (data/study-abroad/scout-leads.json)

## Duplicate universities merged (dropped → kept)
- kit-karlsruhe-institute-of-technology → karlsruhe-institute-of-technology
- tu-berlin-technical-university → tu-berlin
- northeastern-university-boston → neu-northeastern-university
- texas-a-m-university → tamu-texas-a-m
- university-of-texas-dallas → ut-dallas-utd
- university-at-buffalo-suny → suny-buffalo

## Leftover problems in the migrated text (Phase 2)
- "Navigation Breadcrumb" in body: 0
- "Primary SEO Title" in body: 0
- Raw <div> in body: 0
- ".md" link or file name in body: 0
- /Users/ paths: 0
- Universities with no article: 0
- Guides with no article (visa/loan pages built from structured data are expected): 7
- Internal documents set to draft: 7
- Boilerplate summary ("Complete 2026 guide to…"): 137
- Missing summary: 12
- Facts without a source: 14
- Programs kept as draft because their university has no page (7):
  - MS in Computer Science → needs a university page "university-of-cincinnati"
  - MS in Computer Science → needs a university page "illinois-institute-of-technology"
  - MS in Computer Science → needs a university page "new-jersey-institute-of-technology"
  - MS in Computer Science → needs a university page "university-of-north-texas"
  - MS in Computer Science → needs a university page "wright-state-university"
  - MS in Computer Science → needs a university page "university-of-central-missouri"
  - MS in Computer Science → needs a university page "northern-illinois-university"

## Parser warnings (112)
- chemnitz-university-of-technology: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- fau-erlangen-nurnberg: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- heidelberg-university: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- karlsruhe-institute-of-technology: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- leibniz-university-hannover: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- lmu-munich-ludwig-maximilian: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- otto-von-guericke-university-magdeburg: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- rwth-aachen-university: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- saarland-university: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- tu-berlin: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- tu-braunschweig: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- tu-darmstadt: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- tu-dresden: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- tuhh-tuhamburg: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- tum-technical-university-munich: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- university-of-bonn: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- university-of-duisburg-essen: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- university-of-freiburg: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- university-of-hamburg: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 🏷️ Technical SEO & Schema Markup Specification
- university-of-stuttgart: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts
- arizona-state-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- cmu-carnegie-mellon-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- columbia-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- gatech-georgia-tech: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- george-mason-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- neu-northeastern-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- nyu-new-york-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- purdue-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- rutgers-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- san-jose-state-university: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- stevens-institute-of-technology: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- stony-brook-suny: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- suny-buffalo: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- tamu-texas-a-m: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- uc-berkeley: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- uc-irvine-uci: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- uc-san-diego-ucsd: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- university-of-illinois-chicago: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- uiuc-university-of-illinois-urbana-champaign: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- umich-university-of-michigan-ann-arbor: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- uncc-unc-charlotte: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- usc-university-of-southern-california: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- ut-arlington-uta: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- ut-austin: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- ut-dallas-utd: Dropped 2 empty section(s) with nothing left under the heading after chrome extraction: University Overview & Key Financial Facts, Tuition Fees, Total Cost & Financial Breakdown
- germany-routes-hub-guide: Unhandled labeled blockquote "Developer Note" was stripped from the body via the generic catch-all — review otherMeta and consider adding it as a named field if it recurs.
- germany-routes-hub-guide: removed 1 developer section(s): 🔌 Programmatic DB Component Schema: VisaRoutesGrid
- usa-routes-hub-guide: Unhandled labeled blockquote "Developer Note" was stripped from the body via the generic catch-all — review otherMeta and consider adding it as a named field if it recurs.
- usa-routes-hub-guide: removed 1 developer section(s): 🔌 Programmatic DB Component Schema: VisaRoutesGrid
- germany-uni-assist-portal-walkthrough: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 4 Critical Rules for Indian Applicants
- germany-rejection-analysis-appeal: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Decoding the 3 Common Rejection Reasons (Ablehnungsbescheid)
- germany-multiple-offers-decision-matrix: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Real-World Comparison Case Study (3 Common Offer Scenarios)
- germany-initial-72hr-survival-guide: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Part 3: German Transit & Train Travel Basics (Deutsche Bahn)
- germany-anmeldung-tax-id: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 4 Critical Rules Every Indian Student Must Know
- germany-ms-cs-directory: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 4 Critical Rules for Applying to MS CS in Germany
- germany-ms-data-science-directory: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 3 Critical Admission Rules for Data Science Applicants
- germany-engineering-directory: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: 4 Critical Rules for Indian Mechanical & Automotive Applicants
- germany-top-public-unis-profiles: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Detailed Profiles of Key Universities
- germany-tum-efv-entrance-exam-guide: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Stage 1 Scoring Breakdown (Max 100 Points)
- germany-german-language-exams-guide: Dropped 1 empty section(s) with nothing left under the heading after chrome extraction: Detailed Exam Profiles

## Before / after samples
### chemnitz-university-of-technology

Before:
```
# 🇩🇪 University Dossier: Chemnitz University of Technology

> **Navigation Breadcrumb**: `Home` > `Germany Guides` > [GERMANY_MINISITE_HOME](GERMANY_MINISITE_HOME.md) > [DE-HUB-01 Listing Hub](DE-HUB-01-university-listing-hub-guide.md) > **Chemnitz University of Technology Dossier**  
> **Target URL Route**: `/universities/chemnitz-university-of-technology` (Evergreen Slug)  
> **Primary SEO Title**: `Chemnitz University of Technology: MS Fees & Admission Rules for Indian Students 2026`  
> **Meta Description**: `Complete 2026 guide to Chemnitz University of Technology. Check €0 tuition, Bavarian grade cutoff (2.0 Bavarian GPA or better), Anabin H+ status (H+ (Direct Recognition)), and housing costs.`

---

## 📌 Mobile Hero & Sticky Anchor Navigation
> **Sticky Bar**: `[#overview]` | `[#fees-and-costs]` | `[#admission-rules]` | `[#programs]` | `[#faqs]`

---

## 🟢 YMYL E-E-A-T Trust 
```
After:
```
## University Overview & Key Stats

* **University Name**: Chemnitz University of Technology
* **Location**: Germany, Germany
* **Anabin Accreditation Status**: **H+ (Direct Recognition)** ([3yr Bachelor Acceptance](/study-in/germany/germany-3yr-bachelor-acceptance))
* **Tuition Fee**: **€0 (State-Funded Public)** ([Public vs Private](/study-in/germany/germany-public-vs-private))
* **Estimated Living Expenses**: **€934 – €1,200 / month** ([Total Cost Breakdown](/study-in/germany/germany-total-cost-breakdown))
* **Minimum German Grade Cutoff**: **2.0 Bavarian GPA or better** ([Bavarian Grade Ma
```

### fau-erlangen-nurnberg

Before:
```
# 🇩🇪 University Dossier: FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität)

> **Navigation Breadcrumb**: `Home` > `Germany Guides` > [GERMANY_MINISITE_HOME](GERMANY_MINISITE_HOME.md) > [DE-HUB-01 Listing Hub](DE-HUB-01-university-listing-hub-guide.md) > **FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität) Dossier**  
> **Target URL Route**: `/study-abroad/germany/universities/de-uni-fau-erlangen-nurnberg` (Evergreen Slug)  
> **Primary SEO Title**: `FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität) MS Fees & Admission Rules for Indian Students 2026`  
> **Meta Description**: `Complete 2026 guide to FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität). Check tuition fees (€0 (100% Tuition-Free Public)), living costs (€800 - €950 / Month), Bavarian GPA cutoffs (2.3 Bavarian GPA or better (7.8+ Indian CGPA)), and Anabin status.`

---

## 📌 Mobile Hero & Sticky Anchor 
```
After:
```
## Executive Summary: Why Indian Families Choose FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität)

**FAU Erlangen-Nürnberg (Friedrich-Alexander-Universität)** located in **Erlangen / Nuremberg, Bavaria** is a top destination for Indian students seeking Master's degrees in Computer Science, Data Science, and Engineering.

FAU Erlangen-Nürnberg is ranked #1 in Germany for Innovation. Located in the Nuremberg metropolitan region, FAU hosts Siemens Healthineers HQ and Fraunhofer IIS (inventor of the MP3 format).

Key Pillars for Parents and Students:
1. **Industry Hub & Jobs**: Located near
```

### heidelberg-university

Before:
```
# 🇩🇪 University Dossier: Heidelberg University (Ruprecht-Karls-Universität Heidelberg)

> **Navigation Breadcrumb**: `Home` > `Germany Guides` > [GERMANY_MINISITE_HOME](GERMANY_MINISITE_HOME.md) > [DE-HUB-01 Listing Hub](DE-HUB-01-university-listing-hub-guide.md) > **Heidelberg University (Ruprecht-Karls-Universität Heidelberg) Dossier**  
> **Target URL Route**: `/study-abroad/germany/universities/de-uni-heidelberg-university` (Evergreen Slug)  
> **Primary SEO Title**: `Heidelberg University (Ruprecht-Karls-Universität Heidelberg) MS Fees & Admission Rules for Indian Students 2026`  
> **Meta Description**: `Complete 2026 guide to Heidelberg University (Ruprecht-Karls-Universität Heidelberg). Check tuition fees (€1,500 / Semester (State Law for Non-EU Students)), living costs (€850 - €1,050 / Month), Bavarian GPA cutoffs (2.0 Bavarian GPA or better (8.0+ Indian CGPA)), and Anabin sta
```
After:
```
## Executive Summary: Why Indian Families Choose Heidelberg University (Ruprecht-Karls-Universität Heidelberg)

**Heidelberg University (Ruprecht-Karls-Universität Heidelberg)** located in **Heidelberg, Baden-Württemberg** is a top destination for Indian students seeking Master's degrees in Computer Science, Data Science, and Engineering.

Heidelberg University is Germany's oldest university (founded 1386) and a global powerhouse in Medical Technology, Translational Data Science, and Molecular Systems Biology.

Key Pillars for Parents and Students:
1. **Industry Hub & Jobs**: Located near Rhin
```
