"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { revalidatePath } from "next/cache";
import { createCategory } from "@/server/db/categories";
import { createEloRecord, logMatch } from "@/server/db/elo";
import { createItem, deleteItemCascade } from "@/server/db/items";
import { eloRecords, items } from "@/server/db/schema";
import {
  searchMoviesByTitle,
  searchTVShowsByTitle,
} from "@/server/external/tmdb";

function db() {
  const { env } = getCloudflareContext();
  return { db: drizzle(env.DB), env };
}

export type TmdbSearchResult = {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  meta: string;
};

export async function searchTmdbAction(
  query: string,
): Promise<TmdbSearchResult[]> {
  const { env } = db();
  if (!query.trim()) return [];

  const [movies, tv] = await Promise.all([
    searchMoviesByTitle({ apiKey: env.TMDB_KEY, title: query }),
    searchTVShowsByTitle({ apiKey: env.TMDB_KEY, title: query }),
  ]);

  const movieResults: TmdbSearchResult[] = movies.results
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      mediaType: "movie",
      title: r.title,
      meta: r.release_date ? r.release_date.slice(0, 4) : "Unknown year",
    }));

  const tvResults: TmdbSearchResult[] = tv.results.slice(0, 6).map((r) => ({
    id: r.id,
    mediaType: "tv",
    title: r.name,
    meta: r.first_air_date
      ? `${r.first_air_date.slice(0, 4)} · TV`
      : "TV series",
  }));

  return [...movieResults, ...tvResults];
}

export async function createCategoryAction(title: string, color?: string) {
  const { db: database } = db();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const category = await createCategory(database, {
    title: trimmed,
    color: color ?? null,
  });
  revalidatePath("/admin");
  return category;
}

async function addItem(input: {
  title: string;
  categoryId: number | null;
  description?: string;
  elo?: number;
}) {
  const { db: database } = db();
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
  return addItem(input);
}

export async function confirmDraftItemAction(input: {
  title: string;
  categoryId: number | null;
  elo: number;
  description?: string;
}) {
  return addItem(input);
}

export async function deleteItemAction(itemId: number) {
  const { db: database } = db();
  await deleteItemCascade(database, itemId);
  revalidatePath("/admin");
}

export async function updateItemAction(input: {
  itemId: number;
  title: string;
  categoryId: number | null;
  elo: number;
}) {
  const { db: database } = db();
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
  const { db: database } = db();
  await logMatch(database, winnerId, loserId);
  revalidatePath("/admin");
}
