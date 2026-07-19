const { getSheetHeaders } = require('../lib/google-sheets');
async function run() {
  const headers = await getSheetHeaders();
  console.log('Headers in Sheet:', headers);
}
run();
