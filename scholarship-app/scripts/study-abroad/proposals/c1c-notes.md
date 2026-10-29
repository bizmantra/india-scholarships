# Batch C1c: University Summaries Replacement

## Scope
- **Batch**: C1c (Study Abroad University Summaries)
- **Target Table**: `sa_universities` where `status = 'published'` and `summary LIKE 'Complete 20%'`
- **Agent**: `content-editor`
- **Target Environment**: Staging Turso database (`india-scholarships-staging-wonderchild111`)

## Staging Counts
- Total published universities on staging: 45
- Published universities with boilerplate "Complete 2026 guide to..." summary: **37**
- Published universities with specific summaries already: 8
  - KIT Karlsruhe, LMU Munich, Purdue University, RWTH Aachen University, San José State University, TUM, UIC, UT Austin
- **Total proposals submitted in this batch: 37** (0 refusals, 0 unchanged, 0 errors)

## Content Standards Enforced
1. **Length**: All 37 summaries are 220 characters or fewer (ranging from 178 to 209 characters).
2. **Specificity**: Each summary states:
   - City / campus location
   - Primary academic strength / industry reputation
   - At least one concrete fact already stated on the live page (tuition fee, semester contribution, Bavarian GPA / Indian CGPA cutoff, or assistantship waiver).
3. **No Boilerplate**: None start with "Complete 2026 guide to" or any template filler.
4. **Uniqueness**: No two summaries start with the same five words.
5. **No Hallucinations / No New Facts**: Rewritten exclusively using verified claims already present in `body_md` and `infobox_json`.

## Spot-Check (5 Sample Pages)
1. **Arizona State University (ASU)** (`arizona-state-university`)
   - *Summary*: "Based in Tempe, Arizona State University is known for tech innovation near Silicon Desert. Out-of-state tuition is $32,000 per year, dropping to $16,000 with a departmental TA or RA award." (188 chars)
   - *Verified against page*: Location is Tempe, Arizona; body highlights 9 consecutive years #1 in innovation & Silicon Desert; tuition $32,000 / $16,000 in-state with TA/RA matches infobox rows 4 and 5.
2. **FAU Erlangen-Nürnberg** (`fau-erlangen-nurnberg`)
   - *Summary*: "FAU Erlangen-Nürnberg in Bavaria partners closely with Siemens Healthineers and Fraunhofer IIS. All consecutive master's programs are tuition-free (€0) with a 2.3 Bavarian GPA admission cutoff." (193 chars)
   - *Verified against page*: Location is Erlangen/Nuremberg, Bavaria; body highlights Siemens Healthineers & Fraunhofer IIS; tuition is €0 and cutoff 2.3 Bavarian GPA matches infobox rows 4 and 8.
3. **Northeastern University (NEU)** (`neu-northeastern-university`)
   - *Summary*: "Northeastern University in Boston is famous for its 4 to 8-month paid co-op work program. International graduate tuition is $48,000 per year, with target admission cutoffs at an 8.0+ Indian CGPA." (195 chars)
   - *Verified against page*: Location is Boston; body describes signature 4 to 8-month paid co-op program; tuition $48,000 and cutoff 8.0+ Indian CGPA matches infobox rows 4 and 8.
4. **TU Darmstadt** (`tu-darmstadt`)
   - *Summary*: "Just 20 minutes from Frankfurt, TU Darmstadt is a TU9 leader in cybersecurity and artificial intelligence. All consecutive master's degrees are tuition-free (€0) with a 2.2 Bavarian GPA cutoff." (193 chars)
   - *Verified against page*: 20 minutes from Frankfurt in Darmstadt; infobox row 3 designates TU9 cybersecurity & AI flagship; €0 tuition and 2.2 Bavarian GPA cutoff match infobox rows 4 and 8.
5. **University of Stuttgart** (`university-of-stuttgart`)
   - *Summary*: "Located in Germany's automotive capital, the University of Stuttgart excels in simulation and vehicle technology. Non-EU students pay €1,500 per semester under state law, with a 2.2 Bavarian GPA cutoff." (202 chars)
   - *Verified against page*: Located in Stuttgart; body highlights automotive capital and simulation technology; €1,500/semester state tuition and 2.2 Bavarian GPA cutoff match infobox rows 4 and 8.

## Submission Details
- Proposals file: `scripts/study-abroad/proposals/c1c-university-summaries-2026-10-29.json`
- Dry run: clean (0 refusals)
- Live staging submission: clean (37 proposals created in `agent_proposals`, ready for owner approval in `/admin/agents`).
