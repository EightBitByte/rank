"use client";

import { useState } from "react";
import { createCategoryAction } from "@/app/admin/actions";
import type { AdminCategory } from "./admin-shell";

const NEW_CATEGORY_VALUE = "__new__";

export function CategorySelect({
  categories,
  value,
  onChange,
  onCategoryCreated,
}: {
  categories: AdminCategory[];
  value: number | null;
  onChange: (id: number) => void;
  onCategoryCreated: (category: AdminCategory) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveNewCategory() {
    const title = newTitle.trim();
    if (!title) return;
    setSaving(true);
    try {
      const category = await createCategoryAction(title);
      onCategoryCreated(category);
      onChange(category.id);
      setAdding(false);
      setNewTitle("");
    } finally {
      setSaving(false);
    }
  }

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveNewCategory()}
          placeholder="New category name"
          className="flex-1 rounded-[10px] border border-black/[0.12] px-4 py-3 font-sans text-[15px] outline-none"
        />
        <button
          type="button"
          disabled={saving || !newTitle.trim()}
          onClick={saveNewCategory}
          className="shrink-0 cursor-pointer rounded-[10px] bg-[#111] px-4 py-3 font-display text-[13px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="shrink-0 cursor-pointer rounded-[10px] bg-black/[0.06] px-4 py-3 font-display text-[13px] font-bold"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value === NEW_CATEGORY_VALUE) {
          setAdding(true);
          return;
        }
        onChange(Number(e.target.value));
      }}
      className="rounded-[10px] border border-black/[0.12] bg-white px-4 py-3 font-sans text-[15px] outline-none"
    >
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
      <option value={NEW_CATEGORY_VALUE}>+ New category…</option>
    </select>
  );
}
