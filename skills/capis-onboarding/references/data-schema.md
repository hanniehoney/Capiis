# Capis Data Schemas

## Portfolio Data (Excel)

Portfolio data lives in `data/*.xlsx` files. Each file represents one asset category (filename = category). The server reads these on every API request via `lib/excel.js`.

**To manage portfolio data, use Claude Code's built-in xlsx skill to read/write the Excel files directly.**

### Asset Excel Column Schema

Each asset `.xlsx` file has a single sheet named "Holdings" with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | Unique lowercase ID (e.g., aapl, btc, startup-nexaflow) |
| `name` | string | yes | Full asset name |
| `ticker` | string | yes | Ticker symbol, or PRIVATE for angel investments |
| `quantity` | number | yes | Number of shares/coins/units |
| `avgCost` | number | yes | Average cost per unit (total investment for angel investments) |
| `currentPrice` | number | yes | Current price per unit (estimated value for angel investments) |
| `notes` | string | yes | Investment thesis or notes |
| `accountType` | string | no | Account type: taxable, roth-ira, traditional-401k, hsa, 529, etc. Defaults to "taxable" |
| `accountName` | string | no | Human-readable account name (e.g., "Schwab Brokerage") |
| `costBasis` | number | no | Total cost basis. Defaults to quantity * avgCost |
| `purchaseDate` | string | no | ISO date of purchase (e.g., "2023-03-15") |
| `lastUpdated` | string | no | ISO date when the row was last updated |

### Employee Equity Additional Columns

These columns are specific to `employee-equity.xlsx`:

| Column | Type | Description |
|--------|------|-------------|
| `equityType` | string | RSU, ISO, or ESPP |
| `grantDate` | string | ISO date of the grant |
| `vestingSchedule` | string | Human-readable (e.g., "4yr quarterly", "4yr with 1yr cliff") |
| `strikePrice` | number | Strike/exercise price (0 for RSUs) |
| `fmvAtGrant` | number | Fair market value per share at grant date |

### Liability Excel Column Schema

Each liability `.xlsx` file has a single sheet named "Liabilities" with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | Unique lowercase ID (e.g., amex-plat, cupertino-mortgage) |
| `name` | string | yes | Full liability name |
| `type` | string | yes | Revolving, Fixed 30yr, Fixed 60mo, etc. |
| `originalAmount` | number | yes | Original loan/credit amount (0 for revolving credit) |
| `currentBalance` | number | yes | Current outstanding balance |
| `interestRate` | number | yes | Annual interest rate as percentage (e.g., 6.75) |
| `monthlyPayment` | number | yes | Monthly payment amount |
| `dueDate` | string | yes | Maturity date or next payment date (ISO date) |
| `notes` | string | yes | Additional notes |

### Asset Files

| File | Category |
|------|----------|
| `stocks.xlsx` | stocks |
| `crypto.xlsx` | crypto |
| `angel-investment.xlsx` | angel-investment |
| `employee-equity.xlsx` | employee-equity |
| `real-estate.xlsx` | real-estate |
| `cash.xlsx` | cash |
| `savings.xlsx` | savings |
| `vehicles.xlsx` | vehicles |
| `jewelry.xlsx` | jewelry |
| `art.xlsx` | art |

### Liability Files

| File | Category |
|------|----------|
| `credit-cards.xlsx` | credit-cards |
| `mortgage.xlsx` | mortgage |
| `auto-loan.xlsx` | auto-loan |
| `student-loan.xlsx` | student-loan |

## profile.json Schema

```json
{
  "personal": {
    "name": "string",
    "occupation": "string",
    "company": "string",
    "yearsOfExperience": "number",
    "title": "string"
  },
  "family": {
    "spouse": "string (optional)",
    "children": [
      { "name": "string", "age": "number" }
    ]
  },
  "location": {
    "country": "string (e.g., US)",
    "state": "string (e.g., CA)",
    "city": "string",
    "zipCode": "string",
    "fullAddress": "string"
  },
  "tax": {
    "filingStatus": "single | married-joint | married-separate | head-of-household",
    "dependents": "number",
    "federalTaxBracket": "decimal (e.g., 0.32)",
    "stateTaxRate": "decimal (e.g., 0.093 for California)",
    "longTermCapitalGainsRate": "decimal",
    "shortTermCapitalGainsRate": "decimal",
    "niit": "decimal (Net Investment Income Tax, 0.038)",
    "niitThreshold": "number (250000 for MFJ, 200000 for single)",
    "standardDeduction": "number",
    "contributionLimits": {
      "traditional401k": "number",
      "catchUp401k": "number",
      "ira": "number",
      "catchUpIRA": "number",
      "hsaSelf": "number",
      "hsaFamily": "number"
    },
    "notes": "string"
  },
  "accounts": [
    {
      "id": "acct-{slug}",
      "name": "string",
      "type": "checking | savings | taxable | roth-ira | traditional-ira | traditional-401k | roth-401k | hsa | 529 | direct",
      "institution": "string"
    }
  ],
  "lastUpdated": "ISO 8601"
}
```

## Account Types

| Type | Tax Treatment |
|------|--------------|
| `taxable` | Gains taxed when realized |
| `roth-ira` | Tax-exempt growth, qualified withdrawals tax-free |
| `traditional-401k` | Tax-deferred, contributions may reduce taxable income |
| `traditional-ira` | Tax-deferred |
| `roth-401k` | After-tax contributions, tax-free qualified withdrawals |
| `hsa` | Triple tax-advantaged (deductible, tax-free growth, tax-free medical) |
| `529` | Tax-free growth for qualified education expenses |
| `direct` | Directly held, tax varies |
| `checking` | Bank account, interest taxable |
| `savings` | Savings account, interest taxable |
