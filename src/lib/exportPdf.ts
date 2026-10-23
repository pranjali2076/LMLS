/**
 * Printable PDF Generator with LMLS Cognitive Branding
 * Generates an executive-formatted printable view and invokes browser print/PDF download.
 */

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToPrintableHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Handle fenced code blocks
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<div class="code-container">
      <div class="code-header">${escapeHtml(lang || 'CODE')}</div>
      <pre><code>${escapeHtml(code.trim())}</code></pre>
    </div>`;
  });

  // Handle blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Handle headings
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Handle bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Handle lists
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  // Clean nested duplicate <ul> tags
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Handle paragraphs
  html = html
    .split(/\n\s*\n/)
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<blockquote')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

export function exportResponseToPdf(
  content: string,
  options?: {
    title?: string;
    modelName?: string;
    timestamp?: string;
    domain?: string;
  }
) {
  if (typeof window === 'undefined') return;

  const title = options?.title || 'LMLS Cognitive Synthesis Report';
  const modelName = options?.modelName || 'LMLS 4 Universal Flagship';
  const dateStr = options?.timestamp || new Date().toLocaleString();
  const domain = options?.domain ? options.domain.toUpperCase() : 'GENERAL INTELLIGENCE';

  const bodyHtml = markdownToPrintableHtml(content);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export printable PDF.');
    return;
  }

  const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - LMLS Cognitive PDF</title>
  <style>
    @page {
      margin: 18mm 16mm;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
      font-size: 13px;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #10b981;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .branding {
      display: flex;
      flex-direction: column;
    }
    .logo-title {
      font-size: 20px;
      font-weight: 800;
      color: #064e3b;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .logo-title span {
      color: #059669;
    }
    .sub-brand {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .header-meta {
      text-align: right;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-title-section {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .report-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .report-meta-pills {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
    h1 {
      font-size: 16px;
      color: #064e3b;
      margin-top: 18px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    h2 {
      font-size: 14px;
      color: #047857;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    h3 {
      font-size: 13px;
      color: #0f172a;
      margin-top: 12px;
      margin-bottom: 4px;
      font-weight: 700;
    }
    p {
      margin: 6px 0 10px 0;
      line-height: 1.65;
    }
    ul {
      margin: 6px 0 12px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    blockquote {
      border-left: 3px solid #10b981;
      background: #f8fafc;
      margin: 12px 0;
      padding: 8px 14px;
      font-style: italic;
      color: #334155;
      border-radius: 0 6px 6px 0;
    }
    .code-container {
      margin: 14px 0;
      border: 1px solid #334155;
      border-radius: 6px;
      overflow: hidden;
      background: #0f172a;
      page-break-inside: avoid;
    }
    .code-header {
      background: #1e293b;
      color: #94a3b8;
      font-size: 10px;
      font-family: monospace;
      padding: 4px 12px;
      text-transform: uppercase;
      font-weight: 600;
      border-bottom: 1px solid #334155;
    }
    pre {
      margin: 0;
      padding: 12px;
      color: #e2e8f0;
      font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    code.inline-code {
      font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 11.5px;
      border: 1px solid #e2e8f0;
    }
    .footer-note {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
      }
      .code-container {
        border-color: #cbd5e1;
      }
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="branding">
      <div class="logo-title">✦ LMLS <span>Cognitive</span></div>
      <div class="sub-brand">Enterprise Universal Reasoning & Strategic AI Workspace</div>
    </div>
    <div class="header-meta">
      <span class="badge">${escapeHtml(domain)}</span>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Verified Executive Transcript</div>
    </div>
  </div>

  <div class="report-title-section">
    <div class="report-title">${escapeHtml(title)}</div>
    <div class="report-meta-pills">
      <span>Model: ${escapeHtml(modelName)}</span>
      <span>•</span>
      <span>Date: ${escapeHtml(dateStr)}</span>
      <span>•</span>
      <span>Status: Certified</span>
    </div>
  </div>

  <div class="report-content">
    ${bodyHtml}
  </div>

  <div class="footer-note">
    <span>Generated by LMLS Cognitive Architecture v2.4</span>
    <span>Confidential & Academic Research Use</span>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.focus();
        window.print();
      }, 250);
    });
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(fullDocument);
  printWindow.document.close();
}
