import { PosterPreview } from "@/components/ui/poster-preview";
import type { TopItem } from "@/lib/rank-data";

export function SpotlightCard({ item }: { item: TopItem }) {
  return (
    <div className="flex flex-col gap-6 rounded-[24px] bg-[#111] p-8 text-white sm:flex-row sm:gap-8">
      <PosterPreview
        title={item.title}
        previewAssetHref={item.previewAssetHref}
        thumbnailClassName="w-full max-w-[200px] aspect-2/3 rounded-2xl"
        thumbnailSizes="200px"
      />
      <div className="flex flex-1 flex-col gap-[14px]">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[oklch(68%_0.19_150)] px-[10px] py-[3px] font-display text-[11px] font-bold text-[#06210f]">
            {item.category}
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <h3 className="font-display text-[30px] font-extrabold tracking-[-0.5px]">
            {item.title}
          </h3>
          <span className="font-display text-[26px] font-black text-rank-orange">
            {Math.round(item.elo)}
          </span>
        </div>
        <p className="max-w-[480px] text-[15px] leading-[1.6] opacity-75">
          {item.description}
        </p>
        <div className="mt-1.5 flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-[0.4px] opacity-50">
            Recent matches
          </div>
          <div className="flex flex-wrap gap-2">
            {item.matches.map((match) => (
              <span
                key={match.label}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                  match.result === "win"
                    ? "bg-[rgba(0,196,140,0.18)] text-[#5fe3b8]"
                    : "bg-[rgba(255,90,31,0.18)] text-[#ffab84]"
                }`}
              >
                {match.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
