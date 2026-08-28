import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { deleteById, insertRow } from "./crud";
import { assets } from "./schema";

type NewAsset = typeof assets.$inferInsert;

export function createAsset(db: DrizzleD1Database, data: NewAsset) {
  return insertRow(db, assets, data);
}

export function getAssets(db: DrizzleD1Database, itemId: number) {
  return db.select().from(assets).where(eq(assets.item_id, itemId));
}

export function deleteAsset(db: DrizzleD1Database, assetId: number) {
  return deleteById(db, assets, assetId);
}
