"use client";

import Image from "next/image";
import { useState } from "react";
import { voteAction } from "@/app/admin/actions";
import { CategoryTag } from "@/components/ui/category-tag";
import { PlaceholderThumbnail } from "@/components/ui/placeholder-thumbnail";
import type { AdminCategory, AdminItem } from "./admin-shell";

function pickTwoRandomIds(items: AdminItem[]): [number, number] | null {
  if (items.length < 2) return null;
  const idx = new Set<number>();
  while (idx.size < 2) idx.add(Math.floor(Math.random() * items.length));
  const [a, b] = [...idx];
  return [items[a].id, items[b].id];
}

export function MatchupPanel({
  items,
  categories,
}: {
  items: AdminItem[];
  categories: AdminCategory[];
}) {
  const [matchIds, setMatchIds] = useState<[number, number] | null>(() =>
    pickTwoRandomIds(items),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  if (items.length < 2) {
    return (
      <p className="text-sm opacity-60">
        Add at least two items before you can run a matchup.
      </p>
    );
  }

  const itemA = matchIds && items.find((i) => i.id === matchIds[0]);
  const itemB = matchIds && items.find((i) => i.id === matchIds[1]);

  function reroll() {
    setMatchIds(pickTwoRandomIds(items));
    setPicked(null);
  }

  async function pickWinner(winnerId: number, loserId: number) {
    if (voting) return;
    setVoting(true);
    setPicked(winnerId);
    try {
      await voteAction(winnerId, loserId);
    } finally {
      setVoting(false);
    }
  }

  if (!itemA || !itemB) {
    return (
      <p className="text-sm opacity-60">
        Couldn't find a matchup — try rerolling.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-60">Pick a winner. Elo does the rest.</p>
        <button
          type="button"
          onClick={reroll}
          className="cursor-pointer rounded-full bg-black/[0.06] px-[18px] py-[9px] font-display text-[13px] font-bold"
        >
          🎲 New matchup
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5">
        <MatchCard
          item={itemA}
          categories={categories}
          picked={picked === itemA.id}
          disabled={voting}
          onPick={() => pickWinner(itemA.id, itemB.id)}
        />
        <div className="font-display text-xl font-black opacity-25">VS</div>
        <MatchCard
          item={itemB}
          categories={categories}
          picked={picked === itemB.id}
          disabled={voting}
          onPick={() => pickWinner(itemB.id, itemA.id)}
        />
      </div>

      {picked && (
        <div className="pt-1 text-center font-display text-sm font-bold text-rank-orange">
          {picked === itemA.id ? itemA.title : itemB.title} wins. Elo updated.
        </div>
      )}
    </section>
  );
}

function MatchCard({
  item,
  categories,
  picked,
  disabled,
  onPick,
}: {
  item: AdminItem;
  categories: AdminCategory[];
  picked: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const category = categories.find((c) => c.id === item.categoryId);

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={`flex cursor-pointer flex-col items-center gap-3.5 rounded-[20px] border-[3px] bg-white p-7 text-center disabled:cursor-default ${
        picked ? "border-rank-orange" : "border-transparent"
      }`}
    >
      {item.previewAssetHref ? (
        <div className="relative w-32 aspect-2/3 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={item.previewAssetHref}
            alt={`poster for ${item.title}`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <PlaceholderThumbnail className="h-10 w-10 shrink-0 rounded-lg" dense />
      )}
      <CategoryTag
        category={category?.title ?? item.category}
        color={category?.color}
      />
      <div className="font-display text-xl font-extrabold">{item.title}</div>
      <div className="font-display text-[15px] font-extrabold opacity-50">
        {item.elo} elo
      </div>
    </button>
  );
}
