const token = "8985546274:AAHyqJqGSaFZ8M9fUf8DFuqE8jrAuonzBQo";
const chatId = "-1003701678321"; // parsed from URL web.telegram.org/a/#-1003701678321

async function testTelegram() {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: "🔔 *IndiaScholarships.in Automation Live!*\nThis is a test broadcast from the backend system. Automation is working successfully.",
        parse_mode: "Markdown"
    };

    try {
        console.log("Sending test message to Telegram Channel...");
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.ok) {
            console.log("Success! Message sent:", result.result.text);
        } else {
            console.error("Failed to send message:", result);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

testTelegram();
