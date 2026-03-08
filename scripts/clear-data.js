const fs = require('fs');
const path = require('path');
const { writeWorksheetFile } = require('../lib/workbook');

const DATA_DIR = path.join(__dirname, '..', 'data');

const ASSET_HEADERS = ['id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes', 'accountType', 'accountName', 'costBasis', 'purchaseDate', 'lastUpdated'];
const EQUITY_HEADERS = [...ASSET_HEADERS, 'equityType', 'grantDate', 'vestingSchedule', 'strikePrice', 'fmvAtGrant'];
const LIABILITY_HEADERS = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];

const ASSET_FILES = ['stocks', 'crypto', 'angel-investment', 'real-estate', 'cash', 'savings', 'vehicles', 'jewelry', 'art'];
const EQUITY_FILES = ['employee-equity'];
const LIABILITY_FILES = ['credit-cards', 'mortgage', 'auto-loan', 'student-loan'];
const JSON_FILES = ['profile.json', 'tax-summary.json', 'signals.json', 'feed.json', 'watchlist.json'];

async function writeEmptyExcel(filename, headers, sheetName) {
  await writeWorksheetFile({
    filePath: path.join(DATA_DIR, filename),
    sheetName,
    headers,
    rows: []
  });
  console.log(`  created empty ${filename}`);
}

async function main() {
  console.log('\nClearing Capiis data...\n');

  for (const f of JSON_FILES) {
    const fp = path.join(DATA_DIR, f);
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
      console.log(`  deleted ${f}`);
    }
  }

  for (const cat of ASSET_FILES) {
    await writeEmptyExcel(`${cat}.xlsx`, ASSET_HEADERS, 'Holdings');
  }
  for (const cat of EQUITY_FILES) {
    await writeEmptyExcel(`${cat}.xlsx`, EQUITY_HEADERS, 'Holdings');
  }
  for (const cat of LIABILITY_FILES) {
    await writeEmptyExcel(`${cat}.xlsx`, LIABILITY_HEADERS, 'Liabilities');
  }

  // Write profile.md template
  const PROFILE_MD_TEMPLATE = `# Profile Memory

> Last updated: (not yet set)

## Career & Identity

(Tell Claude about yourself — job, company, career history)

## Family & Life Stage

(Family situation, kids, life stage)

## Financial Philosophy & Risk

(How do you think about investing? Risk tolerance?)

## Goals & Priorities

(What are you working toward financially?)

## Key Decisions & Context

(Why did you make certain financial decisions?)

## Recent Changes & Events

(Life changes, job switches, major purchases — Claude will update this from conversations)
`;

  fs.writeFileSync(path.join(DATA_DIR, 'profile.md'), PROFILE_MD_TEMPLATE);
  console.log('  reset profile.md to template');

  console.log('\nDone. Data cleared. 14 empty xlsx shells created. profile.md reset. categories.json preserved.\n');
}

main().catch((error) => {
  console.error(`\nFailed to clear data: ${error.message}\n`);
  process.exit(1);
});
