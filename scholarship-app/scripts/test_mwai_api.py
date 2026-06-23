import requests
import json

URL = "https://mediumpurple-sparrow-753119.hostingersite.com/wp-json/mwai/v1/simpleJsonQuery"
TOKEN = "indiasholarship_secret_key"

payload = {
    "message": "Research the HDFC Badhte Kadam Scholarship 2025-26 in India. Return the definitive data for the current year.",
    "options": {
        "envId": "x5wu1bih",
        "model": "sonar"
    },
    "schema": {
        "title": "Scholarship",
        "type": "object",
        "properties": {
            "amount": {"type": "integer"},
            "deadline": {"type": "string"},
            "eligibility": {"type": "string"},
            "benefits": {"type": "string"}
        },
        "required": ["amount", "deadline", "eligibility", "benefits"]
    }
}

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

print("🚀 Testing WordPress AI Engine API...")
try:
    response = requests.post(URL, json=payload, headers=headers, timeout=60)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Success! Response:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Failed: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
