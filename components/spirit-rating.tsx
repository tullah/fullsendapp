"use client";

import { getSpiritLabel } from "@/lib/utils";

interface SpiritRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function SpiritRating({ value, onChange }: SpiritRatingProps) {
  return (
    <div className="flex gap-3 items-center justify-center">
      {[0, 1, 2, 3, 4].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="relative group"
          aria-label={`Rate spirit as ${getSpiritLabel(rating)}`}
        >
          {/* Frisbee Icon - Filled */}
          <svg
            viewBox="0 0 24 24"
            fill={rating <= value ? "#1a73e8" : "none"}
            stroke={rating <= value ? "#1a73e8" : "#94a3b8"}
            className={`w-9 h-9 transition-all duration-150
                     ${rating <= value ? 'scale-105' : 'scale-95 hover:scale-100'}
                     hover:stroke-primary`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z"
            />
          </svg>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                        opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-gray-900/95 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
              {rating === 0 && "Contentious"}
              {rating === 1 && "Respectful"}
              {rating === 2 && "Honorable"}
              {rating === 3 && "Supportive"}
              {rating === 4 && "Inspiring"}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
} 