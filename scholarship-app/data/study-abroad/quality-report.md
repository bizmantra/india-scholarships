# Study Abroad Content Quality Report

**Target:** `staging` (libsql://india-scholarships-staging-***.aws-ap-south-1.turso.io)
**Generated at:** 2026-10-29T15:26:18.716Z
**Pages Checked:** 177 published pages (45 universities, 108 guides, 24 programs) + 41 facts
**Total Issues:** 408 error(s) (blockers), 0 warning(s) (review)
**Pages Flagged:** 184 with errors, 0 with warnings

## Summary by Rule

| Rule | Description | Severity | Issues Count |
|---|---|---|---|
| Rule 1 | Boilerplate summary (`complete 20xx guide to`), > 220 chars, empty | Error | 118 |
| Rule 2 | seo_title > 70, meta_description outside 110–170, duplicate seo_title | Error | 4 |
| Rule 3 | Banned phrases in body_md, summary, faq_json | Error | 123 |
| Rule 4 | Money/visa fields without official_source or checked_at | Error | 133 |
| Rule 4 | Facts checked_at older than 90 days | Warning | 0 |
| Rule 5 | Identical money values repeated across 4+ in country (recovery #23) | Error | 28 |
| Rule 6 | Internal links to non-existent routes or unlaunched countries | Error | 2 |
| Rule 7 | Published sa_programs whose university_slug is missing or draft | Error | 0 |

### Key Backlog Metrics

- **Boilerplate guide summaries:** 70 (expected ~78 in spec)
- **Boilerplate university summaries:** 37 (expected ~17 in spec)
- **Published guides without sources/checked_at:** 108 (expected ~105 in spec)

## Errors (Blockers)

| Table | ID | Page Path | Rule | Issue Code | Details |
|---|---|---|---|---|---|
| `sa_universities` | `chemnitz-university-of-technology` | `/study-abroad/universities/chemnitz-university-of-technology` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `fau-erlangen-nurnberg` | `/study-abroad/universities/fau-erlangen-nurnberg` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `heidelberg-university` | `/study-abroad/universities/heidelberg-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `leibniz-university-hannover` | `/study-abroad/universities/leibniz-university-hannover` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `otto-von-guericke-university-magdeburg` | `/study-abroad/universities/otto-von-guericke-university-magdeburg` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `saarland-university` | `/study-abroad/universities/saarland-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tu-berlin` | `/study-abroad/universities/tu-berlin` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tu-braunschweig` | `/study-abroad/universities/tu-braunschweig` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tu-darmstadt` | `/study-abroad/universities/tu-darmstadt` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tu-dresden` | `/study-abroad/universities/tu-dresden` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tuhh-tuhamburg` | `/study-abroad/universities/tuhh-tuhamburg` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `university-of-bonn` | `/study-abroad/universities/university-of-bonn` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `university-of-duisburg-essen` | `/study-abroad/universities/university-of-duisburg-essen` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `university-of-freiburg` | `/study-abroad/universities/university-of-freiburg` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `university-of-hamburg` | `/study-abroad/universities/university-of-hamburg` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `university-of-stuttgart` | `/study-abroad/universities/university-of-stuttgart` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `arizona-state-university` | `/study-abroad/universities/arizona-state-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `cmu-carnegie-mellon-university` | `/study-abroad/universities/cmu-carnegie-mellon-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `columbia-university` | `/study-abroad/universities/columbia-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `gatech-georgia-tech` | `/study-abroad/universities/gatech-georgia-tech` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `george-mason-university` | `/study-abroad/universities/george-mason-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `neu-northeastern-university` | `/study-abroad/universities/neu-northeastern-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `nyu-new-york-university` | `/study-abroad/universities/nyu-new-york-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `rutgers-university` | `/study-abroad/universities/rutgers-university` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `stevens-institute-of-technology` | `/study-abroad/universities/stevens-institute-of-technology` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `stony-brook-suny` | `/study-abroad/universities/stony-brook-suny` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `suny-buffalo` | `/study-abroad/universities/suny-buffalo` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `tamu-texas-a-m` | `/study-abroad/universities/tamu-texas-a-m` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `uc-berkeley` | `/study-abroad/universities/uc-berkeley` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `uc-irvine-uci` | `/study-abroad/universities/uc-irvine-uci` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `uc-san-diego-ucsd` | `/study-abroad/universities/uc-san-diego-ucsd` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `uiuc-university-of-illinois-urbana-champaign` | `/study-abroad/universities/uiuc-university-of-illinois-urbana-champaign` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `umich-university-of-michigan-ann-arbor` | `/study-abroad/universities/umich-university-of-michigan-ann-arbor` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `uncc-unc-charlotte` | `/study-abroad/universities/uncc-unc-charlotte` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `usc-university-of-southern-california` | `/study-abroad/universities/usc-university-of-southern-california` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `ut-arlington-uta` | `/study-abroad/universities/ut-arlington-uta` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_universities` | `ut-dallas-utd` | `/study-abroad/universities/ut-dallas-utd` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-routes-hub-guide` | `/study-abroad/study-in/germany/germany-routes-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-routes-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-winter-vs-summer-intakes` | `/study-abroad/study-in/germany/germany-winter-vs-summer-intakes` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-uni-assist-portal-walkthrough` | `/study-abroad/study-in/germany/germany-uni-assist-portal-walkthrough` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-tum-munich-portal-manual` | `/study-abroad/study-in/germany/germany-tum-munich-portal-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-rwth-aachen-portal-manual` | `/study-abroad/study-in/germany/germany-rwth-aachen-portal-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-rejection-analysis-appeal` | `/study-abroad/study-in/germany/germany-rejection-analysis-appeal` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-multiple-offers-decision-matrix` | `/study-abroad/study-in/germany/germany-multiple-offers-decision-matrix` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-initial-72hr-survival-guide` | `/study-abroad/study-in/germany/germany-initial-72hr-survival-guide` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-health-insurance-guide` | `/study-abroad/study-in/germany/germany-health-insurance-guide` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-residence-permit-guide` | `/study-abroad/study-in/germany/germany-residence-permit-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-public-vs-private` | `/study-abroad/study-in/germany/germany-public-vs-private` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-top-public-unis-profiles` | `/study-abroad/study-in/germany/germany-top-public-unis-profiles` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-testas-exam-guide` | `/study-abroad/study-in/germany/germany-testas-exam-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-gre-gmat-germany-guide` | `/study-abroad/study-in/germany/germany-gre-gmat-germany-guide` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-tum-efv-entrance-exam-guide` | `/study-abroad/study-in/germany/germany-tum-efv-entrance-exam-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-scholarship-panel-interview-guide` | `/study-abroad/study-in/germany/germany-scholarship-panel-interview-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-total-cost-breakdown` | `/study-abroad/study-in/germany/germany-total-cost-breakdown` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-education-loans-germany` | `/study-abroad/study-in/germany/germany-education-loans-germany` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-rbi-lrs-tcs-tax-rules` | `/study-abroad/study-in/germany/germany-rbi-lrs-tcs-tax-rules` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-university-listing-hub-guide` | `/study-abroad/study-in/germany/germany-university-listing-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-scholarship-directory-hub-guide` | `/study-abroad/study-in/germany/germany-scholarship-directory-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-visa-routes-hub-guide` | `/study-abroad/study-in/germany/germany-visa-routes-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-uni-assist-manual` | `/study-abroad/study-in/germany/germany-uni-assist-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-sop-europass-cv-guide` | `/study-abroad/study-in/germany/germany-sop-europass-cv-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-national-student-visa` | `/study-abroad/visas/germany-national-student-visa` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-vfs-appointment-hacks` | `/study-abroad/visas/germany-vfs-appointment-hacks` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-vfs-document-checklist` | `/study-abroad/visas/germany-vfs-document-checklist` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-visa-interview-prep` | `/study-abroad/visas/germany-visa-interview-prep` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-part-time-work-rules` | `/study-abroad/study-in/germany/germany-part-time-work-rules` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-securing-werkstudent-jobs` | `/study-abroad/study-in/germany/germany-securing-werkstudent-jobs` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `germany-job-seeker-visa-strategy` | `/study-abroad/study-in/germany/germany-job-seeker-visa-strategy` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `usa-fall-vs-spring-intakes` | `/study-abroad/study-in/usa/usa-fall-vs-spring-intakes` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-gradcas-commonapp-portals` | `/study-abroad/study-in/usa/usa-gradcas-commonapp-portals` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-priority-vs-rolling-deadlines` | `/study-abroad/study-in/usa/usa-priority-vs-rolling-deadlines` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-i20-issuance-deposit-payment` | `/study-abroad/study-in/usa/usa-i20-issuance-deposit-payment` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-rejection-analysis-appeal` | `/study-abroad/study-in/usa/usa-rejection-analysis-appeal` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-multiple-offers-decision-matrix` | `/study-abroad/study-in/usa/usa-multiple-offers-decision-matrix` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-initial-72hr-survival-guide` | `/study-abroad/study-in/usa/usa-initial-72hr-survival-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-ssn-application-guide` | `/study-abroad/study-in/usa/usa-ssn-application-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-health-insurance-waiver-guide` | `/study-abroad/study-in/usa/usa-health-insurance-waiver-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-off-campus-housing-lease` | `/study-abroad/study-in/usa/usa-off-campus-housing-lease` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-destination-overview` | `/study-abroad/study-in/usa/usa-destination-overview` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-public-vs-private-unis` | `/study-abroad/study-in/usa/usa-public-vs-private-unis` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-wes-gpa-40-conversion` | `/study-abroad/study-in/usa/usa-wes-gpa-40-conversion` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-3yr-bachelor-acceptance` | `/study-abroad/study-in/usa/usa-3yr-bachelor-acceptance` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-stem-opt-designated-ms-cs` | `/study-abroad/study-in/usa/usa-stem-opt-designated-ms-cs` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-ms-data-science-business-analytics` | `/study-abroad/study-in/usa/usa-ms-data-science-business-analytics` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-ms-engineering-management-miso` | `/study-abroad/study-in/usa/usa-ms-engineering-management-miso` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-top-us-public-r1-unis` | `/study-abroad/study-in/usa/usa-top-us-public-r1-unis` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-gre-quant-170-strategy` | `/study-abroad/study-in/usa/usa-gre-quant-170-strategy` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-gre-verbal-awa-prep-guide` | `/study-abroad/study-in/usa/usa-gre-verbal-awa-prep-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-toefl-ielts-preparation-guide` | `/study-abroad/study-in/usa/usa-toefl-ielts-preparation-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-duolingo-det-preparation-guide` | `/study-abroad/study-in/usa/usa-duolingo-det-preparation-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-fulbright-interview-prep` | `/study-abroad/study-in/usa/usa-fulbright-interview-prep` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-assistantship-interview-guide` | `/study-abroad/study-in/usa/usa-assistantship-interview-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-total-cost-breakdown` | `/study-abroad/study-in/usa/usa-total-cost-breakdown` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-i20-financial-proof-manual` | `/study-abroad/study-in/usa/usa-i20-financial-proof-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `us-education-loans-guide` | `/study-abroad/study-in/usa/us-education-loans-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-assistantships-ta-ra-ga` | `/study-abroad/study-in/usa/usa-assistantships-ta-ra-ga` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-fulbright-tata-scholarships` | `/study-abroad/study-in/usa/usa-fulbright-tata-scholarships` | Rule 1 | `empty_summary` | Summary is empty |
| `sa_guides` | `usa-on-campus-jobs-20hr-rule` | `/study-abroad/study-in/usa/usa-on-campus-jobs-20hr-rule` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-university-listing-hub-guide` | `/study-abroad/study-in/usa/usa-university-listing-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-scholarship-directory-hub-guide` | `/study-abroad/study-in/usa/usa-scholarship-directory-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-fulbright-scholarship-master-guide` | `/study-abroad/study-in/usa/usa-fulbright-scholarship-master-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-visa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-visa-routes-hub-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-wes-credential-evaluation-manual` | `/study-abroad/study-in/usa/usa-wes-credential-evaluation-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-gpa-conversion-matrix` | `/study-abroad/study-in/usa/usa-gpa-conversion-matrix` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-toefl-ielts-duolingo-cutoffs` | `/study-abroad/study-in/usa/usa-toefl-ielts-duolingo-cutoffs` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-gre-gmat-waiver-directory` | `/study-abroad/study-in/usa/usa-gre-gmat-waiver-directory` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-sop-lor-resume-us-standards` | `/study-abroad/study-in/usa/usa-sop-lor-resume-us-standards` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-work-experience-research-paper-points` | `/study-abroad/study-in/usa/usa-work-experience-research-paper-points` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-prerequisites-deficiency-courses` | `/study-abroad/study-in/usa/usa-prerequisites-deficiency-courses` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-f1-student-visa-master-guide` | `/study-abroad/visas/usa-f1-student-visa-master-guide` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-ds160-form-filing-manual` | `/study-abroad/visas/usa-ds160-form-filing-manual` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `us-consulate-slot-booking-hacks` | `/study-abroad/visas/us-consulate-slot-booking-hacks` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-f1-visa-interview-prep-questions` | `/study-abroad/visas/usa-f1-visa-interview-prep-questions` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-cpt-internship-rules` | `/study-abroad/study-in/usa/usa-cpt-internship-rules` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-opt-stem-opt-extension` | `/study-abroad/study-in/usa/usa-opt-stem-opt-extension` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-h1b-lottery-cap-exempt` | `/study-abroad/study-in/usa/usa-h1b-lottery-cap-exempt` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `usa-green-card-eb2-niw-pathways` | `/study-abroad/study-in/usa/usa-green-card-eb2-niw-pathways` | Rule 1 | `boilerplate_summary` | Boilerplate summary: matches (/^\s*complete 20\d\d guide to/i) |
| `sa_guides` | `germany-routes-hub-guide` | `/study-abroad/study-in/germany/germany-routes-hub-guide` | Rule 2 | `empty_seo_title` | SEO title is empty |
| `sa_guides` | `germany-routes-hub-guide` | `/study-abroad/study-in/germany/germany-routes-hub-guide` | Rule 2 | `meta_description_length` | Meta description length is 0 characters (expected 110–170) |
| `sa_guides` | `usa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-routes-hub-guide` | Rule 2 | `empty_seo_title` | SEO title is empty |
| `sa_guides` | `usa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-routes-hub-guide` | Rule 2 | `meta_description_length` | Meta description length is 0 characters (expected 110–170) |
| `sa_universities` | `fau-erlangen-nurnberg` | `/study-abroad/universities/fau-erlangen-nurnberg` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `heidelberg-university` | `/study-abroad/universities/heidelberg-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `karlsruhe-institute-of-technology` | `/study-abroad/universities/karlsruhe-institute-of-technology` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `lmu-munich-ludwig-maximilian` | `/study-abroad/universities/lmu-munich-ludwig-maximilian` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `rwth-aachen-university` | `/study-abroad/universities/rwth-aachen-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `tu-berlin` | `/study-abroad/universities/tu-berlin` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `tu-darmstadt` | `/study-abroad/universities/tu-darmstadt` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `tu-dresden` | `/study-abroad/universities/tu-dresden` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `university-of-stuttgart` | `/study-abroad/universities/university-of-stuttgart` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `arizona-state-university` | `/study-abroad/universities/arizona-state-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `cmu-carnegie-mellon-university` | `/study-abroad/universities/cmu-carnegie-mellon-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `columbia-university` | `/study-abroad/universities/columbia-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `gatech-georgia-tech` | `/study-abroad/universities/gatech-georgia-tech` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `george-mason-university` | `/study-abroad/universities/george-mason-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `neu-northeastern-university` | `/study-abroad/universities/neu-northeastern-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `nyu-new-york-university` | `/study-abroad/universities/nyu-new-york-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `purdue-university` | `/study-abroad/universities/purdue-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `rutgers-university` | `/study-abroad/universities/rutgers-university` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `stevens-institute-of-technology` | `/study-abroad/universities/stevens-institute-of-technology` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `stony-brook-suny` | `/study-abroad/universities/stony-brook-suny` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `suny-buffalo` | `/study-abroad/universities/suny-buffalo` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `tamu-texas-a-m` | `/study-abroad/universities/tamu-texas-a-m` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `uc-berkeley` | `/study-abroad/universities/uc-berkeley` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `uc-irvine-uci` | `/study-abroad/universities/uc-irvine-uci` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `uc-san-diego-ucsd` | `/study-abroad/universities/uc-san-diego-ucsd` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `uiuc-university-of-illinois-urbana-champaign` | `/study-abroad/universities/uiuc-university-of-illinois-urbana-champaign` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `umich-university-of-michigan-ann-arbor` | `/study-abroad/universities/umich-university-of-michigan-ann-arbor` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `uncc-unc-charlotte` | `/study-abroad/universities/uncc-unc-charlotte` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `usc-university-of-southern-california` | `/study-abroad/universities/usc-university-of-southern-california` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `ut-arlington-uta` | `/study-abroad/universities/ut-arlington-uta` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `ut-austin` | `/study-abroad/universities/ut-austin` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_universities` | `ut-dallas-utd` | `/study-abroad/universities/ut-dallas-utd` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-routes-hub-guide` | `/study-abroad/study-in/germany/germany-routes-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-routes-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-winter-vs-summer-intakes` | `/study-abroad/study-in/germany/germany-winter-vs-summer-intakes` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-uni-assist-portal-walkthrough` | `/study-abroad/study-in/germany/germany-uni-assist-portal-walkthrough` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-tum-munich-portal-manual` | `/study-abroad/study-in/germany/germany-tum-munich-portal-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-rwth-aachen-portal-manual` | `/study-abroad/study-in/germany/germany-rwth-aachen-portal-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-offer-acceptance-payment` | `/study-abroad/study-in/germany/germany-offer-acceptance-payment` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-rejection-analysis-appeal` | `/study-abroad/study-in/germany/germany-rejection-analysis-appeal` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-multiple-offers-decision-matrix` | `/study-abroad/study-in/germany/germany-multiple-offers-decision-matrix` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-initial-72hr-survival-guide` | `/study-abroad/study-in/germany/germany-initial-72hr-survival-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-anmeldung-tax-id` | `/study-abroad/study-in/germany/germany-anmeldung-tax-id` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-health-insurance-guide` | `/study-abroad/study-in/germany/germany-health-insurance-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-residence-permit-guide` | `/study-abroad/study-in/germany/germany-residence-permit-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-destination-overview` | `/study-abroad/study-in/germany/germany-destination-overview` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-fsp-studienkolleg-guide` | `/study-abroad/study-in/germany/germany-fsp-studienkolleg-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-testas-exam-guide` | `/study-abroad/study-in/germany/germany-testas-exam-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-gre-gmat-germany-guide` | `/study-abroad/study-in/germany/germany-gre-gmat-germany-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-tum-efv-entrance-exam-guide` | `/study-abroad/study-in/germany/germany-tum-efv-entrance-exam-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-german-language-exams-guide` | `/study-abroad/study-in/germany/germany-german-language-exams-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-scholarship-panel-interview-guide` | `/study-abroad/study-in/germany/germany-scholarship-panel-interview-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-total-cost-breakdown` | `/study-abroad/study-in/germany/germany-total-cost-breakdown` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-blocked-account-manual` | `/study-abroad/study-in/germany/germany-blocked-account-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-education-loans-germany` | `/study-abroad/study-in/germany/germany-education-loans-germany` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-rbi-lrs-tcs-tax-rules` | `/study-abroad/study-in/germany/germany-rbi-lrs-tcs-tax-rules` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-daad-scholarships-guide` | `/study-abroad/study-in/germany/germany-daad-scholarships-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-financial-emergency-plan` | `/study-abroad/study-in/germany/germany-financial-emergency-plan` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-university-listing-hub-guide` | `/study-abroad/study-in/germany/germany-university-listing-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-daad-scholarship-master-guide` | `/study-abroad/study-in/germany/germany-daad-scholarship-master-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-visa-routes-hub-guide` | `/study-abroad/study-in/germany/germany-visa-routes-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-aps-certificate-guide` | `/study-abroad/study-in/germany/germany-aps-certificate-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-bavarian-grade-matrix` | `/study-abroad/study-in/germany/germany-bavarian-grade-matrix` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-uni-assist-manual` | `/study-abroad/study-in/germany/germany-uni-assist-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-english-language-tests` | `/study-abroad/study-in/germany/germany-english-language-tests` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-german-language-levels` | `/study-abroad/study-in/germany/germany-german-language-levels` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-gre-gmat-waiver-directory` | `/study-abroad/study-in/germany/germany-gre-gmat-waiver-directory` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-sop-europass-cv-guide` | `/study-abroad/study-in/germany/germany-sop-europass-cv-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-vfs-appointment-hacks` | `/study-abroad/visas/germany-vfs-appointment-hacks` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-vfs-document-checklist` | `/study-abroad/visas/germany-vfs-document-checklist` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-visa-interview-prep` | `/study-abroad/visas/germany-visa-interview-prep` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-part-time-work-rules` | `/study-abroad/study-in/germany/germany-part-time-work-rules` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-securing-werkstudent-jobs` | `/study-abroad/study-in/germany/germany-securing-werkstudent-jobs` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-job-seeker-visa-strategy` | `/study-abroad/study-in/germany/germany-job-seeker-visa-strategy` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-blue-card-pr-pathway` | `/study-abroad/study-in/germany/germany-blue-card-pr-pathway` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-fall-vs-spring-intakes` | `/study-abroad/study-in/usa/usa-fall-vs-spring-intakes` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-gradcas-commonapp-portals` | `/study-abroad/study-in/usa/usa-gradcas-commonapp-portals` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-i20-issuance-deposit-payment` | `/study-abroad/study-in/usa/usa-i20-issuance-deposit-payment` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-rejection-analysis-appeal` | `/study-abroad/study-in/usa/usa-rejection-analysis-appeal` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-multiple-offers-decision-matrix` | `/study-abroad/study-in/usa/usa-multiple-offers-decision-matrix` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-initial-72hr-survival-guide` | `/study-abroad/study-in/usa/usa-initial-72hr-survival-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-ssn-application-guide` | `/study-abroad/study-in/usa/usa-ssn-application-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-health-insurance-waiver-guide` | `/study-abroad/study-in/usa/usa-health-insurance-waiver-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-off-campus-housing-lease` | `/study-abroad/study-in/usa/usa-off-campus-housing-lease` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-destination-overview` | `/study-abroad/study-in/usa/usa-destination-overview` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-public-vs-private-unis` | `/study-abroad/study-in/usa/usa-public-vs-private-unis` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-wes-gpa-40-conversion` | `/study-abroad/study-in/usa/usa-wes-gpa-40-conversion` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-3yr-bachelor-acceptance` | `/study-abroad/study-in/usa/usa-3yr-bachelor-acceptance` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-stem-opt-designated-ms-cs` | `/study-abroad/study-in/usa/usa-stem-opt-designated-ms-cs` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-ms-data-science-business-analytics` | `/study-abroad/study-in/usa/usa-ms-data-science-business-analytics` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-ms-engineering-management-miso` | `/study-abroad/study-in/usa/usa-ms-engineering-management-miso` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-top-us-public-r1-unis` | `/study-abroad/study-in/usa/usa-top-us-public-r1-unis` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-gre-quant-170-strategy` | `/study-abroad/study-in/usa/usa-gre-quant-170-strategy` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-gre-verbal-awa-prep-guide` | `/study-abroad/study-in/usa/usa-gre-verbal-awa-prep-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-toefl-ielts-preparation-guide` | `/study-abroad/study-in/usa/usa-toefl-ielts-preparation-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-duolingo-det-preparation-guide` | `/study-abroad/study-in/usa/usa-duolingo-det-preparation-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-fulbright-interview-prep` | `/study-abroad/study-in/usa/usa-fulbright-interview-prep` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-assistantship-interview-guide` | `/study-abroad/study-in/usa/usa-assistantship-interview-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-total-cost-breakdown` | `/study-abroad/study-in/usa/usa-total-cost-breakdown` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-i20-financial-proof-manual` | `/study-abroad/study-in/usa/usa-i20-financial-proof-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `us-education-loans-guide` | `/study-abroad/study-in/usa/us-education-loans-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-assistantships-ta-ra-ga` | `/study-abroad/study-in/usa/usa-assistantships-ta-ra-ga` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-fulbright-tata-scholarships` | `/study-abroad/study-in/usa/usa-fulbright-tata-scholarships` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-on-campus-jobs-20hr-rule` | `/study-abroad/study-in/usa/usa-on-campus-jobs-20hr-rule` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-university-listing-hub-guide` | `/study-abroad/study-in/usa/usa-university-listing-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-scholarship-directory-hub-guide` | `/study-abroad/study-in/usa/usa-scholarship-directory-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-fulbright-scholarship-master-guide` | `/study-abroad/study-in/usa/usa-fulbright-scholarship-master-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-visa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-visa-routes-hub-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-wes-credential-evaluation-manual` | `/study-abroad/study-in/usa/usa-wes-credential-evaluation-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-gpa-conversion-matrix` | `/study-abroad/study-in/usa/usa-gpa-conversion-matrix` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-toefl-ielts-duolingo-cutoffs` | `/study-abroad/study-in/usa/usa-toefl-ielts-duolingo-cutoffs` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-gre-gmat-waiver-directory` | `/study-abroad/study-in/usa/usa-gre-gmat-waiver-directory` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-sop-lor-resume-us-standards` | `/study-abroad/study-in/usa/usa-sop-lor-resume-us-standards` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-work-experience-research-paper-points` | `/study-abroad/study-in/usa/usa-work-experience-research-paper-points` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-prerequisites-deficiency-courses` | `/study-abroad/study-in/usa/usa-prerequisites-deficiency-courses` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-f1-student-visa-master-guide` | `/study-abroad/visas/usa-f1-student-visa-master-guide` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-ds160-form-filing-manual` | `/study-abroad/visas/usa-ds160-form-filing-manual` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `us-consulate-slot-booking-hacks` | `/study-abroad/visas/us-consulate-slot-booking-hacks` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-f1-visa-interview-prep-questions` | `/study-abroad/visas/usa-f1-visa-interview-prep-questions` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-cpt-internship-rules` | `/study-abroad/study-in/usa/usa-cpt-internship-rules` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-opt-stem-opt-extension` | `/study-abroad/study-in/usa/usa-opt-stem-opt-extension` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-h1b-lottery-cap-exempt` | `/study-abroad/study-in/usa/usa-h1b-lottery-cap-exempt` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `usa-green-card-eb2-niw-pathways` | `/study-abroad/study-in/usa/usa-green-card-eb2-niw-pathways` | Rule 3 | `banned_phrase` | Contains banned phrase matching /executive summary/i in body_md |
| `sa_guides` | `germany-routes-hub-guide` | `/study-abroad/study-in/germany/germany-routes-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-routes-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `expatrio-vs-fintiba-vs-coracle` | `/study-abroad/loans/expatrio-vs-fintiba-vs-coracle` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `prodigy-vs-mpower-vs-sbi-loan-usa` | `/study-abroad/loans/prodigy-vs-mpower-vs-sbi-loan-usa` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `us-f1-student-visa-application-checklist` | `/study-abroad/visas/us-f1-student-visa-application-checklist` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_guides` | `aps-india-certificate-verification-step-by-step` | `/study-abroad/visas/aps-india-certificate-verification-step-by-step` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_guides` | `collateral-free-loan-approved-universities` | `/study-abroad/loans/collateral-free-loan-approved-universities` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-student-visa-interview-questions` | `/study-abroad/visas/germany-student-visa-interview-questions` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_guides` | `section-80e-tax-deduction-worked-example` | `/study-abroad/loans/section-80e-tax-deduction-worked-example` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-winter-vs-summer-intakes` | `/study-abroad/study-in/germany/germany-winter-vs-summer-intakes` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-uni-assist-portal-walkthrough` | `/study-abroad/study-in/germany/germany-uni-assist-portal-walkthrough` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-tum-munich-portal-manual` | `/study-abroad/study-in/germany/germany-tum-munich-portal-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-rwth-aachen-portal-manual` | `/study-abroad/study-in/germany/germany-rwth-aachen-portal-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-offer-acceptance-payment` | `/study-abroad/study-in/germany/germany-offer-acceptance-payment` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-rejection-analysis-appeal` | `/study-abroad/study-in/germany/germany-rejection-analysis-appeal` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-multiple-offers-decision-matrix` | `/study-abroad/study-in/germany/germany-multiple-offers-decision-matrix` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-initial-72hr-survival-guide` | `/study-abroad/study-in/germany/germany-initial-72hr-survival-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-anmeldung-tax-id` | `/study-abroad/study-in/germany/germany-anmeldung-tax-id` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-health-insurance-guide` | `/study-abroad/study-in/germany/germany-health-insurance-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-residence-permit-guide` | `/study-abroad/study-in/germany/germany-residence-permit-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-destination-overview` | `/study-abroad/study-in/germany/germany-destination-overview` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-public-vs-private` | `/study-abroad/study-in/germany/germany-public-vs-private` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-ects-credit-mapping` | `/study-abroad/study-in/germany/germany-ects-credit-mapping` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-3yr-bachelor-acceptance` | `/study-abroad/study-in/germany/germany-3yr-bachelor-acceptance` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-ms-cs-directory` | `/study-abroad/study-in/germany/germany-ms-cs-directory` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-ms-data-science-directory` | `/study-abroad/study-in/germany/germany-ms-data-science-directory` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-engineering-directory` | `/study-abroad/study-in/germany/germany-engineering-directory` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-top-public-unis-profiles` | `/study-abroad/study-in/germany/germany-top-public-unis-profiles` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-fsp-studienkolleg-guide` | `/study-abroad/study-in/germany/germany-fsp-studienkolleg-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-testas-exam-guide` | `/study-abroad/study-in/germany/germany-testas-exam-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-gre-gmat-germany-guide` | `/study-abroad/study-in/germany/germany-gre-gmat-germany-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-tum-efv-entrance-exam-guide` | `/study-abroad/study-in/germany/germany-tum-efv-entrance-exam-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-german-language-exams-guide` | `/study-abroad/study-in/germany/germany-german-language-exams-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-scholarship-panel-interview-guide` | `/study-abroad/study-in/germany/germany-scholarship-panel-interview-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-total-cost-breakdown` | `/study-abroad/study-in/germany/germany-total-cost-breakdown` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-blocked-account-manual` | `/study-abroad/study-in/germany/germany-blocked-account-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-education-loans-germany` | `/study-abroad/study-in/germany/germany-education-loans-germany` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-rbi-lrs-tcs-tax-rules` | `/study-abroad/study-in/germany/germany-rbi-lrs-tcs-tax-rules` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-daad-scholarships-guide` | `/study-abroad/study-in/germany/germany-daad-scholarships-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-financial-emergency-plan` | `/study-abroad/study-in/germany/germany-financial-emergency-plan` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-university-listing-hub-guide` | `/study-abroad/study-in/germany/germany-university-listing-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-scholarship-directory-hub-guide` | `/study-abroad/study-in/germany/germany-scholarship-directory-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-daad-scholarship-master-guide` | `/study-abroad/study-in/germany/germany-daad-scholarship-master-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-visa-routes-hub-guide` | `/study-abroad/study-in/germany/germany-visa-routes-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-aps-certificate-guide` | `/study-abroad/study-in/germany/germany-aps-certificate-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-bavarian-grade-matrix` | `/study-abroad/study-in/germany/germany-bavarian-grade-matrix` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-uni-assist-manual` | `/study-abroad/study-in/germany/germany-uni-assist-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-english-language-tests` | `/study-abroad/study-in/germany/germany-english-language-tests` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-german-language-levels` | `/study-abroad/study-in/germany/germany-german-language-levels` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-gre-gmat-waiver-directory` | `/study-abroad/study-in/germany/germany-gre-gmat-waiver-directory` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-sop-europass-cv-guide` | `/study-abroad/study-in/germany/germany-sop-europass-cv-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-national-student-visa` | `/study-abroad/visas/germany-national-student-visa` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-vfs-appointment-hacks` | `/study-abroad/visas/germany-vfs-appointment-hacks` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-vfs-document-checklist` | `/study-abroad/visas/germany-vfs-document-checklist` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-visa-interview-prep` | `/study-abroad/visas/germany-visa-interview-prep` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-part-time-work-rules` | `/study-abroad/study-in/germany/germany-part-time-work-rules` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-securing-werkstudent-jobs` | `/study-abroad/study-in/germany/germany-securing-werkstudent-jobs` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-job-seeker-visa-strategy` | `/study-abroad/study-in/germany/germany-job-seeker-visa-strategy` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `germany-blue-card-pr-pathway` | `/study-abroad/study-in/germany/germany-blue-card-pr-pathway` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-fall-vs-spring-intakes` | `/study-abroad/study-in/usa/usa-fall-vs-spring-intakes` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-gradcas-commonapp-portals` | `/study-abroad/study-in/usa/usa-gradcas-commonapp-portals` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-priority-vs-rolling-deadlines` | `/study-abroad/study-in/usa/usa-priority-vs-rolling-deadlines` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-i20-issuance-deposit-payment` | `/study-abroad/study-in/usa/usa-i20-issuance-deposit-payment` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-rejection-analysis-appeal` | `/study-abroad/study-in/usa/usa-rejection-analysis-appeal` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-multiple-offers-decision-matrix` | `/study-abroad/study-in/usa/usa-multiple-offers-decision-matrix` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-initial-72hr-survival-guide` | `/study-abroad/study-in/usa/usa-initial-72hr-survival-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-ssn-application-guide` | `/study-abroad/study-in/usa/usa-ssn-application-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-health-insurance-waiver-guide` | `/study-abroad/study-in/usa/usa-health-insurance-waiver-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-off-campus-housing-lease` | `/study-abroad/study-in/usa/usa-off-campus-housing-lease` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-destination-overview` | `/study-abroad/study-in/usa/usa-destination-overview` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-public-vs-private-unis` | `/study-abroad/study-in/usa/usa-public-vs-private-unis` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-wes-gpa-40-conversion` | `/study-abroad/study-in/usa/usa-wes-gpa-40-conversion` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-3yr-bachelor-acceptance` | `/study-abroad/study-in/usa/usa-3yr-bachelor-acceptance` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-stem-opt-designated-ms-cs` | `/study-abroad/study-in/usa/usa-stem-opt-designated-ms-cs` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-ms-data-science-business-analytics` | `/study-abroad/study-in/usa/usa-ms-data-science-business-analytics` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-ms-engineering-management-miso` | `/study-abroad/study-in/usa/usa-ms-engineering-management-miso` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-top-us-public-r1-unis` | `/study-abroad/study-in/usa/usa-top-us-public-r1-unis` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-gre-quant-170-strategy` | `/study-abroad/study-in/usa/usa-gre-quant-170-strategy` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-gre-verbal-awa-prep-guide` | `/study-abroad/study-in/usa/usa-gre-verbal-awa-prep-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-toefl-ielts-preparation-guide` | `/study-abroad/study-in/usa/usa-toefl-ielts-preparation-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-duolingo-det-preparation-guide` | `/study-abroad/study-in/usa/usa-duolingo-det-preparation-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-fulbright-interview-prep` | `/study-abroad/study-in/usa/usa-fulbright-interview-prep` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-assistantship-interview-guide` | `/study-abroad/study-in/usa/usa-assistantship-interview-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-total-cost-breakdown` | `/study-abroad/study-in/usa/usa-total-cost-breakdown` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-i20-financial-proof-manual` | `/study-abroad/study-in/usa/usa-i20-financial-proof-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `us-education-loans-guide` | `/study-abroad/study-in/usa/us-education-loans-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-assistantships-ta-ra-ga` | `/study-abroad/study-in/usa/usa-assistantships-ta-ra-ga` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-fulbright-tata-scholarships` | `/study-abroad/study-in/usa/usa-fulbright-tata-scholarships` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-on-campus-jobs-20hr-rule` | `/study-abroad/study-in/usa/usa-on-campus-jobs-20hr-rule` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-university-listing-hub-guide` | `/study-abroad/study-in/usa/usa-university-listing-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-scholarship-directory-hub-guide` | `/study-abroad/study-in/usa/usa-scholarship-directory-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-fulbright-scholarship-master-guide` | `/study-abroad/study-in/usa/usa-fulbright-scholarship-master-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-visa-routes-hub-guide` | `/study-abroad/study-in/usa/usa-visa-routes-hub-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-wes-credential-evaluation-manual` | `/study-abroad/study-in/usa/usa-wes-credential-evaluation-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-gpa-conversion-matrix` | `/study-abroad/study-in/usa/usa-gpa-conversion-matrix` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-toefl-ielts-duolingo-cutoffs` | `/study-abroad/study-in/usa/usa-toefl-ielts-duolingo-cutoffs` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-gre-gmat-waiver-directory` | `/study-abroad/study-in/usa/usa-gre-gmat-waiver-directory` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-sop-lor-resume-us-standards` | `/study-abroad/study-in/usa/usa-sop-lor-resume-us-standards` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-work-experience-research-paper-points` | `/study-abroad/study-in/usa/usa-work-experience-research-paper-points` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-prerequisites-deficiency-courses` | `/study-abroad/study-in/usa/usa-prerequisites-deficiency-courses` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-f1-student-visa-master-guide` | `/study-abroad/visas/usa-f1-student-visa-master-guide` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-ds160-form-filing-manual` | `/study-abroad/visas/usa-ds160-form-filing-manual` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `us-consulate-slot-booking-hacks` | `/study-abroad/visas/us-consulate-slot-booking-hacks` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-f1-visa-interview-prep-questions` | `/study-abroad/visas/usa-f1-visa-interview-prep-questions` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-cpt-internship-rules` | `/study-abroad/study-in/usa/usa-cpt-internship-rules` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-opt-stem-opt-extension` | `/study-abroad/study-in/usa/usa-opt-stem-opt-extension` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-h1b-lottery-cap-exempt` | `/study-abroad/study-in/usa/usa-h1b-lottery-cap-exempt` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_guides` | `usa-green-card-eb2-niw-pathways` | `/study-abroad/study-in/usa/usa-green-card-eb2-niw-pathways` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_universities` | `neu-northeastern-university` | `/study-abroad/universities/neu-northeastern-university` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_universities` | `purdue-university` | `/study-abroad/universities/purdue-university` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_universities` | `suny-buffalo` | `/study-abroad/universities/suny-buffalo` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_universities` | `tamu-texas-a-m` | `/study-abroad/universities/tamu-texas-a-m` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_universities` | `ut-austin` | `/study-abroad/universities/ut-austin` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_universities` | `ut-dallas-utd` | `/study-abroad/universities/ut-dallas-utd` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_programs` | `northeastern-university-boston-ms-in-computer-science` | `/study-abroad/program-detail/usa/neu-northeastern-university/northeastern-university-boston-ms-in-computer-science` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_programs` | `northeastern-university-boston-ms-in-information-systems` | `/study-abroad/program-detail/usa/neu-northeastern-university/northeastern-university-boston-ms-in-information-systems` | Rule 4 | `missing_source` | Missing checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.annual_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.monthly_withdrawal_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.buffer_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.aps.fee_inr` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.vfs.service_fee_inr` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.visa.national_fee_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.fx.eur_inr` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.expatrio_setup_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.fintiba_setup_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.coracle_setup_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.expatrio_monthly_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.fintiba_monthly_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `germany.blocked_account.coracle_monthly_eur` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `usa.visa.f1_mrv_fee_usd` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `usa.visa.sevis_i901_fee_usd` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `usa.living.monthly_average_usd` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_facts` | `usa.fx.usd_inr` | `-` | Rule 4 | `missing_source` | Missing official_source and checked_at for money/visa data |
| `sa_programs` | `tu-berlin-m-sc-computer-science-informatik` | `/study-abroad/program-detail/germany/tu-berlin/tu-berlin-m-sc-computer-science-informatik` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `tu-dresden-m-sc-computer-science` | `/study-abroad/program-detail/germany/tu-dresden/tu-dresden-m-sc-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `saarland-university-msc-in-computer-science-informatics` | `/study-abroad/program-detail/germany/saarland-university/saarland-university-msc-in-computer-science-informatics` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `university-of-stuttgart-ms-in-computer-science` | `/study-abroad/program-detail/germany/university-of-stuttgart/university-of-stuttgart-ms-in-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `tu-darmstadt-msc-computer-science` | `/study-abroad/program-detail/germany/tu-darmstadt/tu-darmstadt-msc-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `fau-erlangen-nurnberg-ms-in-computer-science` | `/study-abroad/program-detail/germany/fau-erlangen-nurnberg/fau-erlangen-nurnberg-ms-in-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `university-of-duisburg-essen-m-sc-computer-science` | `/study-abroad/program-detail/germany/university-of-duisburg-essen/university-of-duisburg-essen-m-sc-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `tu-braunschweig-ms-in-computer-science` | `/study-abroad/program-detail/germany/tu-braunschweig/tu-braunschweig-ms-in-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `university-of-hamburg-msc-data-science-and-artificial-intelligence` | `/study-abroad/program-detail/germany/university-of-hamburg/university-of-hamburg-msc-data-science-and-artificial-intelligence` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `leibniz-university-hannover-msc-in-computer-science` | `/study-abroad/program-detail/germany/leibniz-university-hannover/leibniz-university-hannover-msc-in-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `otto-von-guericke-university-magdeburg-ms-in-computer-science` | `/study-abroad/program-detail/germany/otto-von-guericke-university-magdeburg/otto-von-guericke-university-magdeburg-ms-in-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `chemnitz-university-of-technology-m-sc-computer-science` | `/study-abroad/program-detail/germany/chemnitz-university-of-technology/chemnitz-university-of-technology-m-sc-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `rwth-aachen-master-computer-science` | `/study-abroad/program-detail/germany/rwth-aachen-university/rwth-aachen-master-computer-science` | Rule 5 | `identical_money_tuition_per_year` | Identical tuition_per_year (0) repeated across 13 programs in germany |
| `sa_programs` | `tu-berlin-m-sc-computer-science-informatik` | `/study-abroad/program-detail/germany/tu-berlin/tu-berlin-m-sc-computer-science-informatik` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `tu-dresden-m-sc-computer-science` | `/study-abroad/program-detail/germany/tu-dresden/tu-dresden-m-sc-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `saarland-university-msc-in-computer-science-informatics` | `/study-abroad/program-detail/germany/saarland-university/saarland-university-msc-in-computer-science-informatics` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `university-of-stuttgart-ms-in-computer-science` | `/study-abroad/program-detail/germany/university-of-stuttgart/university-of-stuttgart-ms-in-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `karlsruhe-institute-of-technology-m-sc-computer-science` | `/study-abroad/program-detail/germany/karlsruhe-institute-of-technology/karlsruhe-institute-of-technology-m-sc-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `tu-darmstadt-msc-computer-science` | `/study-abroad/program-detail/germany/tu-darmstadt/tu-darmstadt-msc-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `fau-erlangen-nurnberg-ms-in-computer-science` | `/study-abroad/program-detail/germany/fau-erlangen-nurnberg/fau-erlangen-nurnberg-ms-in-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `university-of-duisburg-essen-m-sc-computer-science` | `/study-abroad/program-detail/germany/university-of-duisburg-essen/university-of-duisburg-essen-m-sc-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `tu-braunschweig-ms-in-computer-science` | `/study-abroad/program-detail/germany/tu-braunschweig/tu-braunschweig-ms-in-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `university-of-hamburg-msc-data-science-and-artificial-intelligence` | `/study-abroad/program-detail/germany/university-of-hamburg/university-of-hamburg-msc-data-science-and-artificial-intelligence` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `leibniz-university-hannover-msc-in-computer-science` | `/study-abroad/program-detail/germany/leibniz-university-hannover/leibniz-university-hannover-msc-in-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `otto-von-guericke-university-magdeburg-ms-in-computer-science` | `/study-abroad/program-detail/germany/otto-von-guericke-university-magdeburg/otto-von-guericke-university-magdeburg-ms-in-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `chemnitz-university-of-technology-m-sc-computer-science` | `/study-abroad/program-detail/germany/chemnitz-university-of-technology/chemnitz-university-of-technology-m-sc-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `tum-technical-university-of-munich-m-sc-informatics` | `/study-abroad/program-detail/germany/tum-technical-university-munich/tum-technical-university-of-munich-m-sc-informatics` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_programs` | `rwth-aachen-master-computer-science` | `/study-abroad/program-detail/germany/rwth-aachen-university/rwth-aachen-master-computer-science` | Rule 5 | `identical_money_living_cost_per_year` | Identical living_cost_per_year (11904) repeated across 15 programs in germany |
| `sa_guides` | `germany-university-listing-hub-guide` | `/study-abroad/study-in/germany/germany-university-listing-hub-guide` | Rule 6 | `broken_internal_link` | Internal link points to non-existent route: /study-abroad/study-in/germany/germany-master-university-profile-guide |
| `sa_guides` | `usa-university-listing-hub-guide` | `/study-abroad/study-in/usa/usa-university-listing-hub-guide` | Rule 6 | `broken_internal_link` | Internal link points to non-existent route: /study-abroad/study-in/usa/usa-master-university-profile-guide |

## Warnings (Review)

*None. No freshness or review warnings.*

