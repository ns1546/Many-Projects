import Papa from 'papaparse';

export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  // Clean data — convert Firestore Timestamps to readable strings
  const cleaned = data.map(row => {
    const clean = {};
    for (const [key, val] of Object.entries(row)) {
      if (val && typeof val === 'object' && typeof val.toDate === 'function') {
        clean[key] = val.toDate().toLocaleString();
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        clean[key] = JSON.stringify(val);
      } else if (Array.isArray(val)) {
        clean[key] = val.map(v => (typeof v === 'object' ? JSON.stringify(v) : v)).join(' | ');
      } else {
        clean[key] = val;
      }
    }
    return clean;
  });

  const csv = Papa.unparse(cleaned);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
