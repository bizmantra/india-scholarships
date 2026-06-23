#!/usr/bin/env python3
"""
Research missing scholarship data using Perplexity AI
Fills: amount_annual, age_limit, min_marks, helpline

Requires: PERPLEXITY_API_KEY environment variable
Run: PERPLEXITY_API_KEY=your_key python3 research_missing_data.py
"""

import csv
import os
import time
import requests
import json
import re

PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
if not PERPLEXITY_API_KEY:
    print("❌ Error: Set PERPLEXITY_API_KEY environment variable")
    print("   Example: export PERPLEXITY_API_KEY='your_key_here'")
    exit(1)

def call_perplexity(query):
    """Call Perplexity API"""
    url = 'https://api.perplexity.ai/chat/completions'
    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'sonar-pro',
        'messages': [{
            'role': 'user',
            'content': query
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        print(f"  ⚠️  API Error: {e}")
        return None

def extract_amount(text):
    """Extract numeric amount from response"""
    patterns = [
        r'₹\s*([0-9,]+)',
        r'Rs\.?\s*([0-9,]+)',
        r'INR\s*([0-9,]+)',
        r'([0-9,]+)\s*(?:rupees|INR|per year|annually)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                return int(amount_str)
            except:
                pass
    return None

def extract_age(text):
    """Extract age limit from response"""
    patterns = [
        r'(\d+)\s*(?:years|yrs)',
        r'age\s*(?:limit|:)\s*(\d+)',
        r'under\s*(\d+)',
        r'below\s*(\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def extract_marks(text):
    """Extract minimum marks from response"""
    patterns = [
        r'(\d+)%',
        r'(\d+)\s*percent',
        r'minimum\s*(\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')

# Read CSV
input_file = os.path.join(data_dir, 'wp-migration-export-FIXED.csv')
output_file = os.path.join(data_dir, 'enriched-with-research.csv')

print(f"Reading from: {input_file}\n")

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    fieldnames = reader.fieldnames

print(f"📊 Processing {len(rows)} scholarships")
print(f"⏱️  Estimated time: ~10 minutes (with rate limiting)\n")
print("="*70)

stats = {
    'amount': 0,
    'age': 0,
    'marks': 0,
    'helpline': 0
}

for i, row in enumerate(rows, 1):
    title = row.get('title', '')
    provider = row.get('provider', '')
    
    print(f"\n[{i}/{len(rows)}] {title[:60]}")
    
    needs_research = []
    
    # Check what's missing
    if not row.get('amount_annual') or row['amount_annual'] == '0':
        needs_research.append('amount')
    if not row.get('age_limit') or row['age_limit'].strip() == '':
        needs_research.append('age')
    if not row.get('min_marks') or row['min_marks'] == '0':
        needs_research.append('marks')
    if not row.get('helpline') or row['helpline'].strip() == '':
        needs_research.append('helpline')
    
    if not needs_research:
        print("  ✅ All fields complete, skipping")
        continue
    
    print(f"  🔍 Researching: {', '.join(needs_research)}")
    
    # Research all missing fields in one query
    query = f"""For the '{title}' scholarship by {provider} in India (2026), provide:
1. Scholarship amount (in INR)
2. Age limit (if any)
3. Minimum marks required (percentage)
4. Official helpline number or email

Be concise and specific."""
    
    response = call_perplexity(query)
    
    if response:
        # Extract amount
        if 'amount' in needs_research:
            amount = extract_amount(response)
            if amount:
                row['amount_annual'] = str(amount)
                print(f"  ✅ Amount: ₹{amount:,}")
                stats['amount'] += 1
        
        # Extract age limit
        if 'age' in needs_research:
            age = extract_age(response)
            if age:
                row['age_limit'] = f"Under {age} years"
                print(f"  ✅ Age: Under {age} years")
                stats['age'] += 1
            else:
                row['age_limit'] = "No age limit"
                print(f"  ℹ️  Age: No limit specified")
        
        # Extract marks
        if 'marks' in needs_research:
            marks = extract_marks(response)
            if marks:
                row['min_marks'] = marks
                print(f"  ✅ Marks: {marks}%")
                stats['marks'] += 1
        
        # Extract helpline
        if 'helpline' in needs_research:
            # Look for phone/email in response
            if '@' in response or re.search(r'\d{10}', response):
                helpline_match = re.search(r'[\w\.-]+@[\w\.-]+|\d{10,12}', response)
                if helpline_match:
                    row['helpline'] = helpline_match.group(0)
                    print(f"  ✅ Helpline: {helpline_match.group(0)}")
                    stats['helpline'] += 1
            else:
                row['helpline'] = "Refer to official scholarship website"
                print(f"  ℹ️  Helpline: Using fallback")
    
    # Rate limiting - 3 seconds between requests
    if i < len(rows):
        time.sleep(3)

# Write output
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("\n" + "="*70)
print("✅ RESEARCH COMPLETE!")
print("="*70)
print(f"Amounts researched:  {stats['amount']}")
print(f"Age limits found:    {stats['age']}")
print(f"Marks found:         {stats['marks']}")
print(f"Helplines found:     {stats['helpline']}")
print(f"\n💾 Saved to: {output_file}")
print(f"\n🎉 Next step: Run generate_faqs.py to fill FAQ fields")
