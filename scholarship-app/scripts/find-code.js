const fs = require('fs');
const path = require('path');

const transcriptPath = '/Users/roshankumar/.gemini/antigravity/brain/d093b77d-fc31-4842-b9c3-4b4c87f2ac40/.system_generated/logs/transcript.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.log('Transcript file does not exist');
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    // Look for tool calls that create or write to files
    if (data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content') {
          console.log(`Tool call: ${call.name} for target: ${call.args.TargetFile || call.args.Target}`);
          if (call.args.CodeContent) {
            console.log('--- CONTENT START ---');
            console.log(call.args.CodeContent);
            console.log('--- CONTENT END ---');
          }
        }
      }
    }
    // Also look for plans or text containing URL lists
    if (data.content && (data.content.includes('check_urls.py') || data.content.includes('gsc_errors_4xx_5xx.xlsx'))) {
      console.log(`Match in content type: ${data.type}`);
      console.log(data.content.substring(0, 1000));
    }
  } catch (err) {
    // Ignore JSON parse errors
  }
}
