import { eq, inArray, or } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { deleteById, insertRow, selectAll, selectCount } from "./crud";
import { assets, eloRecords, items, matches } from "./schema";

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
  return db
    .select({ id: items.id, href: assets.href })
    .from(items)
    .innerJoin(assets, eq(assets.item_id, items.id))
    .where(inArray(items.id, itemIds));
}
