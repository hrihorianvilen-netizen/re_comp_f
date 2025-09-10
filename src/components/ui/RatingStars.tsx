'use client';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

export default function RatingStars({ rating, size = 36 }: RatingStarsProps) {
  const getBackgroundColor = (starIndex: number) => {
    if (starIndex <= Math.floor(rating)) {
      switch (Math.floor(rating)) {
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

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <div
          key={starIndex}
          className="flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: getBackgroundColor(starIndex),
          }}
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