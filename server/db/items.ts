import { desc, eq, inArray, or } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { TopItem } from "@/lib/rank-data";
import { deleteById, insertRow, selectAll, selectCount } from "./crud";
import { getMatchesWithItemTitles } from "./elo";
import { assets, categories, eloRecords, items, matches } from "./schema";

type NewItem = typeof items.$inferInsert;

export function createItem(db: DrizzleD1Database, data: NewItem) {
  return insertRow(db, items, data);
}

export function getAllItems(db: DrizzleD1Database) {
  return selectAll(db, items);
}

export function deleteItem(db: DrizzleD1Database, itemId: number) {
  return deleteById(db, items, itemId);
}

/**
 * Deletes an item along with everything that references it — its preview
 * asset link, its own assets, its elo record, and any matches it appears
 * in — so the roster doesn't accumulate orphaned rows after an admin
 * delete. The preview_asset_id/assets.item_id pair is circular, so the
 * item's preview link is cleared before its assets are dropped.
 */
export function deleteItemCascade(db: DrizzleD1Database, itemId: number) {
  return db.batch([
    db
      .update(items)
      .set({ preview_asset_id: null })
      .where(eq(items.id, itemId)),
    db.delete(assets).where(eq(assets.item_id, itemId)),
    db
      .delete(matches)
      .where(or(eq(matches.winner_id, itemId), eq(matches.loser_id, itemId))),
    db.delete(eloRecords).where(eq(eloRecords.item_id, itemId)),
    db.delete(items).where(eq(items.id, itemId)),
  ]);
}

export async function getItemCount(db: DrizzleD1Database): Promise<number> {
  return selectCount(db, items);
}

export async function getPreviewAssetsForItems(
  db: DrizzleD1Database,
  itemIds: number[],
): Promise<{ href: string | null }[]> {
  return await db
    .select({ id: items.id, href: assets.href })
    .from(items)
    .innerJoin(assets, eq(assets.id, items.preview_asset_id))
    .where(inArray(items.id, itemIds));
}

export async function getTopItem(db: DrizzleD1Database): Promise<TopItem> {
  const result = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      category: categories.title,
      elo: eloRecords.elo,
      previewAssetHref: assets.href,
    })
    .from(items)
    .innerJoin(eloRecords, eq(eloRecords.item_id, items.id))
    .orderBy(desc(eloRecords.elo))
    .limit(1)
    .leftJoin(categories, eq(items.category_id, categories.id))
    .leftJoin(assets, eq(assets.id, items.preview_asset_id));

  const topId = result[0].id;

  const recentMatches = await getMatchesWithItemTitles(db, {
    itemId: topId,
    limit: 3,
  });

  const formattedMatches = recentMatches.map((match) => ({
    label:
      match.winnerId === topId
        ? `beat ${match.loser}`
        : `lost to ${match.winner}`,
    result: match.winnerId === topId ? "win" : ("loss" as "win" | "loss"),
  }));

  return {
    title: result[0].title ?? "Untitled",
    description: result[0].description ?? "",
    category: result[0].category ?? "No category",
    elo: result[0].elo ?? 0,
    previewAssetHref: result[0].previewAssetHref,
    matches: formattedMatches,
  };
}
