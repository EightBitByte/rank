"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createCategory } from "@/server/db/categories";
import { getDb } from "@/server/db/crud";
import { createEloRecord, logMatch } from "@/server/db/elo";
import { createItem, deleteItemCascade } from "@/server/db/items";
import { eloRecords, items } from "@/server/db/schema";
import {
  searchMoviesByTitle,
  searchTVShowsByTitle,
} from "@/server/external/tmdb";

export type TmdbSearchResult = {
  id: number;
  mediaType: "movie" | "tv";
  poster?: string;
  title: string;
  meta: string;
};

export async function searchTmdbAction(
  query: string,
  mediaType: "movie" | "tv",
): Promise<TmdbSearchResult[]> {
  const { env } = getDb();
  if (!query.trim()) return [];

  if (mediaType === "movie") {
    const movies = await searchMoviesByTitle({
      apiKey: env.TMDB_KEY,
      title: query,
    });
    return movies.results.slice(0, 6).map((r) => ({
      id: r.id,
      mediaType: "movie",
      poster: r.poster_path
        ? `https://image.tmdb.org/t/p/w500/${r.poster_path}`
        : undefined,
      title: r.title,
      meta: r.release_date ? r.release_date.slice(0, 4) : "Unknown year",
    }));
  }

  const tv = await searchTVShowsByTitle({ apiKey: env.TMDB_KEY, title: query });
  return tv.results.slice(0, 6).map((r) => ({
    id: r.id,
    mediaType: "tv",
    poster: r.poster_path
      ? `https://image.tmdb.org/t/p/w500/${r.poster_path}`
      : undefined,
    title: r.name,
    meta: r.first_air_date
      ? `${r.first_air_date.slice(0, 4)} · TV`
      : "TV series",
  }));
}

export async function createCategoryAction(title: string, color?: string) {
  const { db: database } = getDb();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const category = await createCategory(database, {
    title: trimmed,
    color: color ?? null,
  });
  revalidatePath("/admin");
  return category;
}

/** Shared by addManualItemAction and confirmDraftItemAction below. */
async function createRosterItem(input: {
  title: string;
  categoryId: number | null;
  description?: string;
  elo?: number;
}) {
  const { db: database } = getDb();
  const title = input.title.trim();
  if (!title) throw new Error("Title can't be empty.");

  const item = await createItem(database, {
    title,
    category_id: input.categoryId ?? undefined,
    description: input.description?.trim() || undefined,
  });
  await createEloRecord(database, item.id, input.elo ?? 1200);
  revalidatePath("/admin");
  return item;
}

export async function addManualItemAction(input: {
  title: string;
  categoryId: number | null;
  description?: string;
}) {
  return createRosterItem(input);
}

export async function confirmDraftItemAction(input: {
  title: string;
  categoryId: number | null;
  elo: number;
  description?: string;
}) {
  return createRosterItem(input);
}

export async function deleteItemAction(itemId: number) {
  const { db: database } = getDb();
  await deleteItemCascade(database, itemId);
  revalidatePath("/admin");
}

export async function updateItemAction(input: {
  itemId: number;
  title: string;
  categoryId: number | null;
  elo: number;
}) {
  const { db: database } = getDb();
  const title = input.title.trim();
  if (!title) throw new Error("Title can't be empty.");

  await database.batch([
    database
      .update(items)
      .set({ title, category_id: input.categoryId })
      .where(eq(items.id, input.itemId)),
    database
      .update(eloRecords)
      .set({ elo: input.elo })
      .where(eq(eloRecords.item_id, input.itemId)),
  ]);
  revalidatePath("/admin");
}

export async function voteAction(winnerId: number, loserId: number) {
  const { db: database } = getDb();
  await logMatch(database, winnerId, loserId);
  revalidatePath("/admin");
}
