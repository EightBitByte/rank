import { CategoryTag } from "@/components/ui/category-tag";
import type { LeaderboardItem } from "@/lib/rank-data";

const RANK_COLORS = ["#ff5a1f", "#c9c9c9", "#c98a4b"];

function rankColor(rank: number) {
  return RANK_COLORS[rank - 1] ?? "rgba(0,0,0,0.3)";
}

export function Leaderboard({ items }: { items: LeaderboardItem[] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <LeaderboardRow key={item.title} item={item} />
      ))}
    </div>
  );
}

function LeaderboardRow({ item }: { item: LeaderboardItem }) {
  return (
    <div className="flex items-center gap-[18px] border-b border-black/[0.06] px-[22px] py-4 last:border-b-0">
      <div
        className="w-[30px] shrink-0 text-center font-display text-xl font-black"
        style={{ color: rankColor(item.rank) }}
      >
        {item.rank}
      </div>
      <div
        className="h-[52px] w-[52px] shrink-0 rounded-xl bg-black/[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 6px, transparent 6px 12px)",
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-base font-bold">
          {item.title}
        </div>
        <div className="mt-1 inline-block">
          <CategoryTag category={item.category} />
        </div>
      </div>
      <div className="font-display text-lg font-extrabold">{item.elo}</div>
    </div>
  );
}
