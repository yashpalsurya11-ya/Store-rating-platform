import React, { useState } from 'react';

const StarRating = ({ rating = 0, interactive = false, onRatingChange, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div 
      className={interactive ? "star-rating-interactive" : ""} 
      style={{ display: 'inline-flex', gap: '0.15rem', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        // Decide fill level
        const isFilled = starValue <= activeRating;
        const isHalf = !isFilled && (starValue - 0.5 <= activeRating);
        
        return (
          <svg
            key={starValue}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.15s ease',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFilled || isHalf ? "var(--color-warning)" : "var(--text-muted)"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isFilled ? (
              <polygon 
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill="var(--color-warning)"
              />
            ) : isHalf ? (
              // Half filled star logic with mask/gradient (simplified here: stroke with custom color or half polygon)
              <g>
                <polygon 
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill="none"
                />
                <path 
                  d="M12 2 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" 
                  fill="var(--color-warning)"
                />
              </g>
            ) : (
              <polygon 
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill="transparent"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
};

export default StarRating;
