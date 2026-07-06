export function sanitizeCSV(val: unknown): string {
  const str = val == null ? '' : String(val);
  const dangerous = /^[=+\-@\t\r]/;
  const escaped = dangerous.test(str) ? `'${str}` : str;
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  return escaped;
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => sanitizeCSV(row[h])).join(','))
  ].join('\n');
  downloadBlob(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, `${filename}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadPDF(title: string, tableRows: string[], reportType?: string) {
  const date = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const rows = tableRows.map(r => `<tr>${r}</tr>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#333}
h1{font-size:24px;margin-bottom:4px}
.sub{color:#666;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-top:16px}
th{font-weight:bold;text-transform:uppercase;font-size:11px;color:#555}
tr:nth-child(even){background:#fafafa}
@media print{body{padding:20px}@page{margin:15mm}}
</style></head><body>
<h1>${title}</h1>
<p class="sub">Generated: ${date}</p>
<table><tbody>${rows}</tbody></table>
<script>window.print()</script></body></html>`;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
