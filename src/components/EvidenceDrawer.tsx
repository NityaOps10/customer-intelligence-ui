import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Quote
} from 'lucide-react';
import { EvidenceReview, Insight } from '../types.ts';
import { getEvidenceForInsight } from '../api.ts';
import { exportEvidenceCsv } from '../utils/exportCsv.ts';
import { StarRating } from './StarRating.tsx';

interface EvidenceDrawerProps {
  insight: Insight | null;
  isOpen: boolean;
  onClose: () => void;
}

// Turns 0.067 or 6.7 into "6.7%", and a missing value into "—"
function formatRatePct(rate: unknown): string {
  if (rate === null || rate === undefined || rate === '') return '—';
  const n = Number(rate);
  if (Number.isNaN(n)) return '—';
  const pct = n <= 1 && n > 0 ? n * 100 : n;
  return `${pct.toFixed(1)}%`;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  insight,
  isOpen,
  onClose,
}) => {
  const [evidence, setEvidence] = useState<EvidenceReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load evidence whenever insight changes
  useEffect(() => {
    if (!insight || !isOpen) {
      setEvidence([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getEvidenceForInsight(insight.id)
      .then((data) => {
        if (isMounted) {
          setEvidence(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve evidence reviews');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [insight, isOpen]);

  const handleRetry = () => {
    if (!insight) return;
    setLoading(true);
    setError(null);
    getEvidenceForInsight(insight.id)
      .then((data) => {
        setEvidence(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to retrieve evidence reviews');
        setLoading(false);
      });
  };

  const handleExportCsv = () => {
    if (!insight || evidence.length === 0) return;
    exportEvidenceCsv(insight, evidence);
  };

  if (!isOpen || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="drawer-title" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
        <div className="w-screen max-w-xl sm:max-w-2xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250 ease-out">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-600 dark:text-zinc-300">
                    Evidence Drawer
                  </span>
                  <span>·</span>
                  <span className="capitalize text-zinc-700 dark:text-zinc-300">
                    {insight.aspect}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{insight.sentiment}</span>
                </div>
                <h2 id="drawer-title" className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {insight.claim}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick stats and Export button bar */}
            <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                <div>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{insight.count}</span>
                  <span className="text-zinc-500"> / {insight.denominator} reviews</span>
                </div>
                <span>·</span>
                <div>
                  Rate: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatRatePct(insight.rate)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={loading || evidence.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <Download size={13} />
                <span>Export evidence CSV</span>
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* LOADING STATE */}
            {loading && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <RefreshCw size={13} className="animate-spin text-zinc-400" />
                  <span>Loading supporting customer quotes...</span>
                </div>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3 animate-pulse"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
              <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <AlertCircle size={16} className="text-rose-500" />
                  <span>Failed to load evidence reviews</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Retry loading</span>
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && evidence.length === 0 && (
              <div className="text-center py-12 px-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                <Quote size={28} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  No evidence reviews found
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  There are no verified customer review citations linked to this insight currently.
                </p>
              </div>
            )}

            {/* SUCCESS / LIST OF REVIEWS */}
            {!loading && !error && evidence.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                  <span>
                    Showing {evidence.length} verified customer citations
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Highlighted spans indicate core feedback signals
                  </span>
                </div>

                {evidence.map((item, index) => {
                  const text: string = item.text ?? '';
                  const start = Number(item.span_start);
                  const end = Number(item.span_end);

                  const hasValidSpan =
                    Number.isInteger(start) &&
                    Number.isInteger(end) &&
                    start >= 0 &&
                    end <= text.length &&
                    start < end;

                  const prefixText = hasValidSpan ? text.slice(0, start) : '';
                  const highlightedText = hasValidSpan ? text.slice(start, end) : '';
                  const suffixText = hasValidSpan ? text.slice(end) : text;

                  return (
                    <div
                      key={`${item.review_id}-${item.span_start}-${index}`}
                      className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3"
                    >
                      {/* Review Card Header: Source, Date, Star Rating */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] max-w-[16rem] truncate">
                            {item.source || 'Unknown source'}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500">·</span>
                          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                            <Calendar size={11} />
                            {item.date || 'Unknown date'}
                          </span>
                        </div>

                        <StarRating rating={item.rating} />
                      </div>

                      {/* Full Review Text with highlighted span */}
                      <div className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 pl-3 border-l-2 border-zinc-300 dark:border-zinc-700">
                        {hasValidSpan ? (
                          <>
                            <span>{prefixText}</span>
                            <mark
                              className="bg-amber-200 dark:bg-amber-400/30 text-amber-950 dark:text-amber-100 font-medium px-1 py-0.5 rounded-xs"
                              title="Supporting citation text"
                            >
                              {highlightedText}
                            </mark>
                            <span>{suffixText}</span>
                          </>
                        ) : (
                          <span>{text}</span>
                        )}
                      </div>

                      {/* Footer ID and quote info */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
                        <span className="font-mono">#{item.review_id}</span>
                        {hasValidSpan && (
                          <span className="text-[10px]">
                            Chars: {start}–{end}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <span>Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded">ESC</kbd> to close drawer</span>
          </div>
        </div>
      </div>
    </div>
  );
};