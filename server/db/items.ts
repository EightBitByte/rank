import type { DrizzleD1Database } from "drizzle-orm/d1";
import { deleteById, insertRow, selectAll } from "./crud";
import { items } from "./schema";

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
