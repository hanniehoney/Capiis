const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Write utilities ---
function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  console.log(`  wrote data/${filename}`);
}

function writeExcel(filename, rows) {
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
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const cols = [
    { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 14 }, { wch: 50 },
    { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  if (hasEquityFields) {
    cols.push({ wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 });
  }
  ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Holdings');
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
  console.log(`  wrote data/${filename} (${rows.length} rows)`);
}

function writeExcelLiability(filename, rows) {
  const headers = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];
  const data = rows.map(r => ({
    id: r.id, name: r.name, type: r.type,
    originalAmount: r.originalAmount, currentBalance: r.currentBalance,
    interestRate: r.interestRate, monthlyPayment: r.monthlyPayment,
    dueDate: r.dueDate, notes: r.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  ws['!cols'] = [
    { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 50 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Liabilities');
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
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

// --- Write all data ---
console.log(`\nSeeding Capiis data: ${persona.meta.name} (${persona.meta.tagline})...\n`);

writeJSON('categories.json', persona.categoriesConfig);

// Asset xlsx
writeExcel('stocks.xlsx', persona.stocks);
writeExcel('crypto.xlsx', persona.crypto);
writeExcel('angel-investment.xlsx', persona.angelInvestment);
writeExcel('employee-equity.xlsx', persona.employeeEquity);
writeExcel('real-estate.xlsx', persona.realEstate);
writeExcel('cash.xlsx', persona.cash);
writeExcel('savings.xlsx', persona.savings);
writeExcel('vehicles.xlsx', persona.vehicles);
writeExcel('jewelry.xlsx', persona.jewelry);
writeExcel('art.xlsx', persona.art);

// Liability xlsx
writeExcelLiability('credit-cards.xlsx', persona.creditCards);
writeExcelLiability('mortgage.xlsx', persona.mortgage);
writeExcelLiability('auto-loan.xlsx', persona.autoLoan);
writeExcelLiability('student-loan.xlsx', persona.studentLoan);

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
