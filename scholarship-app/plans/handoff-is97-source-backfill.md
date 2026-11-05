# IS-97: finish the scholarship source-page backfill

Notion task: https://app.notion.com/p/4082e0a03f1e8122b71eccfc2156d9b2 (Owner: hand to the agent that takes this; Project IndiaScholarships)

## Goal
Every active scholarship should have at least one specific official page saved in `scholarships.source_pages`, so
the freshness, fact-check and quality agents can start from it. The automated Source Backfill (`scripts/source-backfill.js`)
did what a script can. This task is the rest: the research a script cannot do, plus the tooling to load the results safely.

## Already done (do not redo)
- **Laya pilot: closed.** Tested 2026-10-04; zero-shot results were weak (dates AUC 0.66-0.79, missed all platform pages).
  TypeSafe Jev was adopted instead and is built into the evidence score. Nothing left to pilot.
- Source tiers, `source_pages` / `secondary_sources` columns, `data/scholarship-sources.json`, Source Backfill workflow
  and stage 1 + stage 2 runs (PRs #42, #44, #46-#50). Read `docs/SCHOLARSHIP_SOURCES.md` first.

## Where it stood (5 Oct 2026, STALE: recount first)
Of ~500 active scholarships: ~95 had a found-official page; the rest were roughly 173 dead links, 158 home-page-only,
62 not-found (mostly Odisha, Karnataka and Andhra state portals that plain fetch cannot read), 41 not-matching,
15 found-secondary. Three "ended-or-replaced" results were false positives.

## Order of work (one agent does all parts)
A (recount) → C (loader script and test, so results can be loaded from the first batch) → B (research, batch by batch).
After each batch: run the loader in dry-run mode on it and fix anything it rejects. Work on a git worktree branch cut
from `origin/main`, open one PR for the loader and batch files, and do not merge it (the owner merges).
Track progress in the Notion task: update Status, Last update, and add a handoff comment when stopping.

## Part A: recount (10 minutes, do this first)
1. `npm run db:pull` for a current local copy (never use production credentials to write).
2. Count active scholarships by: empty `source_pages`; `source_pages` containing only a home page (path is `/` or empty);
   has `secondary_sources` only. Save the counts and the list of slugs, ordered by traffic (clicks) if the data is there,
   to `plans/agy-results/is97-worklist-<date>.csv`.
3. Report the new numbers in the Done section below before starting Part B.

## Part B: research (the bulk of the work, in batches of 25, highest traffic first)
For each scholarship on the worklist, using a real browser, not plain fetch (government portals are often
JavaScript-rendered; "could not read" is not "does not exist"):
1. Open its existing `official_source` and `apply_url`, then the provider's own site, then the state portal listed in
   `data/scholarship-sources.json`.
2. Find the **specific page** (not the home page) that describes this scholarship for the current cycle: guidelines PDF,
   notification, scheme page, or the application page.
3. Record, per scholarship, one JSON object:
   `{ "slug", "outcome", "source_pages": [{ "url", "facts": [...], "confirmed": "YYYY-MM-DD" }], "secondary_sources": [{ "url", "tier", "role" }], "evidence": "short quote or description from the page", "notes" }`
   `outcome` is one of: `found-official`, `found-secondary`, `ended-or-replaced`, `not-found`, `link-dead-replaced`.
4. Rules, all from `docs/SCHOLARSHIP_SOURCES.md`:
   - Official or provider pages go to `source_pages`. Buddy4Study, Careers360, Jagran Josh and the like go to
     `secondary_sources` with the right tier. Coaching sites are never recorded anywhere.
   - Our own site and Google redirect links never count.
   - **Do not change any deadline, amount, status or eligibility.** Record only where the page is and which facts it
     states (`facts` lists field names such as `deadline`, `amount_min`, never values).
   - `ended-or-replaced` needs an official page that says the scheme is **permanently** discontinued or replaced, quoted
     in `evidence`. A closed or not-yet-open window is not that.
   - `not-found` means you searched the provider, the state portal and the web and found nothing for this cycle. Say
     which you tried. These go to the owner to decide; nothing is taken down automatically.
5. Write results to `plans/agy-results/is97-batch-<n>.json` (one file per batch). Do not touch the database, `.env*`,
   `scholarship.db` or `backups/`.

## Part C: loader script (for a coding agent; can run in parallel with Part B)
Write `scripts/import-source-pages.js` that reads batch files from Part B and writes to `source_pages` /
`secondary_sources`:
- **Dry run by default** (prints a per-scholarship diff); `--apply` to write; refuses a production database unless an
  explicit flag is passed, matching how `scripts/source-backfill.js` guards staging.
- Validates every entry: tier comes from `scripts/lib/source-tiers.js` and is recomputed, never trusted from the file;
  rejects coaching, own-site and Google-redirect URLs; rejects home-page-only URLs for `source_pages`; keeps at most 8
  per scholarship, newest first; merges with existing pages instead of replacing them.
- Never writes `ended-or-replaced` or `not-found` outcomes to a scholarship; instead it collects them into
  `data/source-backfill-review.md` grouped as: likely closed, unconfirmed, possibly never real, for the owner.
- Add a small test with fixture input covering: valid official page, home page, coaching site, own site, duplicate,
  more than 8 pages, existing pages preserved.
- Reuse helpers from `scripts/source-backfill.js` and `scripts/lib/` rather than copying them.

## How to check it works
- Part A: counts add up to the active scholarship total.
- Part B: spot-check 10% of each batch by opening the URLs; every `source_pages` URL loads, names the scholarship, and is
  official or provider tier.
- Part C: `node scripts/import-source-pages.js --dry-run plans/agy-results/is97-batch-1.json` prints a diff and writes
  nothing; the test passes; `--apply` against a scratch copy of the database changes only the two source columns.

## Review
Whatever agent does Part B, a second agent or the owner re-derives a sample from official sites before anything is applied
(Antigravity has invented dates and scheme names before; Codex caught them).

## Questions
- Notion page (4082e0a03f1e8122b71eccfc2156d9b2) is not currently shared with the Antigravity integration (returned 404 object_not_found), so progress is documented here and in PR/commits instead of live Notion API sync.

## Done
### Part A: Recount (2026-11-05)
- **Database Pulled**: Pulled fresh copy from production Turso (`data/scholarships.db`, 573 scholarships).
- **Recount Breakdown**:
  - Total active scholarships: 573
  - With specific official page (`source_pages`): 123
  - Worklist needing research: 450
    - Empty `source_pages` (no secondary): 359
    - Home-only `source_pages`: 0
    - `secondary_sources` only: 91
- **Worklist Generated**: `plans/agy-results/is97-worklist-2026-11-05.csv` ordered by GSC clicks descending.

### Part C: Loader Script & Tests (2026-11-05)
- **Implemented `scripts/import-source-pages.js`**:
  - Dry-run by default with per-scholarship diff output.
  - `--apply` flag to persist changes to SQLite.
  - Production database guard: blocks write operations to production DB unless `--allow-production` is explicitly passed.
  - URL validation: recomputes source tiers using `scripts/lib/source-tiers.js`; rejects coaching, own-site, redirect URLs, and non-specific home-page URLs for `source_pages`.
  - Merging: merges new pages on top of existing pages, deduplicates by normalized URL, caps at 8 pages max per scholarship.
  - Review queue: routes `ended-or-replaced` and `not-found` outcomes safely to `data/source-backfill-review.md` (never writes them directly to scholarship columns).
- **Implemented `scripts/test-import-source-pages.js`**:
  - Unit tests covering: valid official page, home-page rejection, coaching site rejection, own-site rejection, URL deduplication, max 8 pages cap, existing pages preservation, and review file routing.
  - All tests passing.
- **Verified Scratch DB Changes**: Ran `--apply` against a scratch copy of the database and verified that strictly zero non-source columns were touched.

### Part B: Research Batch 1 (2026-11-05)
- **Batch 1 Saved**: `plans/agy-results/is97-batch-1.json` (top 25 scholarships by traffic).
- **Outcomes**:
  - 23 `found-official`
  - 1 `link-dead-replaced` (DAAD WISE Germany updated database entry)
  - 1 `not-found` (`gail-sports-scholarship-scheme` - past 2015-2016 CSR campaign without active portal page; routed to review)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-1.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 2 (2026-11-05)
- **Batch 2 Saved**: `plans/agy-results/is97-batch-2.json` (items 26–50 on worklist).
- **Outcomes**:
  - 24 `found-official` (covering Tamil Nadu Naan Mudhalvan, Tripura SCERT/EBC, IIT Bombay WINGS, IIT Madras SBI PASS, TN Annal Ambedkar Overseas, DBT-BET JRF, Swiss Government Excellence, Maharashtra BARTI BANRF, Kerala LWF, MVPM Boob Memorial, JNMF Doctoral, DEPwD Top Class Disabilities, Samarthanam Disabilities, MP MPTAAS, LIC Golden Jubilee, Tata Capital Pankh, Maharashtra TRTI ST, NMMS, MahaDBT Minority & Girls Merit, AP Post-Matric SC, BC, & Minority Welfare)
  - 1 `not-found` (`punjab-attendance-scholarship-for-sc-girls` - internal school-login DBT incentive on ePunjab MIS without standalone public guidelines URL; routed to review)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-2.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 3 (2026-11-06)
- **Batch 3 Saved**: `plans/agy-results/is97-batch-3.json` (items 51–75 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Andhra Pradesh Jnanabhumi schemes (`andhra-pradesh-ntr-vidyonnathi`, `jagananna-vidya-deevena-ap`)
    - Major private/CSR foundations (`sitaram-jindal-foundation-scholarship`, `hdfc-bank-parivartan-ecss-scholarship`, `infosys-foundation-stem-stars-scholarship-program`)
    - Odisha State Scholarship Portal (`scholarship.odisha.gov.in`) schemes (`pre-matric-scholarship-for-ebc-students-odisha`, `e-medhabruti-technical-professional-scholarship-odisha`, `sudakshya-for-girls-child-scholarship-odisha`, `green-passage-scheme-higher-education-odisha`, `boc-scholarship-nirman-shramik-kalyan-yojana-odisha`, `gopabandhu-sikhya-sahayata-yojana-odisha`, `shahid-madho-singh-haath-kharcha-yojana-odisha`, `banishree-scholarship-odisha`, `videsh-siksha-bruti-foreign-education-scholarship-odisha`)
    - Karnataka State Scholarship Portal (`ssp.karnataka.gov.in`) schemes (`post-matric-scholarship-for-sc-students-karnataka`, `post-matric-scholarship-for-st-students-karnataka`, `post-matric-scholarship-for-obc-students-karnataka`, `post-matric-scholarship-for-minorities-karnataka`, `post-matric-scholarship-for-ewsgeneral-category-karnataka`, `post-matric-scholarship-for-persons-with-disabilities-udid-karnataka`, `vidyasiri-food-and-accommodation-scholarship-for-obc-students-karnataka`, `merit-cum-means-mcm-scholarship-for-minorities-professional-and-technical-courses-karnataka`, `sandeepani-shishya-vethana-scholarship-karnataka-state-brahmin-development-board`, `pre-matric-sc-students-karnataka`, `pre-matric-st-students-karnataka`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-3.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 4 (2026-11-06)
- **Batch 4 Saved**: `plans/agy-results/is97-batch-4.json` (items 76–100 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Karnataka SSP pre-matric (`pre-matric-obc-students-karnataka`, `pre-matric-pwdudid-karnataka`)
    - Major foundations (`azim-premji-scholarship`, `atul-maheshwari-scholarship`)
    - Gujarat state schemes (`mukhyamantri-yuva-swavalamban-yojana-mysy`, `gujarat-post-matric-scholarship-for-obc`, `gujarat-post-matric-scholarship-for-minorities`)
    - Haryana Har-Chhatravratti (`haryana-post-matric-scholarship-for-sc-students`)
    - West Bengal (`swami-vivekananda-merit-cum-means-scholarship-svmcm`)
    - Bihar (`bihar-post-matric-scholarship-bcebc`, `mukhyamantri-kanya-utthan-yojana-graduation`)
    - Rajasthan (`chief-minister-higher-education-scholarship-rajasthan`)
    - Maharashtra Social Welfare (`savitribai-phule-pre-matric-scholarship-sc-girls`)
    - Madhya Pradesh Medhavi (`mukhyamantri-medhavi-vidyarthi-yojana-mmvy`)
    - Tamil Nadu (`tamil-nadu-post-matric-scholarship-for-scst`, `tamil-nadu-bcmbcdnc-post-matric-scholarship`)
    - Kerala (`e-grantz-kerala-scstoecobc-support`)
    - Delhi SC/ST/OBC Welfare (`mukhyamantri-vidyarthi-pratibha-yojna`, `merit-scholarship-for-scstobc-students-higher-ed`)
    - Jharkhand (`jharkhand-e-kalyan-post-matric-scholarship`)
    - Chhattisgarh (`chhattisgarh-bpl-scholarship-for-college-students`)
    - Assam DHE (`assam-dhe-combined-merit-scholarship`)
    - Uttarakhand Higher Education (`uchcha-shiksha-protsahan-chhatravriti-yojana`)
    - Himachal Pradesh Higher Education (`dr-ambedkar-medhavi-chattervriti-yojana`)
    - National / AICTE (`prime-minister-special-scholarship-scheme-sssjkl`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-4.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 5 (2026-11-06)
- **Batch 5 Saved**: `plans/agy-results/is97-batch-5.json` (items 101–125 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Vidyadhan Foundation (`vidyadhan-ladakh-scholarship-program`)
    - North-Eastern & Himalayan State schemes (`dorjee-khandu-merit-scholarship`, `nagaland-state-merit-scholarship`, `pm-yasasvi-post-matric-scholarship-manipur`, `post-matric-scholarship-for-sc-students-tripura`, `meghalaya-chief-minister-scholarship-scheme-cmss`, `chief-minister-cm-scholarship-sikkim`, `nec-merit-scholarship`)
    - State & UT schemes (`sant-sohirobanath-ambiye-bursary-scheme` Goa, `post-matric-scholarship-for-sc-students-chandigarh`, `sudakshya-scheme-for-girls-itipolyechnic` Odisha, `additional-scholarship-for-st-students-andaman-nicobar`)
    - Central Schemes (`central-sector-scheme-of-scholarship-for-college-and-university-students`, `top-class-education-scheme-for-sc-students`, `inspire-scholarship-for-higher-education-she`, `aicte-saksham-scholarship-for-students-with-disabilities`, `prime-ministers-research-fellowship-pmrf`, `pmss-for-railway-protection-force-rpfrpsf`, `sn-bose-scholars-program-international-research`, `pre-matric-scholarship-for-minorities-central-sector`, `national-fellowship-scholarship-for-higher-education-of-st-students`, `pre-matric-scholarship-for-students-with-disabilities`, `pm-scholarship-scheme-railways`)
    - Corporate/Foundation (`aditya-birla-scholarship-programme`, `kotak-shiksha-nidhi-scholarship`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-5.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 6 (2026-11-06)
- **Batch 6 Saved**: `plans/agy-results/is97-batch-6.json` (items 126–150 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Protean / Vidyasaarathi (`vidyasaarathi-scholarship-csr-programs`)
    - Karnataka & Maharashtra state schemes (`ssp-pre-matric-post-matric-scholarship-karnataka`, `mahadbt-post-matric-scholarship-maharashtra`, `nmms-scholarship-karnataka`, `nmms-scholarship-maharashtra`, `sanchi-honnamma-scholarship-karnataka`, `post-matric-scholarship-to-sbc-students`)
    - Tamil Nadu schemes (`pudhumai-penn-scheme-tamil-nadu`, `pre-matric-scholarship-adi-dravidar-tribal-welfare-dept`, `chief-minister-s-merit-scholarship-scheme`, `tamil-pudhalvan-scheme`, `evr-nagammai-scholarship`)
    - West Bengal & Bihar (`nabanna-scholarship-west-bengal`, `bihar-student-credit-card-education-support-scheme`)
    - Corporate & Foundations (`lila-poonawalla-foundation-scholarship`, `ongc-scholarship-csr`, `sbi-platinum-jubilee-asha-scholarship`, `jn-tata-endowment-for-higher-education`)
    - Central & State schemes (`junior-merit-scholarship` Odisha, `minority-welfare-scholarship-pre-matric`, `post-matric-scholarship-for-differently-abled`, `haryana-state-merit-scholarship`, `chief-minister-gyan-protsahan-yojana` CG, `ladakh-ut-merit-scholarship`, `andaman-nicobar-administration-merit-scholarship`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-6.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 7 (2026-11-06)
- **Batch 7 Saved**: `plans/agy-results/is97-batch-7.json` (items 151–175 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Foundations & Fellowships (`inlaks-shivdasani-foundation-scholarship`, `colgate-keep-india-smiling-scholarship`, `op-jindal-engineering-management-scholarship`, `godrej-scholarship-csr-initiatives`, `acc-vidyasaarathi-scholarship`, `teach-for-india-fellowship`, `young-india-fellowship-ashoka-university`, `lamp-fellowship`, `rhodes-scholarship-india`)
    - West Bengal OASIS schemes (`oasis-pre-matric-scholarship-for-sc-students-west-bengal`, `oasis-pre-matric-scholarship-for-st-students-west-bengal`, `oasis-pre-matric-scholarship-for-obc-students-west-bengal`, `oasis-post-matric-scholarship-for-sc-students-west-bengal`, `oasis-post-matric-scholarship-for-st-students-west-bengal`, `oasis-post-matric-scholarship-for-obc-students-west-bengal`, `kanyashree-prakalpa-scheme-west-bengal`, `sikshashree-scholarship-scheme-west-bengal`, `aikyashree-pre-matric-scholarship-for-minorities-west-bengal`, `aikyashree-post-matric-scholarship-for-minorities-west-bengal`, `aikyashree-merit-cum-means-scholarship-for-minorities-west-bengal`)
    - Tamil Nadu (`tamil-nadu-pre-matric-scholarship-for-bcmbc-minorities`, `tamil-nadu-higher-education-special-scholarship-for-scst-hostellers`)
    - Madhya Pradesh MPTAAS (`mp-mptaas-post-matric-scholarship-for-sc-students`, `mp-mptaas-post-matric-scholarship-for-st-students`, `mp-mptaas-post-matric-scholarship-for-obc-students`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-7.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 8 (2026-11-06)
- **Batch 8 Saved**: `plans/agy-results/is97-batch-8.json` (items 176–200 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Madhya Pradesh (`mp-gaon-ki-beti-yojana`, `mp-vikramaditya-free-education-scheme`, `mukhyamantri-jan-kalyan-shiksha-protsahan-yojana`)
    - Gujarat Digital Gujarat (`digital-gujarat-post-matric-scholarship-for-sc-students`, `digital-gujarat-post-matric-scholarship-for-st-students`, `gujarat-food-bill-assistance-for-medical-engineering-hostellers`)
    - Delhi (`delhi-post-matric-scholarship-for-obc-students`, `jai-bhim-mukhyamantri-pratibha-vikas-yojna`)
    - Haryana (`haryana-consolidated-stipend-scheme-for-sc-students`, `haryana-kalpana-chawla-chhatravritti-yojna`)
    - Punjab (`punjab-post-matric-scholarship-for-sc-students`, `punjab-post-matric-scholarship-for-obc-bc-students`, `dr-hargobind-khurana-scholarship-scheme`, `punjab-chief-minister-scholarship-scheme`)
    - Bihar (`bihar-post-matric-scholarship-for-sc-students`, `mukhyamantri-medhavriti-yojana`)
    - Rajasthan SJMS & HTE (`rajasthan-post-matric-scholarship-sc`, `rajasthan-post-matric-scholarship-st`, `rajasthan-post-matric-scholarship-obc`, `devnarayan-girls-student-incentive-scooty-distribution-scheme`, `kali-bai-bhil-meritorious-girls-scooty-scheme`)
    - Andhra Pradesh (`talliki-vandanam-scheme-ap`)
    - Kerala collegiate & science (`kerala-ch-mohammed-koya-scholarship`, `kerala-suvarna-jubilee-merit-scholarship`, `kerala-kscste-prathibha-scholarship`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-8.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 9 (2026-11-06)
- **Batch 9 Saved**: `plans/agy-results/is97-batch-9.json` (items 201–225 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Jharkhand (`marang-gomke-jaipal-singh-munda-overseas-scholarship`)
    - Chhattisgarh (`chhattisgarh-post-matric-scholarship-sc`, `chhattisgarh-post-matric-scholarship-st`, `chhattisgarh-post-matric-scholarship-obc`, `kanya-saksharta-protsahan-yojana-cg`, `noni-suraksha-yojana-cg`)
    - Central Schemes (`merit-cum-means-scholarship-for-minorities-professional-and-technical-courses-central`, `begum-hazrat-mahal-national-scholarship`, `post-matric-scholarship-for-students-with-disabilities-depwd`, `post-matric-scholarship-scheme-for-minorities-nsp`)
    - State Schemes (`ladli-lakshmi-yojana-mp`, `bhagya-lakshmi-scheme-karnataka`, `research-guidance-phd-fellowship-for-backward-classes-karnataka`, `mphil-phd-fellowship-for-minority-students-karnataka`, `national-overseas-scholarship-for-minority-communities-karnataka`, `samagra-shikshana-karnataka-fellowship`, `labour-department-scheme-for-unorganized-workers-children-karnataka`, `up-pre-matric-scholarship-general-sc-st`)
    - Corporate & Foundations (`loreal-fyws-scholarship`, `tata-realty-scholarship-for-girls`, `tata-aia-paras-scholarship`, `idfc-first-bank-mba-scholarship`, `lt-build-india-scholarship`, `faea-scholarship`, `fulbright-nehru-masters-fellowship`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-9.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 10 (2026-11-06)
- **Batch 10 Saved**: `plans/agy-results/is97-batch-10.json` (items 226–250 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Uttar Pradesh Scholarships (`up-pre-matric-scholarship-obc`, `up-pre-matric-scholarship-minority`, `up-post-matric-intermediate-scholarship-general-sc-st`, `up-post-matric-intermediate-scholarship-obc`, `up-post-matric-intermediate-scholarship-minority`, `up-post-matric-other-than-intermediate-general-sc-st`, `up-post-matric-other-than-intermediate-obc`, `up-post-matric-other-than-intermediate-minority`, `up-post-matric-outside-state-general-sc-st`, `mukhyamantri-kanya-sumangala-yojana`)
    - Premier Universities & Institutes:
      - BITS Pilani (`bits-pilani-institute-merit-mcn-awards`, `bits-pilani-board-topper-alumni-scholarships`)
      - IIT Bombay (`iit-bombay-free-messing-facility`, `iit-bombay-tuition-fee-remission`)
      - IIT Delhi (`iit-delhi-merit-cum-means-scholarship`, `iit-delhi-free-studentship-fee-remission`, `iit-delhi-donor-endowed-scholarships`)
      - IIT Madras (`iit-madras-merit-cum-means-alumni-tuition-support`, `iit-madras-institute-tuition-fee-waiver`)
      - IIT Kharagpur (`iit-kharagpur-merit-cum-means-scholarship`, `iit-kharagpur-endowment-donor-scholarships`, `iit-kharagpur-free-studentship-fee-remission`)
      - NIT Trichy (`nit-trichy-tuition-fee-remission`, `nit-trichy-recal-foundation-scholarships`)
      - NIT Surathkal (`nit-surathkal-garrett-memorial-scholarships`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-10.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 11 (2026-11-06)
- **Batch 11 Saved**: `plans/agy-results/is97-batch-11.json` (items 251–275 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - Central Universities (`du-financial-support-scheme`, `du-all-india-post-graduate-scholarship`, `du-shri-ram-lubhaya-book-grant`, `jnu-merit-cum-means-scholarship`, `bhu-poor-students-welfare-fund`, `amu-merit-financial-awards`, `jmi-apj-abdul-kalam-scholarship`, `uoh-student-assistance-aid`, `uoh-non-net-fellowship`, `uoh-fifth-year-phd-assistance`)
    - State & Technical Universities (`anna-university-endowment-scholarships`, `anna-university-first-graduate-concession`, `vtu-jnana-yaana-doctoral-fellowship`, `vtu-sc-st-welfare-scheme`, `sppu-earn-and-learn-scheme`, `aktu-student-welfare-fund-assistance`)
    - Private Institutions (`ashoka-university-need-based-financial-aid`, `ashoka-university-merit-scholarships`, `vit-stars-rural-students-scheme`, `viteee-gvsdp-merit-scholarship`)
    - International & Central Programs (`mext-scholarship-japan`, `erasmus-mundus-joint-masters`, `gates-cambridge-scholarship`, `umbrella-st-jk`, `pm-yasasvi-jk-obc`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-11.json` with 0 errors and 0 validation warnings.

### Part B: Research Batch 12 (2026-11-06)
- **Batch 12 Saved**: `plans/agy-results/is97-batch-12.json` (items 276–300 on worklist).
- **Outcomes**:
  - 25 `found-official` (100% resolution):
    - State Schemes (`sc-scholarship-jk`, `ladli-beti-jk`, `mukhya-mantri-protsahan-hp`, `pre-matric-sc-st-hp`)
    - Major Corporate & Tech CSR (`generation-google-scholarship`, `amazon-future-engineer-scholarship`, `jsw-udaan-scholarship`, `amazon-future-engineer-scholarship-india`, `generation-google-scholarship-apac`, `lic-hfl-vidyadhan-scholarship`, `rolls-royce-wings4her-scholarship`)
    - Central Schemes (`pm-yasasvi-top-class-education`, `central-sector-scholarship-csss`, `pmss-capf-assam-rifles`)
    - Leading Global Fellowships & Foundations (`inlaks-shivdasani-scholarship`, `felix-scholarship`, `nl-scholarship-netherlands`, `charpak-scholarship-france`, `jn-tata-endowment-scholarship`, `canada-graduate-scholarships-masters-program`, `lester-b-pearson-international-scholarship-program`, `ubc-international-major-entrance-scholarship`, `heinrich-bll-foundation-scholarships`, `konrad-adenauer-stiftung-scholarships`, `esmt-berlin-mba-scholarships`)
- **Dry-run Verified**: Ran `node scripts/import-source-pages.js plans/agy-results/is97-batch-12.json` with 0 errors and 0 validation warnings.







