import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(starValue);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentDisplay;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className="focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-0.5 transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600 fill-none'
                }`}
              />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={`${starSizes[size]} ${
              isFilled
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600 fill-none'
            }`}
          />
        );
      })}
    </div>
  );
};
