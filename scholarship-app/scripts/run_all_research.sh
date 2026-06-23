#!/bin/bash
# Run all research scripts in sequence
# Usage: ./run_all_research.sh

set -e  # Exit on error

echo "🚀 Starting Automated Scholarship Research"
echo "=========================================="
echo ""

# Check for API keys
if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo "❌ Error: PERPLEXITY_API_KEY not set"
    echo "   Run: export PERPLEXITY_API_KEY='your_key_here'"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    echo "   Run: export OPENAI_API_KEY='your_key_here'"
    exit 1
fi

echo "✅ API keys found"
echo ""

# Step 1: Research missing data with Perplexity
echo "📊 Step 1: Researching missing data (amounts, age, marks, helpline)"
echo "⏱️  This will take ~10 minutes..."
echo ""
python3 scripts/research_missing_data.py

echo ""
echo "=========================================="
echo ""

# Step 2: Generate FAQs with OpenAI
echo "📝 Step 2: Generating FAQs"
echo "⏱️  This will take ~3 minutes..."
echo ""
python3 scripts/generate_faqs.py

echo ""
echo "=========================================="
echo "🎉 ALL DONE!"
echo "=========================================="
echo ""
echo "✅ Final enriched file: data/enriched-FINAL.csv"
echo ""
echo "Next steps:"
echo "1. Review the enriched CSV file"
echo "2. Import to WordPress using WP All Import"
echo "3. Map fields as before"
echo "4. Import as 'Draft' for review"
echo ""
