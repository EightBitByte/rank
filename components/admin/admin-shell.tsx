"use client";

import { useState } from "react";
import { AddItemPanel } from "./add-item-panel";
import { ManagePanel } from "./manage-panel";
import { MatchupPanel } from "./matchup-panel";

export type AdminItem = {
  id: number;
  title: string;
  category: string;
  categoryId: number | null;
  elo: number;
};

export type AdminCategory = { id: number; title: string; color: string | null };

type Tab = "add" | "match" | "manage";

const TABS: { key: Tab; label: string }[] = [
  { key: "add", label: "Add item" },
  { key: "match", label: "Run matchup" },
  { key: "manage", label: "Manage / delete" },
];

export function AdminShell({
  items,
  categories,
}: {
  items: AdminItem[];
  categories: AdminCategory[];
}) {
  const [tab, setTab] = useState<Tab>("add");

  return (
    <>
      <section className="pt-1 pb-10">
        <h1 className="text-balance font-display text-[40px] font-black leading-[1.05] tracking-[-1px]">
          Run the whole show.
        </h1>
        <p className="mt-2.5 max-w-[560px] text-base opacity-70">
          Add new contenders, settle head-to-heads, and clean out the roster.
        </p>
      </section>

      <nav className="flex gap-2.5 pb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`cursor-pointer rounded-full px-[22px] py-3 font-display text-[15px] font-bold ${
              tab === t.key
                ? "bg-rank-orange text-white"
                : "bg-black/[0.06] text-rank-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "add" && <AddItemPanel categories={categories} />}
      {tab === "match" && <MatchupPanel items={items} />}
      {tab === "manage" && (
        <ManagePanel items={items} categories={categories} />
      )}
    </>
  );
}
