#!/usr/bin/env python3
"""
Extract eligibility criteria from benefits field
Run: python3 extract_eligibility.py
"""

import csv
import re
import os

def extract_eligibility(benefits_text, title):
    """Extract eligibility from benefits text using patterns"""
    
    if not benefits_text:
        return ""
    
    eligibility_keywords = [
        'eligible', 'eligibility', 'criteria', 'requirements',
        'must be', 'should be', 'applicable to', 'open to',
        'for students', 'pursuing', 'enrolled in'
    ]
    
    # Split into sentences
    sentences = re.split(r'[.!?]\s+', benefits_text)
    
    eligibility_sentences = []
    for sentence in sentences:
        lower_sentence = sentence.lower()
        if any(keyword in lower_sentence for keyword in eligibility_keywords):
            eligibility_sentences.append(sentence.strip())
    
    if eligibility_sentences:
        return '. '.join(eligibility_sentences[:3])  # Top 3 sentences
    
    # Fallback: Extract from title
    if 'SC' in title or 'ST' in title:
        return "Applicable to SC/ST category students"
    elif 'OBC' in title:
        return "Applicable to OBC category students"
    elif 'Minority' in title:
        return "Applicable to Minority community students"
    
    return "Check official notification for detailed eligibility criteria"

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')

# Read CSV
input_file = os.path.join(data_dir, 'wp-migration-export-FIXED.csv')
output_file = os.path.join(data_dir, 'enriched-step1-eligibility.csv')

print(f"Reading from: {input_file}")

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    fieldnames = reader.fieldnames

print(f"Processing {len(rows)} scholarships...")

# Extract eligibility
updated = 0
for row in rows:
    if not row.get('eligibility') or row['eligibility'].strip() == '':
        benefits = row.get('benefits', '')
        title = row.get('title', '')
        row['eligibility'] = extract_eligibility(benefits, title)
        updated += 1

# Write output
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Updated {updated} eligibility fields")
print(f"✅ Saved to: {output_file}")
