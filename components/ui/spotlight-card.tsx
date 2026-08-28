import type { Spotlight } from "@/lib/rank-data";

export function SpotlightCard({ item }: { item: Spotlight }) {
  return (
    <div className="flex flex-col gap-6 rounded-[24px] bg-[#111] p-8 text-white sm:flex-row sm:gap-8">
      <div
        className="flex h-[220px] w-full shrink-0 items-center justify-center rounded-2xl bg-white/5 p-3 text-center font-mono text-[11px] text-white/40 sm:w-[220px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 8px, transparent 8px 16px)",
        }}
      >
        {item.category === "GAMES"
          ? "game cover art"
          : item.category === "MOVIES"
            ? "poster art"
            : "photo"}
      </div>
      <div className="flex flex-1 flex-col gap-[14px]">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[oklch(68%_0.19_150)] px-[10px] py-[3px] font-display text-[11px] font-bold text-[#06210f]">
            {item.category}
          </span>
          <span className="text-[13px] font-medium opacity-50">
            added {item.addedDaysAgo} days ago
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <h3 className="font-display text-[30px] font-extrabold tracking-[-0.5px]">
            {item.title}
          </h3>
          <span className="font-display text-[26px] font-black text-rank-orange">
            {item.elo}
          </span>
        </div>
        <p className="max-w-[480px] text-[15px] leading-[1.6] opacity-75">
          {item.description}
        </p>
        <div className="mt-1.5 flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-[0.4px] opacity-50">
            Recent head-to-heads
          </div>
          <div className="flex flex-wrap gap-2">
            {item.headToHeads.map((h2h) => (
              <span
                key={h2h.label}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                  h2h.result === "win"
                    ? "bg-[rgba(0,196,140,0.18)] text-[#5fe3b8]"
                    : "bg-[rgba(255,90,31,0.18)] text-[#ffab84]"
                }`}
              >
                {h2h.label}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-1.5 text-xs opacity-40">
          {item.metadataSource}
        </div>
      </div>
    </div>
  );
}
