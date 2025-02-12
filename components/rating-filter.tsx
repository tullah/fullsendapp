"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ratingRanges = [
  { label: "⭐ All Ratings", value: "" },
  { label: "🏆 Elite (81-99)", value: "81-99" },
  { label: "💫 Expert (61-80)", value: "61-80" },
  { label: "✨ Intermediate (41-60)", value: "41-60" },
  { label: "📈 Novice (21-40)", value: "21-40" },
  { label: "🌱 Beginner (1-20)", value: "1-20" },
];

export function RatingFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (range: string) => {
    const params = new URLSearchParams(searchParams);
    if (range) {
      params.set('rating', range);
    } else {
      params.delete('rating');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full sm:w-[200px]">
      <select
        defaultValue={searchParams.get('rating')?.toString()}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="select-base"
      >
        {ratingRanges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
} 