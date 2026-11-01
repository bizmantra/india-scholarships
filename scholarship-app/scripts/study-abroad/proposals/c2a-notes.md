# C2a — Germany sources & checked dates (2026-10-30)

Handoff item 2 (content spec C2a, Germany half). Agent: `sa-germany-sources` (DeepSeek). Prepared for `lead`, who commits and submits — this batch was **not** written to staging by me.

**Database used: staging**, not production. Credentials came from the old `study-abroad-merge` worktree's `.env.local` (as the env notes say). `describe()` masks the URL; it is `libsql://india-scholarships-staging-***.aws-ap-south-1.turso.io`. Every "before" number below is from staging on 2026-10-30. Production numbers (in `/tmp/sa-handoff/targets-germany.md`) are different and are **not** the ones I counted.

**No repo files were written.** The platform sandbox for this session only allows writes inside `…/Scholarship-Tracker-POC-antigravity/Study-Abroad/` (plus `/tmp`); every write outside it is denied and `sandbox_permissions: danger-full-access` is auto-rejected. So no worktree, no branch, no commit, no PR, and no edit to `official-domains.json` or `proposals/`. All artefacts are in `/tmp/sa-germany/` for the Lead to commit:
- `/tmp/sa-germany/c2a-sources-germany-2026-10-30.json` — 12 pages: `official_source` + `checked_at` `2026-10-30`
- `/tmp/sa-germany/c2a-corrections-germany-2026-10-30.json` — 1 page: corrected `body_md` + `official_source` + `checked_at`
- `/tmp/sa-germany/c2a-notes.md` — this file
- `/tmp/sa-germany/evidence.json` — machine-readable (slug, role, URL, quote) used by the self-check
- `/tmp/sa-germany/selfcheck.cjs` + `/tmp/sa-germany/selfcheck.txt` — live re-fetch of every quoted URL
- `/tmp/sa-germany/dryrun-sources.txt`, `/tmp/sa-germany/dryrun-corrections.txt` — real validator output
- `/tmp/sa-germany/pages/` — every HTML/PDF I quoted from, saved today

## 1. Counts (staging, 2026-10-30)

| Measure | Before this batch | After both files are applied |
|---|---|---|
| Published `sa_guides` with `country='germany'` | 54 | 54 |
| …with no `official_source` | 52 | 39 |
| …with no `checked_at` | 54 | 41 |
| …with both | 0 | 13 |
| Pages in this batch | — | **13 (+15 gaps examined = 28 touched, 26 untouched)** |

(52 − 12 sources-file pages = 40, − 1 corrections-file page = 39. 54 − 12 = 42, − 1 = 41. Arithmetic on the staging snapshot read today; nothing was written, so re-count after submitting.)

## 2. Sources used (each fetched with `curl`, saved to `/tmp/sa-germany/pages/`, 2026-10-30)

| # | Source | HTTP | Used for |
|---|---|---|---|
| 1 | https://india.diplo.de/in-en/service/2756350-2756350 — German Missions in India, "Studies, including preparatory college and language courses for intended studies" (page dated 16.02.2026) | 200 | blocked account, national student visa |
| 2 | https://www.auswaertiges-amt.de/en/sperrkonto/388600 — Federal Foreign Office, "Opening and closing a blocked bank account" | 200 | blocked account (no provider endorsement) |
| 3 | https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202 — German Missions in India, remonstration abolition | 200 | national student visa (rejection appeal) |
| 4 | https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html — § 16b AufenthG (official statute text) | 200 | part-time work, residence permit |
| 5 | https://www.gesetze-im-internet.de/aufenthg_2004/__20.html — § 20 AufenthG | 200 | job-seeker visa |
| 6 | https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html — § 18c AufenthG | 200 | Blue Card PR, language levels correction |
| 7 | https://www.gesetze-im-internet.de/bmg/__17.html — § 17 Bundesmeldegesetz | 200 | Anmeldung |
| 8 | https://www.uni-assist.de/en/faqs/apply-online/ — uni-assist, Apply online FAQs | 200 | both uni-assist pages |
| 9 | https://aps-india.de/wp-content/uploads/2026/06/Leaflet_BA_Graduates_English_dMAT_June2026.pdf — APS India "Information Leaflet for Individual Procedure", valid as of June 2026 (the same PDF production already cites) | 200 | APS guide |
| 10 | https://www.zoll.de/EN/Private-individuals/Travel/Entering-Germany/entering_germany_node.html — German Customs, entering Germany | 200 | 72-hour survival guide |
| 11 | https://www.tk.de/resource/blob/2098336/8daddb6343be1fb6f8cc46b4313a21e3/beitraege-der-tk--englisch-data.pdf — TK "TK Contributions as of 1 January 2026" | 200 | health insurance |

Not reachable today (so those pages are gaps, not "verified"): **daad.de 403** (bot protection), **daad.in 403**, **study-in-germany.de 403**, **goethe.de 403**, **make-it-in-germany.com** serves a Radware bot-challenge page (HTTP 200 but no content), **bamf.de connection reset** (from the env notes; not retried), **testdaf.de/en 500**. `port-of-spain.diplo.de` does quote the blocked account rule, but I used the Indian mission's own page instead.

## 3. Verdict table

### 3a. Verified — 12 pages (`c2a-sources-germany-2026-10-30.json`)

All quotes below are verbatim from the saved page and were re-checked by re-fetching the URL (section 5). "Also on page, not verified" lists claims inside the same article that no official page I fetched today confirms — the `checked_at` covers the central claims listed in column 4, not those. They are candidates for the next pass or for the owner to cut.

| # | Page (slug) | Proposed `official_source` | Verbatim quote (from the fetched page) | Claims this confirms | Also on page, **not** verified |
|---|---|---|---|---|---|
| 1 | `germany-blocked-account-manual` | https://india.diplo.de/in-en/service/2756350-2756350 | "currently amounting to 11,904.—EUR and with a blocking confirmation stating that no more than 992.—EUR per month can be withdrawn" | total **€11,904**, payout **€992/month** | Provider fee table (Expatrio €119 / Fintiba €159 / Coracle €99, monthly €9/€9.90/€0), €100 buffer, refund timelines, "100% refund on visa rejection" |
| 1b | (same page, corroborating) | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | "You are free to choose where to open your account." / "The Federal Foreign Office does not make any recommendations and does not accept any liability for failed payment on the part of providers." | no official provider list; parents may choose any provider (matches the page's own correction) | — |
| 2 | `germany-national-student-visa` | https://india.diplo.de/in-en/service/2756350-2756350 | "you almost always require a certificate from Akademische Prüfstelle (APS) in order to be able to admitted to university in Germany" (sic, official page wording) / "If you intend to enter degree studies (Bachelor or Master) right away, generally the required level of knowledge is C1, regardless if the studies are in German or English." | APS practically mandatory for Indian applicants; C1 language level for direct degree entry | **€75** visa fee, VFS **₹1,500** service fee, **4–8 week** processing, "1-year multi-entry" validity, approved-insurance list, "1 July 2025" framing (the mission page says worldwide abolition from 1 July 2025, but India's process was already abolished 1 Jan 2024 — see gap note) |
| 2b | (same page, corroborating) | https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202 | "The Federal Foreign Office decided to abolish the remonstration procedure for visa rejections worldwide from 1st July 2025." | remonstration is gone; refusal leaves new application / court | — |
| 3 | `germany-part-time-work-rules` | https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html | "Die Aufenthaltserlaubnis berechtigt nach Maßgabe der folgenden Sätze nur zur Ausübung von Beschäftigungen, die insgesamt bis zu 140 Arbeitstage im Jahr nicht überschreiten dürfen (Arbeitstagekonto). Studentische Nebentätigkeiten werden nicht angerechnet." / "Die Beschäftigungen können für jeden Tag, an dem die Arbeitszeit bis zu vier Stunden beträgt, als halber Arbeitstag, ansonsten als voller Arbeitstag auf das Arbeitstagekonto angerechnet werden" / "während der Vorlesungszeit, wenn sie bis zu 20 Stunden je Kalenderwoche ausgeübt werden" | **140 full days** a year (280 half-days), ≤4 h counts as half a day, **20 h/week** in term time, student side jobs (HiWi) not counted | **€13.90/h** minimum wage, **€12,348** tax-free allowance, Minijob **€603/month**, ~€141 insurance, "90%+ net", Werkstudent 9.3% pension |
| 4 | `germany-job-seeker-visa-strategy` | https://www.gesetze-im-internet.de/aufenthg_2004/__20.html | "Sie wird in den Fällen des Absatzes 1 Nummer 1 bis 4 für einen Zeitraum von bis zu 18 Monaten erteilt." / "wird einem Ausländer nach erfolgreichem Abschluss eines Studiums im Bundesgebiet im Rahmen eines Aufenthalts nach § 16b oder § 16c eine Aufenthaltserlaubnis erteilt" | **18-month** post-study job-search permit under § 20 | "100% unrestricted work rights", **€100** permit fee, ~€992/month funds, Chancenkarte 12-month comparison, Fiktionsbescheinigung advice |
| 5 | `germany-blue-card-pr-pathway` | https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html | "Abweichend von Absatz 1 ist dem Inhaber einer Blauen Karte EU eine Niederlassungserlaubnis zu erteilen, wenn er mindestens 27 Monate eine Beschäftigung nach § 18g ausgeübt hat" / "Die Frist nach Satz 1 verkürzt sich auf 21 Monate, wenn der Ausländer über ausreichende Kenntnisse der deutschen Sprache verfügt." | **27 months** to PR on a Blue Card, **21 months** with sufficient German (B1) | 2026 salary thresholds **€50,700 / €45,934** (the statute gives only 50 % / 45.3 % of the pension contribution ceiling — no official euro figure fetched), 5-year citizenship, €25 "Leben in Deutschland" test |
| 6 | `germany-anmeldung-tax-id` | https://www.gesetze-im-internet.de/bmg/__17.html | "Wer eine Wohnung bezieht, hat sich innerhalb von zwei Wochen nach dem Einzug bei der Meldebehörde anzumelden." | **register within 2 weeks** of moving in | tax ID arrives in 2–4 weeks, €5 admin fee, "booking within 14 days = complied", Ummeldung 14 days, Wohnungsgeberbestätigung detail |
| 7 | `germany-uni-assist-manual` | https://www.uni-assist.de/en/faqs/apply-online/ | "costs EUR 75.00 for your first chosen study course in a semester. Each additional chosen study course in the same semester costs EUR 30.00" / "You will usually receive your evaluation result within 4 to 6 weeks" / "at least 8 weeks before the application deadline expires" | **€75** first application, **€30** each extra, processing **4–6 weeks**, apply ≥8 weeks early | Page's table says processing **"4 to 8 weeks"** — official is 4–6 (see "Discrepancies" §4); VPD route details, "up to 8 weeks in June/July", examples of universities per route |
| 8 | `germany-uni-assist-portal-walkthrough` | https://www.uni-assist.de/en/faqs/apply-online/ | (same fee quote) / "You will usually receive your evaluation result within 4 to 6 weeks" | same as #7: fees and processing window; the FAQ describes creating one account, choosing courses, uploading documents and paying per course | "4 to 8 weeks" (same discrepancy), 10 MB PDF limit, applicant-ID format, 10–14 days wire matching, portal screen names |
| 9 | `germany-aps-certificate-guide` | https://aps-india.de/wp-content/uploads/2026/06/Leaflet_BA_Graduates_English_dMAT_June2026.pdf | "Transfer the APS procedure fee of 18,000/- INR to the APS bank account" / "The verification fee amounts to 18,000/- INR." | **₹18,000** APS fee, non-refundable; document list, courier to the German Embassy, digital certificate, B2 language note (all in the same leaflet) | Processing time **4–12 weeks** (leaflet states no timeline), professor-verification timing, dMAT specifics |
| 10 | `germany-initial-72hr-survival-guide` | https://www.zoll.de/EN/Private-individuals/Travel/Entering-Germany/entering_germany_node.html | "You must declare funds of 10,000 euros or more." | **€10,000+ cash/forex must be declared** at customs | 25 % fine, red/green channel procedure, food/meat rules, Sunday shop closure, train/ticket details, SIM advice |
| 11 | `germany-health-insurance-guide` | https://www.tk.de/resource/blob/2098336/8daddb6343be1fb6f8cc46b4313a21e3/beitraege-der-tk--englisch-data.pdf | "to health insurance (including the TK-specific additional contribution of 23 EUR) 110.38 EUR" / "to long-term care insurance (including a supplementary contribution for members without children) 35.91 EUR" | 2026 TK student contribution: **€110.38** health + **€35.91** long-term care = **€146.29/month** for a childless student over 23 (the page says "~€141–146"; €141.16 is the under-23 rate — close, not contradicted) | Private/Mawista €35–60 (commercial), over-30 "€250+", M10 notification mechanics, "irrevocable" claim, €5 pharmacy co-pay |
| 12 | `germany-residence-permit-guide` | https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html | "Die Geltungsdauer der Aufenthaltserlaubnis beträgt bei Ersterteilung und Verlängerung in der Regel zwei Jahre und soll eine Mindestdauer von einem Jahr nicht unterschreiten." / "bis zu 140 Arbeitstage im Jahr nicht überschreiten dürfen" | residence permit usually **2 years**, work cap 140 days | **€100** eAT fee, 4-week card production, eAT validity "1 year" claim in the table, N26/Revolut/Sparkasse specifics, 29 Schengen countries |

### 3b. Corrected — 1 page (`c2a-corrections-germany-2026-10-30.json`)

| Page | What the page said | Corrected to | Official URL | Verbatim quote |
|---|---|---|---|---|
| `germany-german-language-levels` | "B1 German reduces your Permanent Residency (PR) waiting time **from 33 months** down to 21 months" | "…**from 27 months** down to 21 months", with a link to § 18c | https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html | "Die Frist nach Satz 1 verkürzt sich auf 21 Monate, wenn der Ausländer über ausreichende Kenntnisse der deutschen Sprache verfügt." |

Details of that proposal: it sends the whole `body_md` because the inbox only accepts whole-field values. The only edits are (a) 33 → 27 months, (b) an added link to § 18c, and (c) the heading "## Executive Summary: Do You Really Need German…" → "## Do You Really Need German…". Edit (c) was **required** to pass the validator: the live body already contains the banned phrase "Executive Summary", and the inbox refuses any `body_md` containing it. No other wording changed. Also note: the same article says the reduction is "under the EU Blue Card law" — § 18c is the Blue Card PR provision, so that framing is right; and its "hours per level" and Goethe/test-centre lists were **not** verified (not part of the correction).

### 3c. Gaps — 15 pages examined, nothing proposed

| Page (slug) | Why it is a gap (what I tried / what is missing) |
|---|---|
| `germany-daad-scholarships-guide` | daad.de returns **403** to every request (bot protection); daad.in also 403. No official DAAD page fetched today → stipends (€992/mo), EPOS, deadlines, interview details unconfirmed. |
| `germany-daad-scholarship-master-guide` | Same DAAD block. |
| `germany-scholarship-directory-hub-guide` | Same DAAD block; hub page lists DAAD/Deutschlandstipendium amounts. |
| `germany-vfs-document-checklist` | The "two identical sets / no staples / photo 35×45 mm / no MEA apostille" rules live on **vfsglobal.com** (a commercial visa-outsourcing site, never `official_source`). The mission's study-visa page lists the required documents but not the VFS stacking/photo rules. |
| `germany-vfs-appointment-hacks` | Appointment-slot mechanics are only on VFS (commercial) / forum/coaching sites. Nothing on an official page fetched today. |
| `germany-total-cost-breakdown` | The ₹22.5–25 lakh total is a site estimate (rent, food, flights, ₹ exchange). Only the €11,904 blocked amount is official; the rest is not confirmable on an official page. |
| `germany-winter-vs-summer-intakes` | Deadlines are set per university; no official page states a uniform "15 July / 15 January" rule (uni-assist only says to apply ≥8 weeks before each university's deadline). TUM's own dates exist on tum.de, but the page is generic. |
| `germany-german-language-exams-guide` | testdaf.de/en returned **HTTP 500** today (German root loads, no English page); goethe.de **403**; dsh.de is not an official university/government site (looks like a private prep site). DSH-2/67 % and telc claims unconfirmed. |
| `germany-rbi-lrs-tcs-tax-rules` | RBI FAQ (https://www.rbi.org.in/Scripts/FAQView.aspx?Id=115, updated 6 Apr 2023) confirms the **USD 2,50,000** LRS limit, but the page's TCS rates (0 % on loan-funded, 2 % above ₹10 lakh) were not confirmed on an official Income Tax page fetched today — and the blocked-account page claims **0.5 %** for loan-funded education remittances, so the two pages disagree. Needs an incometax.gov.in / Finance Act source. |
| `germany-3yr-bachelor-acceptance` | anabin.kmk.org loads but the search page does not state the H+ rule in text (it is a database UI); no official page fetched today says "a 3-year Indian bachelor = 180 ECTS, accepted for a 120-ECTS master". The 180/240/ECTS arithmetic also needs a university or KMK statement. |
| `germany-offer-acceptance-payment` | "Semester contribution €150–400" varies by university; no single official page confirms the range. The 14-day acceptance window is also university-specific (not on an official page fetched today). |
| `germany-testas-exam-guide` | testas.de confirms the **paper-based** structure: "In the Core Test, you will work on four different groups of tasks in 110 minutes" and "In the Subject Module, you will work on two or three groups of tasks in about 150 minutes". But the current **digital TestAS** is different (~90 min core + 90 min subject; 25-min subtests) and the page does not say which mode its table describes → no source added; the page needs a rewrite of the structure table, not just a source. |
| `expatrio-vs-fintiba-vs-coracle` | Commercial blocked-account providers; prices exist only on their own commercial sites → never `official_source` by rule. |
| `aps-india-certificate-verification-step-by-step` | Published row has **`body_md = NULL`** in staging (nothing to verify). Its existing `official_source` is the bare domain `https://aps-india.de` with no `checked_at`; does not need my proposal but should be reviewed by the owner. |
| `germany-student-visa-interview-questions` | Same: **`body_md = NULL`**, existing source is bare `https://india.diplo.de`, no `checked_at`. Nothing to verify. |

## 4. Discrepancies / things the owner should know

1. **uni-assist processing time**: both uni-assist pages say "4 to 8 weeks"; uni-assist itself says "You will usually receive your evaluation result within 4 to 6 weeks". I did **not** correct this because it would mean rewriting two long `body_md` values (both start with the banned "## Executive Summary:" heading, so a whole-body proposal also needs a heading edit — same issue as the language-levels correction). Flagged for the next pass or the owner.
2. **VFS fees are never official** (`€75` mission fee is plausible but I did not fetch an official fee table; `₹1,500` VFS service fee is commercial).
3. **Health insurance exact 2026 numbers**: official TK PDF says €110.38 + €35.91 = **€146.29** for a childless student over 23 (and €141.16 under 23). The page's "~€141–146" range is close but its top end is €0.29 low for over-23 childless students; not a correction, just something to tidy when the page is next edited.
4. **National student visa page** says "Since 1 July 2025, Germany no longer offers remonstration…"; the mission page says the nationwide abolition is from 1 July 2025 but that **in India remonstration was already abolished on 1 January 2024**. Both statements are on the official page; the article's phrasing is not wrong but is India-imprecise.
5. **TestAS digital vs paper-based** — see the gap table. This is a content fix, not a source fix.
6. **`germany-english-language-tests`** (in staging) is missing a source even though production lists the APS leaflet; I did not touch it (its IELTS/TOEFL claims need test-provider pages — commercial — so it is likely a permanent gap).

## 5. Quote self-check (mandatory)

Script: `/tmp/sa-germany/selfcheck.cjs`. It re-fetches **every** URL recorded in `evidence.json` live (curl, browser UA), extracts text (HTML → entity-decoded text; PDF → `pdftotext`), normalises whitespace + case, and asserts each recorded quote is present. Real output saved to `/tmp/sa-germany/selfcheck.txt`; the result line:

```
RESULT: 27 pass, 0 fail, 27 checked. Every quoted URL re-fetched live on 2026-10-30.
```

(27 evidence entries across 11 distinct URLs: 12 verified pages, 2 corroborating sources, the 1 correction.) No quote failed the re-fetch, so none had to be moved to Gaps.

## 6. Validator dry runs (staging, real output)

```bash
cd "/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app"
P="/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/.claude/worktrees/study-abroad-merge/scholarship-app/.env.local"
export TURSO_STAGING_DATABASE_URL="$(grep '^TURSO_STAGING_DATABASE_URL=' "$P" | cut -d= -f2- | tr -d '"')"
export TURSO_STAGING_AUTH_TOKEN="$(grep '^TURSO_STAGING_AUTH_TOKEN=' "$P" | cut -d= -f2- | tr -d '"')"
node scripts/study-abroad/propose-changes.mjs "/tmp/sa-germany/c2a-sources-germany-2026-10-30.json" --target=staging --dry-run
node scripts/study-abroad/propose-changes.mjs "/tmp/sa-germany/c2a-corrections-germany-2026-10-30.json" --target=staging --dry-run
```

`dryrun-sources.txt` → `Proposed 24, already waiting 0, unchanged 0, refused 0. (dry run: nothing written)` (12 pages × 2 fields)
`dryrun-corrections.txt` → `Proposed 3, already waiting 0, unchanged 0, refused 0. (dry run: nothing written)` (article + official source + facts checked)
Both files dry-run **clean** against staging. **Nothing was submitted** — per the Lead's instruction the Lead commits the files and submits once.

## 7. Domains to add to `data/study-abroad/official-domains.json` (not edited by me)

The allowlist currently has `daad.de`, `uni-assist.de`, `aps-india.de`, `india.diplo.de`, `auswaertiges-amt.de`, `bamf.de` and the university domains. These official hosts used in this batch are **missing** and should be added (the validator does not enforce the list yet — handoff item 7):
- `gesetze-im-internet.de` (federal statute texts — used for 5 pages here; the most used source in this batch)
- `zoll.de` (German customs)
- `tk.de` (a statutory health insurer, per the "statutory insurers where the page states a statutory rule" allowance)
- Worth adding for the next pass: `testas.de`, `anabin.kmk.org` (KMK), `rbi.org.in` (Indian central bank), `digital.diplo.de` (Consular Services Portal), `deutsche-rentenversicherung.de` (for the Blue Card salary-threshold percentage), `incometax.gov.in` (TCS).

## 8. Pages I did NOT check (26 of the 54 published Germany guides)

germany-bavarian-grade-matrix, germany-destination-overview, germany-ects-credit-mapping, germany-education-loans-germany, germany-engineering-directory, germany-english-language-tests, germany-financial-emergency-plan, germany-fsp-studienkolleg-guide, germany-gre-gmat-germany-guide, germany-gre-gmat-waiver-directory, germany-ms-cs-directory, germany-ms-data-science-directory, germany-multiple-offers-decision-matrix, germany-public-vs-private, germany-rejection-analysis-appeal, germany-routes-hub-guide, germany-rwth-aachen-portal-manual, germany-scholarship-panel-interview-guide, germany-securing-werkstudent-jobs, germany-sop-europass-cv-guide, germany-top-public-unis-profiles, germany-tum-efv-entrance-exam-guide, germany-tum-munich-portal-manual, germany-university-listing-hub-guide, germany-visa-interview-prep, germany-visa-routes-hub-guide.

(28 pages were examined: 12 verified + 1 corrected + 15 gaps. `germany-bavarian-grade-matrix` was examined only far enough to see that uni-assist confirms it converts grades but publishes no formula — it is listed as not checked rather than as a gap so it can be done properly with a university/KMK source.)

## 9. Questions for the Lead / owner

1. Submit the sources file and the corrections file as two separate inbox batches (money/visa correction is separate, as the spec requires), or only the sources file and hold the correction for a wording pass? The correction also drops a pre-existing banned heading ("Executive Summary"), so it is a small editorial change bundled with a visa number by necessity.
2. Should the 12 "verified with unverified extras" pages count as done for C2, or does C2 require every number on a page to be sourced? If the latter, the next pass needs: official fee pages (visa €75, VFS fees), university semester-fee pages, and a DAAD workaround (the bot protection blocks us).
3. Do you want the uni-assist "4–8 vs 4–6 weeks" discrepancy fixed in this batch (needs two `body_md` rewrites) or parked as a follow-up?
