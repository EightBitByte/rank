"use client";

import { useState } from "react";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import type { AdminCategory, AdminItem } from "./admin-shell";
import { CATEGORY_COLOR_SWATCHES } from "./category-colors";

type EditDraft = { title: string; color: string };

export function ManageCategoriesPanel({
  items,
  categories,
  onCategoriesChange,
}: {
  items: AdminItem[];
  categories: AdminCategory[];
  onCategoriesChange: (categories: AdminCategory[]) => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  function itemCountFor(categoryId: number) {
    return items.filter((item) => item.categoryId === categoryId).length;
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditDraft({
      title: category.title,
      color: category.color ?? CATEGORY_COLOR_SWATCHES[0],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function saveEdit() {
    if (editingId === null || !editDraft || !editDraft.title.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateCategoryAction({
        categoryId: editingId,
        title: editDraft.title,
        color: editDraft.color,
      });
      if (updated) {
        onCategoriesChange(
          categories.map((c) => (c.id === editingId ? updated : c)),
        );
      }
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const count = itemCountFor(category.id);
    const warning =
      count > 0
        ? `Delete "${category.title}"? ${count} item${count === 1 ? "" : "s"} will become uncategorized.`
        : `Delete "${category.title}"? This can't be undone.`;
    if (!confirm(warning)) return;

    setDeletingId(category.id);
    try {
      await deleteCategoryAction(category.id);
      onCategoriesChange(categories.filter((c) => c.id !== category.id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-4 border-b border-black/[0.06] px-[22px] py-3.5 last:border-b-0">
              <span
                className="h-[18px] w-[18px] shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: category.color ?? "#ccc" }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[15px] font-bold">
                  {category.title}
                </div>
              </div>
              <div className="font-display text-[15px] font-extrabold opacity-60">
                {itemCountFor(category.id)}
              </div>
              <button
                type="button"
                onClick={() => startEdit(category)}
                aria-label={`Edit ${category.title}`}
                className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center text-rank-fg/55"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
              <button
                type="button"
                disabled={deletingId === category.id}
                onClick={() => handleDelete(category)}
                className="cursor-pointer rounded-full bg-red-600/10 px-4 py-2 font-display text-[13px] font-bold text-red-600 disabled:opacity-50"
              >
                {deletingId === category.id ? "Deleting…" : "Delete"}
              </button>
            </div>

            {editingId === category.id && editDraft && (
              <div className="flex flex-col gap-3 border-b border-black/[0.06] bg-black/[0.02] px-[22px] pt-3.5 pb-5 last:border-b-0">
                <input
                  value={editDraft.title}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, title: e.target.value })
                  }
                  className="rounded-[10px] border border-black/[0.12] px-3.5 py-2.5 font-sans text-sm outline-none"
                />
                <div className="flex items-center gap-2.5">
                  {CATEGORY_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() =>
                        setEditDraft({ ...editDraft, color: swatch })
                      }
                      style={{ backgroundColor: swatch }}
                      className={`h-7 w-7 cursor-pointer rounded-full border-[3px] ${
                        editDraft.color === swatch
                          ? "border-[#111]"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={editDraft.color}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, color: e.target.value })
                    }
                    className="h-7 w-9 cursor-pointer rounded-lg border border-black/[0.12] p-0"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={saveEdit}
                    className="cursor-pointer rounded-full bg-[#111] px-[18px] py-2 font-display text-[13px] font-bold text-white disabled:opacity-50"
                  >
                    {savingEdit ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="cursor-pointer rounded-full bg-black/[0.06] px-[18px] py-2 font-display text-[13px] font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="px-8 py-8 text-center text-sm opacity-50">
            No categories yet.
          </div>
        )}
      </div>
    </section>
  );
}
