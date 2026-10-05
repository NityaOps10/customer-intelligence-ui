import React, { useEffect, useState } from 'react';
import { Megaphone, Wrench, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react';
import { getMarketing, MarketingIdeas, MarketingItem } from '../api.ts';

interface MarketingPanelProps {
  product: string;
}

function Badges({ item }: { item: MarketingItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 capitalize">
        {item.strength}
      </span>
      {item.low_data && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300">
          <AlertTriangle size={10} /> Low data
        </span>
      )}
    </div>
  );
}

function Quotes({ item }: { item: MarketingItem }) {
  if (item.quotes.length === 0) return null;
  return (
    <ul className="space-y-1.5 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
      {item.quotes.map((q) => (
        <li key={q.review_id} className="text-xs text-zinc-600 dark:text-zinc-300">
          <span className="italic">“{q.quote}”</span>
          {q.rating !== null && (
            <span className="ml-1.5 font-mono text-[10px] text-zinc-400">{q.rating}/5</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export const MarketingPanel: React.FC<MarketingPanelProps> = ({ product }) => {
  const [data, setData] = useState<MarketingIdeas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMarketing(product));
    } catch (err: any) {
      setError(err.message || 'Failed to load marketing ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [product]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono py-6">
        <RotateCcw size={12} className="animate-spin" />
        <span>Building marketing ideas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 max-w-xl p-5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <AlertCircle size={16} /> Could not load marketing ideas
        </div>
        <p className="text-xs">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700"
        >
          <RotateCcw size={12} /> Retry
        </button>
      </div>
    );
  }

  const fix = data?.reduce_negative ?? [];
  const promote = data?.attract ?? [];

  if (fix.length === 0 && promote.length === 0) {
    return (
      <div className="my-8 max-w-md mx-auto p-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-2">
        <Megaphone size={28} className="mx-auto text-zinc-400" />
        <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">Not enough data for ideas</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ideas appear once customers mention the same topic in at least two reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Safety note */}
      <div className="flex items-start gap-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p>
          Use only claims the reviews support, and check the count shown on each idea before you publish it.
          Quoting a customer's review in public marketing usually needs the reviewer's permission and must
          follow the review platform's rules. Ideas marked "Low data" rest on very few reviews.
        </p>
      </div>

      {/* Reduce negative reviews */}
      {fix.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench size={15} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reduce negative reviews</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {fix.map((item) => (
              <div
                key={item.insight_id}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                      Fix {item.aspect}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {item.count} of {item.denominator} reviews
                      {item.rate_percent !== null ? ` (${item.rate_percent}%)` : ''} complain about this
                    </p>
                  </div>
                  <Badges item={item} />
                </div>
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  {(item.actions ?? []).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                <Quotes item={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Attract customers */}
      {promote.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone size={15} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Attract more customers</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {promote.map((item) => (
              <div
                key={item.insight_id}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                      Promote {item.aspect}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {item.count} of {item.denominator} reviews
                      {item.rate_percent !== null ? ` (${item.rate_percent}%)` : ''} praise this
                    </p>
                  </div>
                  <Badges item={item} />
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Build your message around what customers already say. Use their own words, not marketing language.
                </p>
                <Quotes item={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};