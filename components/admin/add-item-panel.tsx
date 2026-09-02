"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  addManualItemAction,
  confirmDraftItemAction,
  createCategoryAction,
  searchTmdbAction,
  type TmdbSearchResult,
} from "@/app/admin/actions";
import { PlaceholderThumbnail } from "@/components/ui/placeholder-thumbnail";
import type { AdminCategory } from "./admin-shell";
import { CATEGORY_COLOR_SWATCHES } from "./category-colors";
import { CategorySelect } from "./category-select";

const SOURCE_TYPES = [
  { key: "movies", label: "Movies", available: true, mediaType: "movie" },
  { key: "tv", label: "TV", available: true, mediaType: "tv" },
  { key: "music", label: "Music", available: false, mediaType: "music" },
  { key: "games", label: "Games", available: false, mediaType: undefined },
  {
    key: "restaurants",
    label: "Restaurants",
    available: false,
    mediaType: undefined,
  },
] as const;

type SourceKey = (typeof SOURCE_TYPES)[number]["key"];

const MANUAL_TABS = [
  { key: "item", label: "Item" },
  { key: "category", label: "Category" },
] as const;

type ManualTabKey = (typeof MANUAL_TABS)[number]["key"];

type Draft = {
  title: string;
  categoryId: number | null;
  elo: string;
  meta: string;
  notes: string;
  sourceLabel: string;
  previewAssetHref?: string;
};

const inputClass =
  "rounded-[10px] border border-black/[0.12] px-4 py-3 font-sans text-[15px] outline-none";

export function AddItemPanel({
  categories: initialCategories,
}: {
  categories: AdminCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);

  const [source, setSource] = useState<SourceKey>("movies");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);

  const [manualTab, setManualTab] = useState<ManualTabKey>("item");

  const [manual, setManual] = useState({
    title: "",
    categoryId: initialCategories[0]?.id ?? null,
    notes: "",
  });
  const [manualSaving, setManualSaving] = useState(false);

  const [newCategory, setNewCategory] = useState({
    title: "",
    color: CATEGORY_COLOR_SWATCHES[0],
  });
  const [categorySaving, setCategorySaving] = useState(false);

  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const [previewResult, setPreviewResult] = useState<TmdbSearchResult | null>(
    null,
  );

  const activeSource = SOURCE_TYPES.find((s) => s.key === source) as
    | (typeof SOURCE_TYPES)[number]
    | undefined;

  function addCategory(category: AdminCategory) {
    setCategories((prev) => [...prev, category]);
  }

  async function runSearch() {
    if (!query.trim() || !activeSource?.available || !activeSource.mediaType)
      return;
    setSearching(true);
    setSearchError(null);
    try {
      setResults(await searchTmdbAction(query, activeSource.mediaType));
    } catch {
      setSearchError("Search failed. Try again in a moment.");
    } finally {
      setSearching(false);
    }
  }

  function addFromResult(result: TmdbSearchResult) {
    const movieCategoryId =
      categories.find((c) => c.title === "Movies & TV")?.id ??
      categories[0]?.id ??
      null;

    setDraft({
      title: result.title,
      categoryId: movieCategoryId,
      elo: "1200",
      meta: result.meta,
      notes: "",
      sourceLabel: "TMDb",
      previewAssetHref: result.poster,
    });
    setResults([]);
    setQuery("");
  }

  async function confirmDraft() {
    if (!draft || !draft.title.trim()) return;
    setDraftSaving(true);
    try {
      await confirmDraftItemAction({
        title: draft.title,
        categoryId: draft.categoryId,
        elo: Number(draft.elo) || 1200,
        description: draft.notes,
        previewAssetHref: draft.previewAssetHref,
      });
      setAddedMessage(`${draft.title} added to the roster.`);
      setDraft(null);
    } finally {
      setDraftSaving(false);
    }
  }

  async function submitManual() {
    if (!manual.title.trim()) return;
    setManualSaving(true);
    try {
      await addManualItemAction({
        title: manual.title,
        categoryId: manual.categoryId,
        description: manual.notes,
      });
      setAddedMessage(`${manual.title} added to the roster.`);
      setManual((m) => ({ title: "", categoryId: m.categoryId, notes: "" }));
    } finally {
      setManualSaving(false);
    }
  }

  async function submitNewCategory() {
    if (!newCategory.title.trim()) return;
    setCategorySaving(true);
    try {
      const category = await createCategoryAction(
        newCategory.title,
        newCategory.color,
      );
      addCategory(category);
      setAddedMessage(`${category.title} category added.`);
      setNewCategory({ title: "", color: CATEGORY_COLOR_SWATCHES[0] });
    } finally {
      setCategorySaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-7">
      {addedMessage && (
        <div className="rounded-2xl border border-rank-orange/30 bg-rank-orange/10 px-5 py-3 font-display text-sm font-bold text-rank-orange">
          {addedMessage}
        </div>
      )}

      <div className="rounded-[20px] border border-black/[0.06] bg-white p-7">
        <h2 className="font-display text-[22px] font-extrabold">
          Pull from an API
        </h2>
        <p className="mt-1 mb-5 text-sm opacity-60">
          Search a source, pick the match, done.
        </p>

        <div className="mb-4 flex gap-2.5">
          {SOURCE_TYPES.map((s) => (
            <button
              key={s.key}
              type="button"
              disabled={!s.available}
              onClick={() => {
                setSource(s.key);
                setResults([]);
              }}
              className={`rounded-full border-2 px-[18px] py-[9px] font-display text-[13px] font-bold ${
                source === s.key
                  ? "border-rank-orange bg-rank-orange text-white"
                  : "border-black/15 bg-transparent text-rank-fg"
              } ${s.available ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
            >
              {s.label}
              {!s.available && " (soon)"}
            </button>
          ))}
        </div>

        {activeSource?.available ? (
          <div className="flex gap-2.5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder={`Search ${activeSource.label.toLowerCase()}...`}
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={runSearch}
              disabled={searching || !query.trim()}
              className="cursor-pointer whitespace-nowrap rounded-xl bg-rank-orange px-[26px] py-3.5 font-display text-sm font-bold text-white disabled:cursor-default disabled:opacity-50"
            >
              {searching ? "Searching…" : "Search TMDb"}
            </button>
          </div>
        ) : (
          <p className="text-sm opacity-50">
            {activeSource?.label} isn't wired up to a source yet — add it by
            hand below.
          </p>
        )}

        {searchError && (
          <p className="mt-3 text-sm text-red-600">{searchError}</p>
        )}

        {results.length > 0 && (
          <div className="mt-[18px] flex flex-col gap-2">
            {results.map((r) => (
              <div
                key={`${r.mediaType}-${r.id}`}
                className="flex items-center gap-3.5 rounded-xl border border-black/[0.08] px-4 py-3"
              >
                {r.poster ? (
                  <button
                    type="button"
                    onClick={() => setPreviewResult(r)}
                    className="relative w-10 aspect-2/3 shrink-0 cursor-zoom-in overflow-hidden rounded-lg"
                  >
                    <Image
                      src={r.poster}
                      alt={`poster for ${r.title}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ) : (
                  <PlaceholderThumbnail
                    className="h-10 w-10 shrink-0 rounded-lg"
                    dense
                  />
                )}
                <div className="flex-1">
                  <div className="font-display text-sm font-bold">
                    {r.title}
                  </div>
                  <div className="text-xs opacity-50">{r.meta}</div>
                </div>
                <button
                  type="button"
                  onClick={() => addFromResult(r)}
                  className="cursor-pointer rounded-full bg-[#111] px-4 py-2 font-display text-[13px] font-bold text-white"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {draft && (
        <div className="rounded-[20px] border-2 border-rank-orange bg-white p-7">
          <h2 className="font-display text-[22px] font-extrabold">
            Fill in the details
          </h2>
          <p className="mt-1 mb-5 text-sm opacity-60">
            Pulled from {draft.sourceLabel} — tweak anything before it joins the
            roster.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <CategorySelect
                categories={categories}
                value={draft.categoryId}
                onChange={(id) => setDraft({ ...draft, categoryId: id })}
                onCategoryCreated={addCategory}
              />
            </Field>
            <Field label="Starting Elo">
              <input
                value={draft.elo}
                onChange={(e) => setDraft({ ...draft, elo: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Source meta">
              <input
                value={draft.meta}
                onChange={(e) => setDraft({ ...draft, meta: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Notes</Label>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Anything worth remembering about this one."
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          <div className="mt-[18px] flex gap-2.5">
            <button
              type="button"
              disabled={draftSaving}
              onClick={confirmDraft}
              className="cursor-pointer rounded-xl bg-rank-orange px-[26px] py-[13px] font-display text-sm font-bold text-white disabled:cursor-default disabled:opacity-50"
            >
              {draftSaving ? "Adding…" : "Confirm & add to roster"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="cursor-pointer rounded-xl bg-black/[0.06] px-[26px] py-[13px] font-display text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[20px] border border-black/[0.06] bg-white p-7">
        <h2 className="font-display text-[22px] font-extrabold">
          ...or add it by hand
        </h2>
        <p className="mt-1 mb-5 text-sm opacity-60">
          For the stuff no API has ever heard of.
        </p>

        <div className="mb-5 flex gap-2.5">
          {MANUAL_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setManualTab(t.key)}
              className={`cursor-pointer rounded-full px-[18px] py-[9px] font-display text-[13px] font-bold ${
                manualTab === t.key
                  ? "bg-rank-orange text-white"
                  : "bg-black/[0.06] text-rank-fg"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {manualTab === "item" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={manual.title}
                  onChange={(e) =>
                    setManual({ ...manual, title: e.target.value })
                  }
                  placeholder="e.g. My neighbor's chili"
                  className={inputClass}
                />
              </Field>
              <Field label="Category">
                <CategorySelect
                  categories={categories}
                  value={manual.categoryId}
                  onChange={(id) => setManual({ ...manual, categoryId: id })}
                  onCategoryCreated={addCategory}
                />
              </Field>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Notes</Label>
                <textarea
                  value={manual.notes}
                  onChange={(e) =>
                    setManual({ ...manual, notes: e.target.value })
                  }
                  placeholder="Why does this deserve a ranking? Be honest."
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={manualSaving || !manual.title.trim()}
              onClick={submitManual}
              className="mt-[18px] inline-block cursor-pointer rounded-xl bg-[#111] px-[26px] py-[13px] font-display text-sm font-bold text-white disabled:cursor-default disabled:opacity-50"
            >
              {manualSaving ? "Adding…" : "Add to roster"}
            </button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={newCategory.title}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, title: e.target.value })
                  }
                  placeholder="e.g. Board games"
                  className={inputClass}
                />
              </Field>
              <Field label="Color">
                <div className="flex items-center gap-2.5">
                  {CATEGORY_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() =>
                        setNewCategory({ ...newCategory, color: swatch })
                      }
                      style={{ backgroundColor: swatch }}
                      className={`h-8 w-8 cursor-pointer rounded-full border-[3px] ${
                        newCategory.color === swatch
                          ? "border-[#111]"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="h-8 w-10 cursor-pointer rounded-lg border border-black/[0.12] p-0"
                  />
                </div>
              </Field>
            </div>

            <button
              type="button"
              disabled={categorySaving || !newCategory.title.trim()}
              onClick={submitNewCategory}
              className="mt-[18px] inline-block cursor-pointer rounded-xl bg-[#111] px-[26px] py-[13px] font-display text-sm font-bold text-white disabled:cursor-default disabled:opacity-50"
            >
              {categorySaving ? "Adding…" : "Add category"}
            </button>
          </>
        )}
      </div>

      {previewResult?.poster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewResult(null)}
            className="absolute inset-0 cursor-default bg-black/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${previewResult.title} poster`}
            className="relative w-full max-w-sm aspect-2/3"
          >
            <Image
              src={previewResult.poster.replace("/t/p/w500/", "/t/p/w780/")}
              alt={`poster for ${previewResult.title}`}
              fill
              className="rounded-2xl object-cover"
              sizes="384px"
            />
            <button
              type="button"
              onClick={() => setPreviewResult(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white font-display text-sm font-bold shadow-md"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.4px] opacity-50">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
