import { formatRelativeTime } from "@/lib/format-time";
import type { RecentActivity } from "@/lib/rank-data";

export function RecentActivityList({ items }: { items: RecentActivity[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((activity) => (
        <div
          key={`${activity.winner}-${activity.loser}-${activity.time}`}
          className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-white px-5 py-3.5"
        >
          <span className="font-display text-sm font-extrabold">
            {activity.winner}
          </span>
          <span className="text-xs font-bold tracking-wide opacity-35">
            BEAT
          </span>
          <span className="text-sm opacity-45 line-through">
            {activity.loser}
          </span>
          <span className="ml-auto whitespace-nowrap text-xs font-medium opacity-40">
            {formatRelativeTime(activity.time)}
          </span>
        </div>
      ))}
    </div>
  );
}
