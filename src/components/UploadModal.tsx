
import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle, RotateCcw } from 'lucide-react';

export interface UploadPayload {
  file: File;
  name: string;
  source: string;
  permission: string;
  mapping: Record<string, string>; // field -> CSV column name
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UploadPayload) => Promise<void>;
}

const FIELDS: { key: string; label: string; required: boolean }[] = [
  { key: 'review_text', label: 'Review text', required: true },
  { key: 'rating', label: 'Rating', required: false },
  { key: 'date', label: 'Date', required: false },
  { key: 'product', label: 'Product', required: false },
];

const GUESSES: Record<string, string[]> = {
  review_text: ['review', 'text', 'comment', 'body', 'content'],
  rating: ['rating', 'stars', 'score'],
  date: ['date', 'time', 'created'],
  product: ['product', 'item', 'asin', 'title'],
};

// Small CSV reader (handles quotes and commas inside quotes). Reads only what the preview needs.
function parseCsv(text: string, maxRows: number): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length && rows.length < maxRows; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (rows.length < maxRows && (cell !== '' || row.length > 0)) {
    row.push(cell);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }
  return rows;
}

function guessColumn(field: string, headers: string[]): string {
  const hints = GUESSES[field] || [];
  const found = headers.find((h) => hints.some((hint) => h.toLowerCase().includes(hint)));
  return found || '';
}

const inputClass =
  'w-full px-2.5 py-1.5 text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [permission, setPermission] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null); setHeaders([]); setPreview([]); setMapping({});
    setName(''); setSource(''); setPermission('');
    setBusy(false); setError(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file. Excel support comes later.');
      return;
    }
    try {
      const text = await f.text();
      const rows = parseCsv(text, 6);
      if (rows.length < 2) {
        setError('The file needs a header row and at least one review.');
        return;
      }
      const hdrs = rows[0].map((h) => h.trim());
      setFile(f);
      setHeaders(hdrs);
      setPreview(rows.slice(1, 4));
      setName(f.name.replace(/\.csv$/i, ''));
      const guessed: Record<string, string> = {};
      FIELDS.forEach((fl) => { guessed[fl.key] = guessColumn(fl.key, hdrs); });
      setMapping(guessed);
    } catch {
      setError('Could not read that file.');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!file) return setError('Choose a file first.');
    if (!name.trim()) return setError('Give the dataset a name.');
    if (!mapping.review_text) return setError('Pick which column holds the review text.');
    setBusy(true);
    try {
      await onSubmit({
        file,
        name: name.trim(),
        source: source.trim(),
        permission: permission.trim(),
        mapping,
      });
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
      setBusy(false);
    }
  };

  const close = () => { if (!busy) { reset(); onClose(); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={close}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Upload review data"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload review data</h3>
          <button type="button" onClick={close} aria-label="Close" className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* 1. File */}
          <div>
            <input
              ref={fileInput}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {!file ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <Upload size={24} />
                <span className="font-medium">Choose a CSV file of your reviews</span>
                <span className="text-[11px] text-zinc-400">One review per row, with a header row</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="shrink-0 text-zinc-500" />
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">{file.name}</span>
                </div>
                <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                  <RotateCcw size={11} /> Change
                </button>
              </div>
            )}
          </div>

          {file && (
            <>
              {/* 2. About the data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Dataset name</span>
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Source platform (optional)</span>
                  <input className={inputClass} placeholder="e.g. Amazon, Google Play, own survey" value={source} onChange={(e) => setSource(e.target.value)} />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Permission to use (optional)</span>
                  <input className={inputClass} placeholder="e.g. my own customers' reviews, licensed dataset, official API" value={permission} onChange={(e) => setPermission(e.target.value)} />
                </label>
              </div>

              {/* 3. Column mapping */}
              <div className="space-y-2">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">Match your columns</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FIELDS.map((fl) => (
                    <label key={fl.key} className="space-y-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {fl.label}{fl.required ? ' *' : ''}
                      </span>
                      <select
                        className={inputClass}
                        value={mapping[fl.key] || ''}
                        onChange={(e) => setMapping({ ...mapping, [fl.key]: e.target.value })}
                      >
                        <option value="">{fl.required ? 'Choose a column' : 'None'}</option>
                        {headers.map((h, i) => (
                          <option key={`${h}-${i}`} value={h}>{h}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Preview */}
              <div className="space-y-2">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">First rows of your file</p>
                <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-[11px] font-mono">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="text-left px-2 py-1.5 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-zinc-700 dark:text-zinc-300">
                      {preview.map((r, ri) => (
                        <tr key={ri} className="border-t border-zinc-100 dark:border-zinc-800">
                          {headers.map((_, ci) => (
                            <td key={ci} className="px-2 py-1.5 max-w-[220px] truncate">{r[ci] ?? ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800">
          <button type="button" onClick={close} disabled={busy} className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={busy || !file} className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50">
            {busy ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};