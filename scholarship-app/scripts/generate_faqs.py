#!/usr/bin/env python3
"""
Generate FAQs using OpenAI GPT
Requires: OPENAI_API_KEY environment variable
Run: OPENAI_API_KEY=your_key python3 generate_faqs.py
"""

import csv
import os
import time
import json

try:
    from openai import OpenAI
except ImportError:
    print("❌ Error: OpenAI library not installed")
    print("   Run: pip3 install openai")
    exit(1)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("❌ Error: Set OPENAI_API_KEY environment variable")
    print("   Example: export OPENAI_API_KEY='your_key_here'")
    exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_faqs(title, provider, benefits):
    """Generate 3 FAQs using GPT"""
    
    prompt = f"""Generate 3 frequently asked questions and answers for this scholarship:

Title: {title}
Provider: {provider}
Benefits: {benefits[:400]}

Create FAQs that cover:
1. Eligibility or who can apply
2. Application process or how to apply
3. Scholarship benefits or amount

Format as a JSON array with this exact structure:
[
  {{"q": "Question 1?", "a": "Answer 1"}},
  {{"q": "Question 2?", "a": "Answer 2"}},
  {{"q": "Question 3?", "a": "Answer 3"}}
]

Keep answers under 50 words each. Be specific and helpful."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        
        # Try to parse JSON
        try:
            # Remove markdown code blocks if present
            content = content.replace('```json', '').replace('```', '').strip()
            faqs = json.loads(content)
            return json.dumps(faqs)
        except:
            # If not valid JSON, return as-is
            return content
            
    except Exception as e:
        print(f"  ⚠️  API Error: {e}")
        return None

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')

# Read CSV
input_file = os.path.join(data_dir, 'enriched-with-research.csv')
output_file = os.path.join(data_dir, 'enriched-FINAL.csv')

# Check if research file exists, otherwise use original
if not os.path.exists(input_file):
    input_file = os.path.join(data_dir, 'wp-migration-export-FIXED.csv')
    print(f"⚠️  Research file not found, using original: {input_file}")
else:
    print(f"Reading from: {input_file}")

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    fieldnames = reader.fieldnames

print(f"\n📊 Processing {len(rows)} scholarships")
print(f"⏱️  Estimated time: ~3 minutes\n")
print("="*70)

generated = 0
skipped = 0

for i, row in enumerate(rows, 1):
    faq = row.get('faq_json', '').strip()
    
    # Skip if FAQ already exists
    if faq:
        skipped += 1
        continue
    
    title = row.get('title', '')
    provider = row.get('provider', '')
    benefits = row.get('benefits', '')
    
    print(f"\n[{i}/{len(rows)}] {title[:60]}")
    print(f"  🤖 Generating FAQs...")
    
    faqs = generate_faqs(title, provider, benefits)
    
    if faqs:
        row['faq_json'] = faqs
        print(f"  ✅ Generated 3 FAQs")
        generated += 1
    else:
        print(f"  ❌ Failed to generate")
    
    # Rate limiting
    time.sleep(1)

# Write output
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("\n" + "="*70)
print("✅ FAQ GENERATION COMPLETE!")
print("="*70)
print(f"FAQs generated:  {generated}")
print(f"Already had FAQs: {skipped}")
print(f"\n💾 FINAL enriched file: {output_file}")
print(f"\n🎉 All done! This file is ready to import to WordPress.")
print(f"\nNext steps:")
print(f"1. Review a few random scholarships in the CSV")
print(f"2. Import to WordPress using WP All Import")
print(f"3. Set imported scholarships as 'Draft' for review")
