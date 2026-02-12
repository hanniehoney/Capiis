const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');

const FIELDS = ['id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes'];
const LIABILITY_FIELDS = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];

let _categoriesCache = null;
let _categoriesMtime = 0;

function readCategoriesConfig() {
  const configPath = path.join(DATA_DIR, 'categories.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    const stat = fs.statSync(configPath);
    if (_categoriesCache && stat.mtimeMs === _categoriesMtime) return _categoriesCache;
    _categoriesCache = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    _categoriesMtime = stat.mtimeMs;
    return _categoriesCache;
  } catch (e) {
    console.error('Error reading categories.json:', e.message);
    return null;
  }
}

function isLiabilityCategory(category, config) {
  if (!config || !config.liabilityClasses) return false;
  for (const cls of Object.values(config.liabilityClasses)) {
    if (cls.categories.includes(category)) return true;
  }
  return false;
}

function discoverExcelFiles() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
    .map(f => ({
      file: f,
      category: path.basename(f, '.xlsx'),
      path: path.join(DATA_DIR, f)
    }));
}

function readExcelHoldings(filePath, category) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  return rows
    .filter(r => r.id)
    .map(r => {
      const holding = {
        id: String(r.id),
        name: String(r.name || ''),
        ticker: String(r.ticker || ''),
        category,
        quantity: Number(r.quantity) || 0,
        avgCost: Number(r.avgCost) || 0,
        currentPrice: Number(r.currentPrice) || 0,
        notes: String(r.notes || ''),
        accountType: String(r.accountType || 'taxable'),
        accountName: String(r.accountName || ''),
        costBasis: Number(r.costBasis) || (Number(r.quantity) || 0) * (Number(r.avgCost) || 0),
        purchaseDate: String(r.purchaseDate || ''),
        lastUpdated: String(r.lastUpdated || '')
      };
      // Phase 1 equity fields (present in employee-equity)
      if (r.equityType) holding.equityType = String(r.equityType);
      if (r.grantDate) holding.grantDate = String(r.grantDate);
      if (r.vestingSchedule) holding.vestingSchedule = String(r.vestingSchedule);
      if (r.strikePrice != null && r.strikePrice !== '') holding.strikePrice = Number(r.strikePrice);
      if (r.fmvAtGrant != null && r.fmvAtGrant !== '') holding.fmvAtGrant = Number(r.fmvAtGrant);
      return holding;
    });
}

function readExcelLiabilities(filePath, category) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  return rows
    .filter(r => r.id)
    .map(r => ({
      id: String(r.id),
      name: String(r.name || ''),
      type: String(r.type || ''),
      category,
      originalAmount: Number(r.originalAmount) || 0,
      currentBalance: Number(r.currentBalance) || 0,
      interestRate: Number(r.interestRate) || 0,
      monthlyPayment: Number(r.monthlyPayment) || 0,
      dueDate: String(r.dueDate || ''),
      notes: String(r.notes || '')
    }));
}

function readAllPortfolioData() {
  const files = discoverExcelFiles();
  const config = readCategoriesConfig();
  const assets = [];
  const liabilities = [];

  for (const f of files) {
    try {
      if (isLiabilityCategory(f.category, config)) {
        liabilities.push(...readExcelLiabilities(f.path, f.category));
      } else {
        assets.push(...readExcelHoldings(f.path, f.category));
      }
    } catch (e) {
      console.error(`Error reading ${f.file}: ${e.message}`);
    }
  }

  return {
    lastUpdated: new Date().toISOString(),
    holdings: assets,
    assets,
    liabilities,
    config
  };
}

module.exports = { discoverExcelFiles, readExcelHoldings, readExcelLiabilities, readAllPortfolioData, readCategoriesConfig, isLiabilityCategory, DATA_DIR };
