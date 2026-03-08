const fs = require('fs');
const path = require('path');
const { writeWorksheetFile } = require('../lib/workbook');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Write utilities ---
function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  console.log(`  wrote data/${filename}`);
}

async function writeExcel(filename, rows) {
  const hasEquityFields = rows.some(r => r.equityType);
  const headers = [
    'id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes',
    'accountType', 'accountName', 'costBasis', 'purchaseDate', 'lastUpdated',
    ...(hasEquityFields ? ['equityType', 'grantDate', 'vestingSchedule', 'strikePrice', 'fmvAtGrant', 'fmvAtExercise', 'fmvAtVest'] : [])
  ];
  const data = rows.map(r => {
    const row = {
      id: r.id, name: r.name, ticker: r.ticker,
      quantity: r.quantity, avgCost: r.avgCost,
      currentPrice: r.currentPrice,
      notes: r.notes || '',
      accountType: r.accountType || 'taxable',
      accountName: r.accountName || '',
      costBasis: (r.quantity || 0) * (r.avgCost || 0),
      purchaseDate: r.purchaseDate || '',
      lastUpdated: r.lastUpdated || '2026-02-12'
    };
    if (hasEquityFields) {
      row.equityType = r.equityType || '';
      row.grantDate = r.grantDate || '';
      row.vestingSchedule = r.vestingSchedule || '';
      row.strikePrice = r.strikePrice != null ? r.strikePrice : '';
      row.fmvAtGrant = r.fmvAtGrant != null ? r.fmvAtGrant : '';
      row.fmvAtExercise = r.fmvAtExercise != null ? r.fmvAtExercise : '';
      row.fmvAtVest = r.fmvAtVest != null ? r.fmvAtVest : '';
    }
    return row;
  });
  const widths = [
    20, 20, 10, 10, 12,
    14, 50,
    16, 22, 12, 12, 12
  ];
  if (hasEquityFields) {
    widths.push(10, 12, 20, 12, 12, 14, 14);
  }
  await writeWorksheetFile({
    filePath: path.join(DATA_DIR, filename),
    sheetName: 'Holdings',
    headers,
    rows: data,
    widths
  });
  console.log(`  wrote data/${filename} (${rows.length} rows)`);
}

async function writeExcelLiability(filename, rows) {
  const headers = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];
  const data = rows.map(r => ({
    id: r.id, name: r.name, type: r.type,
    originalAmount: r.originalAmount, currentBalance: r.currentBalance,
    interestRate: r.interestRate, monthlyPayment: r.monthlyPayment,
    dueDate: r.dueDate, notes: r.notes || ''
  }));
  await writeWorksheetFile({
    filePath: path.join(DATA_DIR, filename),
    sheetName: 'Liabilities',
    headers,
    rows: data,
    widths: [20, 30, 15, 15, 15, 12, 15, 12, 50]
  });
  console.log(`  wrote data/${filename} (${rows.length} rows)`);
}

// --- Persona selection ---
const PERSONAS_DIR = path.join(__dirname, 'personas');

function listPersonas() {
  const files = fs.readdirSync(PERSONAS_DIR).filter(f => f.endsWith('.js'));
  return files.map(f => {
    const p = require(path.join(PERSONAS_DIR, f));
    return { key: p.meta.key, name: p.meta.name, tagline: p.meta.tagline };
  });
}

const personaKey = process.argv[2] || 'alex';

if (personaKey === '--list') {
  console.log('\nAvailable personas:\n');
  listPersonas().forEach(p => console.log(`  ${p.key}  —  ${p.tagline}`));
  console.log('\nUsage: node scripts/seed-data.js [persona-key]\n');
  process.exit(0);
}

const personaPath = path.join(PERSONAS_DIR, `${personaKey}.js`);
if (!fs.existsSync(personaPath)) {
  console.error(`\nPersona "${personaKey}" not found.\n`);
  console.log('Available personas:');
  listPersonas().forEach(p => console.log(`  ${p.key}  —  ${p.tagline}`));
  process.exit(1);
}

const persona = require(personaPath);

async function main() {
  console.log(`\nSeeding Capiis data: ${persona.meta.name} (${persona.meta.tagline})...\n`);

  writeJSON('categories.json', persona.categoriesConfig);

  // Asset xlsx
  await writeExcel('stocks.xlsx', persona.stocks);
  await writeExcel('crypto.xlsx', persona.crypto);
  await writeExcel('angel-investment.xlsx', persona.angelInvestment);
  await writeExcel('employee-equity.xlsx', persona.employeeEquity);
  await writeExcel('real-estate.xlsx', persona.realEstate);
  await writeExcel('cash.xlsx', persona.cash);
  await writeExcel('savings.xlsx', persona.savings);
  await writeExcel('vehicles.xlsx', persona.vehicles);
  await writeExcel('jewelry.xlsx', persona.jewelry);
  await writeExcel('art.xlsx', persona.art);

  // Liability xlsx
  await writeExcelLiability('credit-cards.xlsx', persona.creditCards);
  await writeExcelLiability('mortgage.xlsx', persona.mortgage);
  await writeExcelLiability('auto-loan.xlsx', persona.autoLoan);
  await writeExcelLiability('student-loan.xlsx', persona.studentLoan);

  // JSON
  writeJSON('signals.json', persona.signals);
  writeJSON('feed.json', persona.feed);
  writeJSON('watchlist.json', persona.watchlist);
  writeJSON('tax-summary.json', persona.taxSummary);
  writeJSON('profile.json', persona.profile);

  // Profile memory
  fs.writeFileSync(path.join(DATA_DIR, 'profile.md'), persona.profileMemory.trim() + '\n');
  console.log('  wrote data/profile.md');

  console.log(`\nDone. ${persona.meta.name} — ${persona.meta.tagline}\n`);
}

main().catch((error) => {
  console.error(`\nFailed to seed data: ${error.message}\n`);
  process.exit(1);
});
