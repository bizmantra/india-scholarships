# Keyword & university shortlist — UK, Canada, Australia, Ireland (Step 0, E3)

Source: Ubersuggest MCP, `match_keywords`, location = India (loc_id 2356), language English,
pulled 2026-09-28. Volumes are monthly, India-origin searches. Same shape as the existing
Germany/USA `related_ubersuggest_*` files in this folder.

Fields chosen per country follow §2.5 of the expansion plan (MS/MSc CS, Data Science, MBA first).
Where a country's CS-specific query had ~0 India search volume in Ubersuggest, that's noted —
demand may show up under "IT" or "software engineering" instead; worth another pass once the
Facts agent is running, rather than guessing further here.

## UK

**Top keywords (by volume):**
| Keyword | Volume | SD | Notes |
|---|---:|---:|---|
| uk student visa | 6,600 | 21 | hub |
| uk student visa cost | 3,600 | 30 | cost guide |
| study in uk | 3,600 | 64 | hub |
| mba in uk | 2,400 | 53 | field |
| ms in uk | 2,400 | 36 | hub |
| masters study in uk | 1,900 | 48 | hub |
| ms in uk universities | 1,300 | 80 | universities page |
| mba in uk colleges | 720 | 34 | field |
| ms in uk computer science | 590 | 67 | field (low but real) |

**Fields:** MBA (2.4K, strong), MSc Data Science (140–480 range across variants), MSc Computer
Science (590, smaller but non-zero — keep for parity with Germany/USA).

**Universities (12, ranking + Indian-student popularity):** University of Manchester, University
of Birmingham, University of Leeds, University of Sheffield, University of Nottingham, University
of Southampton, University of Glasgow, University of Edinburgh, Coventry University, Newcastle
University, University College London (UCL), University of Warwick.

## Canada

**Top keywords:**
| Keyword | Volume | SD | Notes |
|---|---:|---:|---|
| study in canada | 3,600 | 60 | hub |
| visa for study in canada | 1,300 | 15 | visa guide |
| ms in canada | 1,000 | 24 | hub |
| ms in canada university | 1,000 | 47 | universities page |
| mba in canada | 1,000 | 33 | field |
| mba in canada cost | 720 | 32 | field |
| canada study permit | 590 | 15 | hub |
| study in canada for indian students | 260 | 56 | hub |

**Fields:** MBA (1K), MSc Data Science (masters data science canada 210, ms in data science
canada 260), MS Computer Science — no India-volume seen for "ms in canada computer science";
recheck after the Facts agent is live rather than guessing a number.

**Universities (13):** University of Toronto, University of British Columbia, McGill University,
University of Waterloo, University of Alberta, McMaster University, University of Ottawa,
Concordia University, York University, Simon Fraser University, Western University, Dalhousie
University, Carleton University.

## Australia

**Top keywords:**
| Keyword | Volume | SD | Notes |
|---|---:|---:|---|
| australia student visa | 9,900 | 39 | hub — biggest of all four countries |
| visa for study in australia | 6,600 | 47 | visa guide |
| it study in australia | 4,400 | 43 | field-adjacent |
| study in australia | 3,600 | 46 | hub |
| ms in australia | 2,900 | 31 | hub |
| mba in australia | 1,900 | 35 | field |
| ms in australia universities | 1,000 | 22 | universities page |
| mba in australia colleges | 720 | 41 | field |

**Fields:** MBA (1.9K), MSc Data Science (masters data science australia 590, ms in data science
australia 320), MS Computer Science/IT — "it study in australia" (4.4K) is the closest strong
signal; treat "IT" as the field label locally rather than a literal "Computer Science" page title.

**Universities (13):** University of Melbourne, University of Sydney, Australian National
University, University of Queensland, Monash University, UNSW Sydney, University of Adelaide,
University of Western Australia, RMIT University, University of Technology Sydney, Deakin
University, Macquarie University, La Trobe University.

## Ireland

**Top keywords:**
| Keyword | Volume | SD | Notes |
|---|---:|---:|---|
| study in ireland | 1,900 | 44 | hub |
| ireland student visa | 1,300 | 36 | hub |
| republic of ireland student visa | 1,300 | 16 | visa guide, note "Republic of" phrasing |
| ms in ireland universities | 1,300 | 44 | universities page |
| ms in ireland | 1,000 | 20 | hub |
| mba in ireland | 1,000 | 33 | field |
| mba in ireland cost | 480 | 21 | field |
| study in ireland for indian students | 320 | 24 | hub |

**Fields:** MBA (1K), MSc Data Science (masters in data science ireland 90), MS Computer Science
— no signal found; Ireland is the smallest of the four markets, consistent with the plan's #4
position.

**Universities (8 — smaller market, fewer needed for launch):** Trinity College Dublin, University
College Dublin, University of Limerick, Dublin City University, University of Galway, University
College Cork, Technological University Dublin, Maynooth University.

## Rank tracking (recovery #36)

Added 32 of the above terms (8 per country) to the `indiascholarships.in` Ubersuggest project,
loc_id 2356 (India), alongside the 15 keywords already tracked. Project now tracks 47/125.
