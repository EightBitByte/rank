"use client";

import { useMemo, useState } from "react";
import { deleteItemAction, updateItemAction } from "@/app/admin/actions";
import { CategoryTag } from "@/components/ui/category-tag";
import { PlaceholderThumbnail } from "@/components/ui/placeholder-thumbnail";
import type { AdminCategory, AdminItem } from "./admin-shell";
import { CategorySelect } from "./category-select";
import { ManageCategoriesPanel } from "./manage-categories-panel";

type EditDraft = { title: string; categoryId: number | null; elo: string };

type ManageTab = "items" | "categories";

const MANAGE_TABS: { key: ManageTab; label: string }[] = [
  { key: "items", label: "Items" },
  { key: "categories", label: "Categories" },
];

export function ManagePanel({
  items,
  categories: initialCategories,
}: {
  items: AdminItem[];
  categories: AdminCategory[];
}) {
  const [manageTab, setManageTab] = useState<ManageTab>("items");
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  async function handleDelete(item: AdminItem) {
    if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setDeletingId(item.id);
    try {
      await deleteItemAction(item.id);
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(item: AdminItem) {
    setEditingId(item.id);
    setEditDraft({
      title: item.title,
      categoryId: item.categoryId,
      elo: String(item.elo),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function saveEdit() {
    if (editingId === null || !editDraft) return;
    setSavingEdit(true);
    try {
      await updateItemAction({
        itemId: editingId,
        title: editDraft.title,
        categoryId: editDraft.categoryId,
        elo: Number(editDraft.elo) || 0,
      });
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex gap-2.5">
        {MANAGE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setManageTab(t.key)}
            className={`cursor-pointer rounded-full px-[18px] py-[9px] font-display text-[13px] font-bold ${
              manageTab === t.key
                ? "bg-rank-orange text-white"
                : "bg-black/[0.06] text-rank-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {manageTab === "categories" ? (
        <ManageCategoriesPanel
          items={items}
          categories={categories}
          onCategoriesChange={setCategories}
        />
      ) : (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the roster by name..."
            className="max-w-[420px] rounded-xl border border-black/[0.12] bg-white px-[18px] py-3.5 text-[15px] outline-none"
          />

          <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]">
            {filtered.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-4 border-b border-black/[0.06] px-[22px] py-3.5 last:border-b-0">
                  <PlaceholderThumbnail
                    className="h-[42px] w-[42px] shrink-0 rounded-[10px]"
                    dense
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[15px] font-bold">
                      {item.title}
                    </div>
                    <div className="mt-1 inline-block">
                      <CategoryTag category={item.category} />
                    </div>
                  </div>
                  <div className="font-display text-[15px] font-extrabold opacity-60">
                    {item.elo}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.title}`}
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
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item)}
                    className="cursor-pointer rounded-full bg-red-600/10 px-4 py-2 font-display text-[13px] font-bold text-red-600 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete"}
                  </button>
                </div>

                {editingId === item.id && editDraft && (
                  <div className="grid grid-cols-[1fr_1fr_120px] gap-3 border-b border-black/[0.06] bg-black/[0.02] px-[22px] pt-3.5 pb-5 last:border-b-0">
                    <input
                      value={editDraft.title}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, title: e.target.value })
                      }
                      className="rounded-[10px] border border-black/[0.12] px-3.5 py-2.5 font-sans text-sm outline-none"
                    />
                    <CategorySelect
                      categories={categories}
                      value={editDraft.categoryId}
                      onChange={(id) =>
                        setEditDraft({ ...editDraft, categoryId: id })
                      }
                      onCategoryCreated={(category) =>
                        setCategories((prev) => [...prev, category])
                      }
                    />
                    <input
                      value={editDraft.elo}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, elo: e.target.value })
                      }
                      className="rounded-[10px] border border-black/[0.12] px-3.5 py-2.5 font-sans text-sm outline-none"
                    />
                    <div className="col-span-3 flex gap-2">
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
            {filtered.length === 0 && (
              <div className="px-8 py-8 text-center text-sm opacity-50">
                {items.length === 0
                  ? "No items yet."
                  : `Nothing matches "${query}".`}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
