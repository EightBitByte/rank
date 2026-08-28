import type { LeaderboardCategory } from "@/lib/rank-data";

const CATEGORY_STYLES: Record<LeaderboardCategory, string> = {
  MOVIES: "bg-[oklch(90%_0.05_250)] text-[oklch(35%_0.14_250)]",
  GAMES: "bg-[oklch(90%_0.05_150)] text-[oklch(32%_0.13_150)]",
  RESTAURANTS: "bg-[oklch(90%_0.05_39)] text-[oklch(38%_0.16_39)]",
};

export function CategoryTag({ category }: { category: LeaderboardCategory }) {
  return (
    <span
      className={`inline-block rounded-full px-[9px] py-[2px] font-display text-[11px] font-bold ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}
