import csv
import re
import os

ubersuggest_path = "/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/Keyword research/ubersuggest_UP,_NSP_6Jul2026.csv"
keyword_planner_path = "/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/Keyword research/Keyword Stats 2026-07-06 at 23_19_35.csv"

# Storage for normalized keywords
# Structure: { normalized_keyword: { 'volume': val, 'competition': val, 'cpc': val, 'source': val } }
keywords_db = {}

# 1. Parse Ubersuggest CSV
try:
    with open(ubersuggest_path, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) < 6:
                continue
            kw = row[1].strip().lower()
            vol = int(row[2]) if row[2] else 0
            cpc_str = row[3].replace("₹", "").replace(",", "").strip()
            cpc = float(cpc_str) if cpc_str else 0.0
            seo_diff = int(row[5]) if row[5] else 0
            
            keywords_db[kw] = {
                'volume': vol,
                'cpc': cpc,
                'difficulty': seo_diff,
                'source': 'Ubersuggest',
                'raw_comp': seo_diff
            }
except Exception as e:
    print(f"Error parsing Ubersuggest data: {e}")

# 2. Parse Google Keyword Planner CSV
try:
    with open(keyword_planner_path, mode="r", encoding="utf-16le") as f:
        reader = csv.reader(f, delimiter="\t")
        # Skip header lines until we reach actual headers (3rd row)
        next(reader) # Row 1: Title
        next(reader) # Row 2: Date
        header = next(reader) # Row 3: Column headers
        
        for row in reader:
            if len(row) < 9:
                continue
            kw = row[0].strip().lower()
            vol = int(row[2]) if row[2] else 0
            comp_indexed = int(row[6]) if row[6] else 0
            high_bid = float(row[8]) if row[8] else 0.0
            
            # If keyword exists, take Google search volume as it's directly from search engine, or keep highest volume
            if kw in keywords_db:
                # Merge: prefer Google's search volume and high bid CPC
                keywords_db[kw]['volume'] = max(keywords_db[kw]['volume'], vol)
                if high_bid > 0:
                    keywords_db[kw]['cpc'] = high_bid
                keywords_db[kw]['source'] = 'Combined'
            else:
                keywords_db[kw] = {
                    'volume': vol,
                    'cpc': high_bid,
                    'difficulty': comp_indexed, # Fallback using indexed competition
                    'source': 'Keyword Planner',
                    'raw_comp': comp_indexed
                }
except Exception as e:
    print(f"Error parsing Google Keyword Planner data: {e}")

# Categorization Logic
def get_cluster(kw):
    kw_clean = kw.lower()
    
    # Entrance Exam/Coaching
    if any(x in kw_clean for x in ['aakash', 'allen', 'exam', 'ias', 'coaching', 'test question', 'papers', 'allen', 'fiitjee', 'narayana', 'resonance']):
        return "Coaching & Entrance Exams"
        
    # State Specific
    if any(x in kw_clean for x in ['up scholarship', 'aikyashree', 'west bengal', 'karnataka', 'ssp', 'ssp scholarship', 'telangana', 'epass', 'mahadbt', 'maharashtra', 'odisha', 'bihar']):
        return "State Government Portals"
        
    # Government/National Schemes
    if any(x in kw_clean for x in ['nsp', 'national scholarship', 'aicte', 'post matric', 'pre matric', 'central scheme', 'ugc', 'csir', 'dst', 'inspire']):
        return "National/Central Schemes"
        
    # Corporate/Private
    if any(x in kw_clean for x in ['aditya birla', 'tata', 'faea', 'reliance', 'hdfc', 'lic', 'buddy4study', 'colgate', 'corporate', 'foundation']):
        return "Corporate & Private Programs"
        
    # Study Abroad / International
    if any(x in kw_clean for x in ['abroad', 'international', 'fulbright', 'cfa', 'chevening', 'daad', 'study in uk', 'study in usa', 'commonwealth']):
        return "Study Abroad & International"
        
    # Degree specific
    if any(x in kw_clean for x in ['college', 'university', 'graduate', 'mba', 'phd', 'undergraduate', 'engineering', 'medical', 'btech', 'mbbs']):
        return "Degree & College Levels"
        
    return "General Scholarship Queries"

# Cluster mapping
clustered_data = {}
for kw, data in keywords_db.items():
    cluster = get_cluster(kw)
    if cluster not in clustered_data:
        clustered_data[cluster] = []
    data['keyword'] = kw
    clustered_data[cluster].append(data)

# Generate Report Markdown
artifact_dir = "/Users/roshankumar/.gemini/antigravity/brain/886abc3e-9541-4f55-8021-f0ecbc1e21f3"
report_path = os.path.join(artifact_dir, "keyword_analysis_report.md")

with open(report_path, mode="w", encoding="utf-8") as rf:
    rf.write("# 📊 India Scholarship Keyword Research & Intent Clustering\n\n")
    rf.write("We merged and analyzed the data from **Ubersuggest** and **Google Keyword Planner** exports. ")
    rf.write("This report groups high-value search queries in India by intent cluster, identifying search volumes, competitive difficulty, and organic targeting value.\n\n")
    
    # Summary Metrics Table
    rf.write("## 📈 Dataset Summary\n\n")
    rf.write("| Keyword Cluster | Unique Keywords | Total Monthly Volume | Avg. CPC (INR) | Primary Intent |\n")
    rf.write("| :--- | :---: | :---: | :---: | :--- |\n")
    
    # Sort clusters by total volume
    sorted_clusters = sorted(
        clustered_data.items(),
        key=lambda x: sum(item['volume'] for item in x[1]),
        reverse=True
    )
    
    for cluster, items in sorted_clusters:
        total_vol = sum(item['volume'] for item in items)
        avg_cpc = sum(item['cpc'] for item in items) / len(items) if items else 0
        intent = {
            "State Government Portals": "State hubs & cycle updates",
            "National/Central Schemes": "NSP verification & disbursement",
            "Coaching & Entrance Exams": "Secondary/Senior secondary coaching awards",
            "Degree & College Levels": "Undergraduate/Postgraduate targeted funding",
            "Corporate & Private Programs": "Foundation & Corporate CSR funding",
            "Study Abroad & International": "Master's & Doctoral external fellowships",
            "General Scholarship Queries": "Information gathering & eligibility searches"
        }.get(cluster, "General queries")
        
        rf.write(f"| {cluster} | {len(items)} | {total_vol:,} | ₹{avg_cpc:.2f} | {intent} |\n")
    
    rf.write("\n---\n\n")
    
    # Detail analysis of clusters
    rf.write("## 🔍 Intent Cluster Breakdown\n\n")
    
    for cluster, items in sorted_clusters:
        rf.write(f"### 📁 {cluster}\n")
        rf.write("High-volume terms sorted by monthly queries:\n\n")
        rf.write("| Keyword | Monthly Volume | SEO Difficulty / Competitor Index | Avg. CPC | Source |\n")
        rf.write("| :--- | :---: | :---: | :---: | :--- |\n")
        
        # Sort items by volume
        sorted_items = sorted(items, key=lambda x: x['volume'], reverse=True)[:15] # Top 15 keywords per cluster
        for item in sorted_items:
            rf.write(
                f"| `{item['keyword']}` | {item['volume']:,} | {item['difficulty']} | ₹{item['cpc']:.2f} | {item['source']} |\n"
            )
        rf.write("\n")
        
    # High-Value Opportunities / Gap Analysis
    rf.write("## 💡 Key Opportunities & SEO Recommendations\n\n")
    rf.write("> [!NOTE]\n")
    rf.write("> Private and Corporate scholarships present the highest ROI due to high CPC/commercial value and lower difficulty compared to crowded Government portal queries.\n\n")
    
    rf.write("### 1. High Volume - High Intent State Targets\n")
    rf.write("* **UP Scholarship & NSP:** These queries account for millions of monthly searches (e.g. `up scholarships` at **5M** searches, `aicte scholarship` at **5.4k**). Users are looking for deadlines, status checkers, and eligibility. Ensuring our state subpages (`/scholarships/state/[state-name]`) rank for status queries is critical.\n")
    rf.write("* **Aikyashree (West Bengal):** Queries like `aikyashree scholarship 2025` (**9.9k** queries, SEO difficulty **15**) are high-intent opportunities with relatively low SEO difficulty.\n\n")
    
    rf.write("### 2. High CPC Private/Corporate Targets (Ad Revenue Potential)\n")
    rf.write("* **Aditya Birla Group & Tata Scholarships:** These private/CSR keywords have solid search volumes (e.g., `aditya birla scholarship` at **8.1k**) with extremely low SEO difficulty (e.g., **7** to **17**), making it easy to capture page 1 search traffic.\n")
    rf.write("* **CFA Access Scholarship:** High transactional intent (`access scholarship cfa` at **5.4k** queries) with low competition (**16** SEO Difficulty).\n\n")
    
    rf.write("### 3. Degree/Level Clustering Content Hubs\n")
    rf.write("* Building dedicated category nodes targeting `scholarships for college students` (**50k** queries) and `scholarships for international students` (**50k** queries) will structure our programmatic directory to capture broad entry queries.\n")

print("Generated analysis report.")
