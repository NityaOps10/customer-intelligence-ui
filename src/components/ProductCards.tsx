import React from 'react';
import { AlertTriangle, ThumbsUp, ThumbsDown, ChevronRight, Package, RotateCcw, AlertCircle } from 'lucide-react';
import { ProductCard } from '../api.ts';
import { SkeletonCard } from './SkeletonCard.tsx';

interface ProductCardsProps {
  products: ProductCard[];
  loading: boolean;
  error: string | null;
  onSelect: (productFamily: string) => void;
  onRetry: () => void;
}

function formatRating(value: number | string | null): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isNaN(n) ? '—' : n.toFixed(2);
}

export const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  loading,
  error,
  onSelect,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-xl mx-auto p-6 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto text-rose-500" />
        <h3 className="text-base font-semibold">Failed to load products</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          <RotateCcw size={13} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="my-12 max-w-md mx-auto p-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-2">
        <Package size={32} className="mx-auto text-zinc-400 dark:text-zinc-600" />
        <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">No products yet</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Upload a dataset with a product column to see one card per product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const lowData = p.insufficient_data;
          return (
            <div
              key={p.product_family}
              role="button"
              tabIndex={lowData ? -1 : 0}
              onClick={() => !lowData && onSelect(p.product_family)}
              onKeyDown={(e) => {
                if (!lowData && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect(p.product_family);
                }
              }}
              className={`group rounded-lg border p-4 transition-all duration-150 ${
                lowData
                  ? 'bg-zinc-100/70 dark:bg-zinc-900/40 border-zinc-300/80 dark:border-zinc-800/80 opacity-75'
                  : 'bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {p.product_family}
                </h3>
                {lowData && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-200/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400" />
                    Not enough data
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-300 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.review_count}</span> reviews
                </div>
                <div>
                  avg <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatRating(p.avg_rating)}</span> / 5
                </div>
              </div>

              {lowData ? (
                <p className="pt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Too few reviews to show reliable patterns.
                </p>
              ) : (
                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <ThumbsUp size={13} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {p.top_praise ? (
                        <>
                          Most praised: <strong className="capitalize">{p.top_praise.aspect}</strong>{' '}
                          <span className="text-zinc-400 font-mono">({p.top_praise.count} reviews)</span>
                        </>
                      ) : (
                        'No clear praise yet'
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ThumbsDown size={13} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {p.top_complaint ? (
                        <>
                          Most criticised: <strong className="capitalize">{p.top_complaint.aspect}</strong>{' '}
                          <span className="text-zinc-400 font-mono">({p.top_complaint.count} reviews)</span>
                        </>
                      ) : (
                        'No clear complaints yet'
                      )}
                    </span>
                  </div>
                </div>
              )}

              {!lowData && (
                <div className="mt-3 pt-2 border-t border-dashed border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  <span>View insights and evidence</span>
                  <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};