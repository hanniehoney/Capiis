const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');

const ASSET_HEADERS = ['id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes', 'accountType', 'accountName', 'costBasis', 'purchaseDate', 'lastUpdated'];
const EQUITY_HEADERS = [...ASSET_HEADERS, 'equityType', 'grantDate', 'vestingSchedule', 'strikePrice', 'fmvAtGrant'];
const LIABILITY_HEADERS = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];

const ASSET_FILES = ['stocks', 'crypto', 'angel-investment', 'real-estate', 'cash', 'savings', 'vehicles', 'jewelry', 'art'];
const EQUITY_FILES = ['employee-equity'];
const LIABILITY_FILES = ['credit-cards', 'mortgage', 'auto-loan', 'student-loan'];
const JSON_FILES = ['profile.json', 'tax-summary.json', 'signals.json', 'feed.json', 'watchlist.json'];

function writeEmptyExcel(filename, headers, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
  console.log(`  created empty ${filename}`);
}

console.log('\nClearing Capis data...\n');

for (const f of JSON_FILES) {
  const fp = path.join(DATA_DIR, f);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log(`  deleted ${f}`);
  }
}

for (const cat of ASSET_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, ASSET_HEADERS, 'Holdings');
}
for (const cat of EQUITY_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, EQUITY_HEADERS, 'Holdings');
}
for (const cat of LIABILITY_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, LIABILITY_HEADERS, 'Liabilities');
}

console.log('\nDone. Data cleared. 14 empty xlsx shells created. categories.json preserved.\n');
