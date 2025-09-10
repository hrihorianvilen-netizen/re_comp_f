'use client';

import { useState } from 'react';

interface InteractiveRatingStarsProps {
  initialRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
}

export default function InteractiveRatingStars({ 
  initialRating = 0, 
  size = 36,
  onRatingChange 
}: InteractiveRatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const getBackgroundColor = (starIndex: number) => {
    const activeRating = hoverRating || rating;
    if (starIndex <= activeRating) {
      switch (activeRating) {
        case 1:
          return '#ff0000'; // red
        case 2:
          return '#ff8622'; // orange
        case 3:
          return '#ffce00'; // yellow
        case 4:
          return '#73cf11'; // light green
        case 5:
          return '#00b67a'; // green
        default:
          return '#e5e7eb'; // gray
      }
    }
    return '#e5e7eb'; // gray for unfilled stars
  };

  const handleClick = (starIndex: number) => {
    setRating(starIndex);
    if (onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <div
          key={starIndex}
          className="flex items-center justify-center cursor-pointer transition-all hover:scale-110"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: getBackgroundColor(starIndex),
          }}
          onClick={() => handleClick(starIndex)}
          onMouseEnter={() => setHoverRating(starIndex)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <span 
            className="text-white font-bold"
            style={{ fontSize: `${size * 0.6}px` }}
          >
            ★
          </span>
        </div>
      ))}
    </div>
  );
}