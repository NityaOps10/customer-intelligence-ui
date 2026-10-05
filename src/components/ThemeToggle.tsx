import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        compact ? 'justify-center p-2' : 'w-full'
      }`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={14} className="text-zinc-500 dark:text-zinc-400" />
          {!compact && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={14} className="text-amber-400" />
          {!compact && <span>Light Mode</span>}
        </>
      )}
    </button>
  );
};
