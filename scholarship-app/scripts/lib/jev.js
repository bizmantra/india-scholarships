/**
 * TypeSafe Jev: a hosted decision model. It reads a piece of text (the "state") and answers typed questions about it
 * in a single pass: noul = yes/no probability, choice = one of several labels, score = a level on a scale.
 * Docs: https://docs.typesafe.ai  (POST /v1/systemone)
 *
 * Optional. Without TYPESAFE_API_KEY every function here quietly returns null and the evidence score is worked out
 * from the other signals. Only short excerpts of public web pages are ever sent, never student or site data.
 * The key is read from the environment and is never logged.
 */
const BASE = (process.env.TYPESAFE_BASE_URL || 'https://api.typesafe.ai').replace(/\/+$/, '');
const MODEL = process.env.JEV_MODEL || 'jev-latest';

const enabled = () => Boolean(process.env.TYPESAFE_API_KEY);

let warned = false;
const stats = { calls: 0, failed: 0, inputTokens: 0 };

/** Ask several questions about one text. Returns { questionName: answer } or null when unavailable. */
async function decide(state, questions) {
    if (!enabled()) return null;
    try {
        const res = await fetch(`${BASE}/v1/systemone`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, state: String(state).slice(0, 6000), questions }),
            signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        stats.calls++;
        stats.inputTokens += data.usage?.input_tokens || 0;
        return data.answers || null;
    } catch (error) {
        stats.failed++;
        if (!warned) { warned = true; console.warn(`⚠️  Jev unavailable (${error.message}); evidence scores use the other signals only.`); }
        return null;
    }
}

const yes = (answers, name) => (typeof answers?.[name]?.noul === 'number' ? answers[name].noul : null);

module.exports = { decide, yes, enabled, stats };
