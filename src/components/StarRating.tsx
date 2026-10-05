import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | string | null | undefined;
  maxStars?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  className = '',
}) => {
  const value =
    rating === null || rating === undefined || rating === '' ? NaN : Number(rating);

  // No usable rating: show a plain label instead of empty stars
  if (Number.isNaN(value)) {
    return (
      <span className={`text-[11px] text-zinc-400 dark:text-zinc-500 ${className}`}>
        No rating
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${value} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        const isFilled = index < Math.round(value);
        return (
          <Star
            key={index}
            size={13}
            className={
              isFilled
                ? 'fill-amber-400 text-amber-400 dark:fill-amber-400 dark:text-amber-400'
                : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
            }
          />
        );
      })}
      <span className="ml-1.5 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
        {value.toFixed(1)}
      </span>
    </div>
  );
};