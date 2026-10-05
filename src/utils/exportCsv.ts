import { EvidenceReview, Insight } from '../types.ts';

/**
 * Escapes a cell string for safe CSV output according to RFC 4180.
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  // If value contains quotes, commas, or newlines, wrap in quotes and double internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers browser download of an evidence CSV file.
 */
export function exportEvidenceCsv(insight: Insight, evidence: EvidenceReview[]): void {
  const headers = [
    'Review ID',
    'Date',
    'Rating',
    'Source',
    'Highlighted Quote',
    'Span Start',
    'Span End',
    'Full Review Text',
    'Insight ID',
    'Insight Claim',
    'Insight Aspect',
  ];

  const rows = evidence.map((item) => {
    const highlightedQuote = item.text.slice(item.span_start, item.span_end);
    return [
      escapeCsvCell(item.review_id),
      escapeCsvCell(item.date),
      escapeCsvCell(item.rating),
      escapeCsvCell(item.source),
      escapeCsvCell(highlightedQuote),
      escapeCsvCell(item.span_start),
      escapeCsvCell(item.span_end),
      escapeCsvCell(item.text),
      escapeCsvCell(insight.id),
      escapeCsvCell(insight.claim),
      escapeCsvCell(insight.aspect),
    ].join(',');
  });

  const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `evidence_${insight.id}_${insight.aspect}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
