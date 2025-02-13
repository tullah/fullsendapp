import { ratingConfig } from '@/lib/ratings';

export function RatingScale() {
  return (
    <div className="mb-6 px-2 sm:px-4">
      {/* Numbers */}
      <div className="grid grid-cols-5 text-center gap-1 mb-2">
        <div className="text-[10px] sm:text-xs text-foreground/60">1-20</div>
        <div className="text-[10px] sm:text-xs text-foreground/60">21-40</div>
        <div className="text-[10px] sm:text-xs text-foreground/60">41-60</div>
        <div className="text-[10px] sm:text-xs text-foreground/60">61-80</div>
        <div className="text-[10px] sm:text-xs text-foreground/60">81-99</div>
      </div>
      {/* Scale Bar */}
      <div className="h-2 rounded-full bg-gray-100 flex">
        <div className="w-1/5 h-full rounded-l-full" style={{ backgroundColor: ratingConfig.beginner.color }}></div>
        <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.developing.color }}></div>
        <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.competitive.color }}></div>
        <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.expert.color }}></div>
        <div className="w-1/5 h-full rounded-r-full" style={{ backgroundColor: ratingConfig.worldClass.color }}></div>
      </div>
      {/* Labels */}
      <div className="grid grid-cols-5 text-center gap-1 mt-2">
        <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.beginner.color }}>Beginner</span>
        <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.developing.color }}>Developing</span>
        <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.competitive.color }}>Competitive</span>
        <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.expert.color }}>Expert</span>
        <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.worldClass.color }}>World Class</span>
      </div>
    </div>
  );
} 