import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { Insight, Strength } from '../types.ts';

interface InsightCardProps {
  insight: Insight;
  isSelected?: boolean;
  onClick: () => void;
}

type MaybeNumber = number | string | null | undefined;

// Returns a percentage number, or null if the value is missing or not a number
function toPct(value: MaybeNumber): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n <= 1 && n > 0 ? n * 100 : n;
}

function formatRate(rate: MaybeNumber): string {
  const pct = toPct(rate);
  return pct === null ? '—' : `${pct.toFixed(1)}%`;
}

// Returns null when there is no previous period to compare against
function getTrendDetails(rate: MaybeNumber, previousRate: MaybeNumber) {
  const currentPct = toPct(rate);
  const prevPct = toPct(previousRate);
  if (currentPct === null || prevPct === null) return null;
  const diff = currentPct - prevPct;

  if (Math.abs(diff) < 0.05) {
    return {
      direction: 'flat' as const,
      diffText: '0.0%',
      icon: <Minus size={13} className="text-zinc-400" />,
      colorClass: 'text-zinc-500 dark:text-zinc-400',
    };
  }

  if (diff > 0) {
    return {
      direction: 'up' as const,
      diffText: `+${diff.toFixed(1)}%`,
      icon: <TrendingUp size={13} className="text-rose-500 dark:text-rose-400" />,
      colorClass: 'text-rose-600 dark:text-rose-400',
    };
  }

  return {
    direction: 'down' as const,
    diffText: `${diff.toFixed(1)}%`,
    icon: <TrendingDown size={13} className="text-emerald-500 dark:text-emerald-400" />,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
  };
}

function getStrengthBadge(strength: Strength) {
  switch (strength) {
    case 'strong':
      return {
        label: 'Strong signal',
        className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      };
    case 'moderate':
      return {
        label: 'Moderate signal',
        className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      };
    case 'weak':
    default:
      return {
        label: 'Weak signal',
        className: 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
      };
  }
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  isSelected = false,
  onClick,
}) => {
  const previousRate = insight.previous_rate as MaybeNumber;
  const trend = getTrendDetails(insight.rate as MaybeNumber, previousRate);
  const strengthInfo = getStrengthBadge(insight.strength);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative rounded-lg border text-left p-4 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 ${
        insight.low_data
          ? 'bg-zinc-100/70 dark:bg-zinc-900/40 border-zinc-300/80 dark:border-zinc-800/80 opacity-75 grayscale-[20%]'
          : isSelected
          ? 'bg-zinc-50 dark:bg-zinc-850 border-zinc-900 dark:border-zinc-300 shadow-xs ring-1 ring-zinc-900 dark:ring-zinc-300'
          : 'bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xs'
      }`}
    >
      {/* Top row: Aspect & Sentiment metadata + Low data tag + Strength badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">
            {insight.aspect}
          </span>
          <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">·</span>
          <span className={`capitalize ${
            insight.sentiment === 'positive' 
              ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
              : insight.sentiment === 'negative' 
              ? 'text-rose-600 dark:text-rose-400 font-medium' 
              : 'text-zinc-600 dark:text-zinc-400'
          }`}>
            {insight.sentiment}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {insight.low_data && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-200/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
              title="Low data: the sample size is small, so treat this with caution"
            >
              <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400" />
              Low data
            </span>
          )}

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${strengthInfo.className}`}
          >
            {strengthInfo.label}
          </span>
        </div>
      </div>

      {/* Claim Title */}
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-3">
        {insight.claim}
      </h3>

      {/* Metrics Row: Count line & Trend arrow */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="text-zinc-600 dark:text-zinc-300 font-mono">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {insight.count}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {insight.denominator}
          </span>{' '}
          reviews ({formatRate(insight.rate as MaybeNumber)})
        </div>

        {trend ? (
          <div
            className={`flex items-center gap-1 font-mono text-[11px] font-medium shrink-0 ${trend.colorClass}`}
            title={`Previous rate: ${formatRate(previousRate)}`}
          >
            {trend.icon}
            <span>{trend.diffText}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans">
              vs prev
            </span>
          </div>
        ) : (
          <div
            className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500 font-sans"
            title="There is no earlier period in this dataset to compare against"
          >
            No previous period
          </div>
        )}
      </div>

      {/* Subtle hover affordance */}
      <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
        <span className="flex items-center gap-1">
          <FileText size={11} />
          View supporting evidence
        </span>
        <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
};