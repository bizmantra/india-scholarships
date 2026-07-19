const { getSheetData } = require('../lib/google-sheets');
async function run() {
  const data = await getSheetData();
  console.log('Row 0 (Headers):', data[0]);
  console.log('Row 1 (First data row):', data[1]);
}
run();
