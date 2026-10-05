import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Truck, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Headphones, 
  Database,
  RefreshCw,
  X,
  Download
} from 'lucide-react';
import { Aspect, Sentiment } from '../types.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

interface SidebarProps {
  selectedAspect: string;
  onSelectAspect: (aspect: string) => void;
  selectedSentiment: string;
  onSelectSentiment: (sentiment: string) => void;
  aspectCounts: Record<string, number>;
  sentimentCounts: Record<string, number>;
  totalCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedAspect,
  onSelectAspect,
  selectedSentiment,
  onSelectSentiment,
  aspectCounts,
  sentimentCounts,
  totalCount,
  isOpenMobile,
  onCloseMobile,
  onRefresh,
  isRefreshing,
}) => {
  const isMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === undefined;

  const aspectItems: { id: Aspect | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Aspects', icon: <Layers size={14} /> },
    { id: 'delivery', label: 'Delivery', icon: <Truck size={14} /> },
    { id: 'price', label: 'Price', icon: <DollarSign size={14} /> },
    { id: 'onboarding', label: 'Onboarding', icon: <Sparkles size={14} /> },
    { id: 'quality', label: 'Quality', icon: <ShieldCheck size={14} /> },
    { id: 'support', label: 'Support', icon: <Headphones size={14} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 flex flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              <BarChart3 size={17} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                Customer Intelligence
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Product & Marketing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation & Filters */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Workspace
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectAspect('all');
                onSelectSentiment('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedAspect === 'all' && selectedSentiment === 'all'
                  ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-zinc-500 dark:text-zinc-400" />
                <span>All Insights</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {totalCount}
              </span>
            </button>
          </div>

          {/* Aspect Breakdown Navigation */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Aspects
            </div>
            <div className="space-y-0.5">
              {aspectItems.map((item) => {
                const count = item.id === 'all' ? totalCount : aspectCounts[item.id] || 0;
                const isSelected = selectedAspect === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAspect(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 dark:text-zinc-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sentiment Filter Navigation */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Sentiment
            </div>
            <div className="space-y-0.5">
              {[
                { id: 'all', label: 'All Sentiments' },
                { id: 'negative', label: 'Negative Feedback' },
                { id: 'positive', label: 'Positive Feedback' },
              ].map((sent) => {
                const count =
                  sent.id === 'all'
                    ? totalCount
                    : sentimentCounts[sent.id] || 0;
                const isSelected = selectedSentiment === sent.id;
                return (
                  <button
                    key={sent.id}
                    type="button"
                    onClick={() => onSelectSentiment(sent.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sent.id === 'positive'
                            ? 'bg-emerald-500'
                            : sent.id === 'negative'
                            ? 'bg-rose-500'
                            : 'bg-zinc-400'
                        }`}
                      />
                      <span>{sent.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Area: Data source status & theme */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-100/50 dark:bg-zinc-900/60">
          {/* Data engine badge */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
            <div className="flex items-center gap-1.5">
              <Database size={12} className="text-zinc-400" />
              <span>{isMock ? 'Mock Dataset' : 'API Connection'}</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Reload insights"
              className="p-1 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Download Project ZIP */}
          <a
            href="/api/download-zip"
            download="customer-intelligence-project.zip"
            className="flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-300/70 dark:border-zinc-700 transition-colors shadow-xs"
          >
            <Download size={13} />
            <span>Download Project (.zip)</span>
          </a>

          <ThemeToggle />
        </div>
      </aside>
    </>
  );
};
