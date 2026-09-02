"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryTag } from "@/components/ui/category-tag";
import { PlaceholderThumbnail } from "@/components/ui/placeholder-thumbnail";
import type { LeaderboardItem } from "@/lib/rank-data";

const RANK_COLORS = ["#ff5a1f", "#c9c9c9", "#c98a4b"];

function rankColor(rank: number) {
  return RANK_COLORS[rank - 1] ?? "rgba(0,0,0,0.3)";
}

export function Leaderboard({ items }: { items: LeaderboardItem[] }) {
  const [previewItem, setPreviewItem] = useState<LeaderboardItem | null>(null);

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <LeaderboardRow
          key={item.title}
          item={item}
          onPreview={() => setPreviewItem(item)}
        />
      ))}

      {previewItem?.previewAssetHref && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewItem(null)}
            className="absolute inset-0 cursor-default bg-black/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${previewItem.title} poster`}
            className="relative w-full max-w-sm aspect-2/3"
          >
            <Image
              src={previewItem.previewAssetHref}
              alt={`poster for ${previewItem.title}`}
              fill
              className="rounded-2xl object-cover"
              sizes="384px"
            />
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white font-display text-sm font-bold shadow-md"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({
  item,
  onPreview,
}: {
  item: LeaderboardItem;
  onPreview: () => void;
}) {
  return (
    <div className="flex items-center gap-[18px] border-b border-black/[0.06] px-[22px] py-4 last:border-b-0">
      <div
        className="w-[30px] shrink-0 text-center font-display text-xl font-black"
        style={{ color: rankColor(item.rank) }}
      >
        {item.rank}
      </div>
      {item.previewAssetHref ? (
        <button
          type="button"
          onClick={onPreview}
          className="relative w-10 aspect-2/3 shrink-0 cursor-zoom-in overflow-hidden rounded-lg"
        >
          <Image
            src={item.previewAssetHref}
            alt={`poster for ${item.title}`}
            fill
            className="object-cover"
          />
        </button>
      ) : (
        <PlaceholderThumbnail className="h-10 w-10 shrink-0 rounded-lg" dense />
      )}
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
