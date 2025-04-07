export function generateCSV(config, submissions) {
    // Gather the column headers from config.fields
    // Each fieldName becomes a column, plus maybe "timestamp" or "submissionId" 
    const headers = ['submissionId', 'timestamp', ...config.fields.map(f => f.fieldName)];
  
    // Build rows
    const rows = submissions.map(sub => {
      // sub.data = { fieldName: value, ... }
      // We'll create array in the same order as headers
      const rowData = [];
      headers.forEach(h => {
        if (h === 'submissionId') {
          rowData.push(sub.submissionId);
        } else if (h === 'timestamp') {
          rowData.push(sub.timestamp);
        } else {
          // it's a fieldName
          rowData.push(sub.data[h] ?? '');
        }
      });
      return rowData;
    });
  
    // Convert to CSV string
    const csvLines = [];
    // First line: headers
    csvLines.push(headers.join(','));
    // Then each row
    rows.forEach(r => {
      // Escape double-quotes, wrap in quotes in case of commas, etc.
      const escaped = r.map(val => `"${String(val).replace(/"/g, '""')}"`);
      csvLines.push(escaped.join(','));
    });
  
    return csvLines.join('\n');
  }
  