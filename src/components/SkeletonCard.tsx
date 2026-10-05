import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-2" />
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-14" />
        </div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
      </div>

      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-36" />
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
      </div>
    </div>
  );
};
