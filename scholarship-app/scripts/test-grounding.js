const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

async function testGrounding() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: "Who won the 2026 IPL?"
                    }
                ]
            }
        ],
        tools: [
            {
                googleSearch: {}
            }
        ]
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            console.log("Response text:", data.candidates[0].content.parts[0].text);
            if (data.candidates[0].groundingMetadata) {
                console.log("Grounding metadata found!");
            }
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testGrounding();
