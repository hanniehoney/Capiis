const ExcelJS = require('exceljs');

function normalizeCellValue(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];

  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return value.richText.map(part => part.text || '').join('');
    }
    if (value.text != null) return String(value.text);
    if (value.hyperlink) return String(value.text || value.hyperlink);
    if (value.result != null) return normalizeCellValue(value.result);
    if (value.formula) return '';
    if (value.error) return '';
  }

  return value;
}

async function readWorksheetRows(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers = worksheet.getRow(1).values
    .slice(1)
    .map(value => String(normalizeCellValue(value) || '').trim());

  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const mapped = {};
    let hasData = false;

    headers.forEach((header, index) => {
      if (!header) return;
      const value = normalizeCellValue(row.getCell(index + 1).value);
      if (value !== '' && value != null) hasData = true;
      mapped[header] = value;
    });

    if (hasData) rows.push(mapped);
  }

  return rows;
}

async function writeWorksheetFile({ filePath, sheetName, headers, rows, widths = [] }) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = headers.map((header, index) => ({
    header,
    key: header,
    width: widths[index] || 12
  }));
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  rows.forEach(row => {
    const orderedRow = {};
    headers.forEach(header => {
      const value = row[header];
      orderedRow[header] = value == null ? '' : value;
    });
    worksheet.addRow(orderedRow);
  });

  await workbook.xlsx.writeFile(filePath);
}

module.exports = {
  readWorksheetRows,
  writeWorksheetFile
};
